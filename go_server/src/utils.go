package src

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
)

type ScriptInfo struct {
	Cmd      *exec.Cmd
	Progress string
}

var Mu sync.Mutex // guards balance
var Scripts = make(map[string]ScriptInfo)

// RequestData is the data sent in the request
type RequestData struct {
	Message string `json:"message"`
}

// ResponseData is the data sent in the response
type ResponseData struct {
	Response string `json:"response_message"`
	Type     string `json:"type"`
}

// Progress is the data sent in the progress response
type Progress struct {
	Progress string
}

// CreateResponse creates the response data sent to the client side
// It returns the response data
func CreateResponse(requestData map[string]interface{}) ResponseData {
	var toParse string = ""
	if requestData["message"] != nil && strings.Contains(requestData["message"].(string), "{") {
		toParse = "toParse"
	} else {
		toParse = "notToParse"
	}
	response := ResponseData{
		Response: requestData["message"].(string),
		Type:     toParse,
	}
	return response
}

// JsonStr2map converts a json string to a map
func JsonStr2map(jsonStr string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := json.Unmarshal([]byte(jsonStr), &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Map2jsonStr converts a map to a json string
func Map2jsonStr(data map[string]string) (string, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}

// GetConfigFromMessage gets the config json from the message in input
func GetConfigFromMessage(w http.ResponseWriter, request []byte) (string, error) {
	data, err := JsonStr2map(string(request))
	if err != nil {
		http.Error(w, "Failed to parse JSON request body", http.StatusBadRequest)
		return "", err
	}
	return data["message"].(string), nil
}

// CreateHandleFunc creates the handle function for the server
func CreateHandleFunc(topic string, processRequest func(jsonConfig string, id string) (string, error), isThreaded bool) {
	fmt.Println("Adding handle func for topic: " + topic)
	http.HandleFunc("/"+topic, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method. Only POST is allowed.", http.StatusMethodNotAllowed)
			return
		}
		id := strings.ReplaceAll(r.URL.Path, "/"+topic, "")
		_, _ = fmt.Fprintf(os.Stdout, "id: \"%s\"\n", id)
		// Read and reset the request body
		savedRequestBody, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}

		r.Body = io.NopCloser(bytes.NewBuffer(savedRequestBody))

		// Decode the request body
		jsonConfig, err := GetConfigFromMessage(w, savedRequestBody)
		if err != nil {
			http.Error(w, "Failed to parse JSON request body", http.StatusBadRequest)
			return
		}

		// Process the request on a separate thread if needed
		var processResponse string
		var wg sync.WaitGroup
		if isThreaded {
			wg.Add(1)
			go func(wg *sync.WaitGroup) {
				processResponse, err = processRequest(jsonConfig, id)

				if err != nil {
					http.Error(w, "Failed to process request", http.StatusInternalServerError)
					return
				}
				defer wg.Done()
			}(&wg)
			wg.Wait()
			fmt.Println("Done")
		} else {
			processResponse, err = processRequest(jsonConfig, id)
			if err != nil {
				http.Error(w, "Failed to process request", http.StatusInternalServerError)
				return
			}
		}

		// Write the response
		response := CreateResponse(map[string]interface{}{
			"message": processResponse,
		})
		w.Header().Set("Content-Type", "application/json")
		encoder := json.NewEncoder(w)
		err = encoder.Encode(response)
		if err != nil {
			http.Error(w, "Failed to encode JSON response", http.StatusInternalServerError)
			return
		}

	})
}

func StartPythonScript(jsonParam string, filename string, id string) (string, error) {
	fmt.Println("Starting python script: " + filename)
	condaEnv := GetDotEnvVariable("CONDA_ENV")
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	fmt.Println("Conda env: " + condaEnv)
	script, _ := filepath.Abs(filepath.Join(cwd, filename))
	Mu.Lock()
	Scripts[id] = ScriptInfo{
		Cmd:      exec.Command(condaEnv, script, "--json-param", jsonParam, "--id", id),
		Progress: "",
	}
	fmt.Println("Command: " + Scripts[id].Cmd.String())
	stdout, err := Scripts[id].Cmd.StdoutPipe()
	Mu.Unlock()
	if err != nil {
		fmt.Println("Error getting stdout pipe")
		panic(err)
	}
	Mu.Lock()
	stderr, err := Scripts[id].Cmd.StderrPipe()
	Mu.Unlock()
	if err != nil {
		fmt.Println("Error getting stderr pipe")
		panic(err)
	}
	Mu.Lock()
	err = Scripts[id].Cmd.Start()
	Mu.Unlock()
	if err != nil {
		fmt.Println("Error starting command " + script + " " + condaEnv)
		panic(err)
	}
	response := ""
	go copyOutput(stdout, &response)
	go copyOutput(stderr, &response)
	err = Scripts[id].Cmd.Wait()
	if err != nil {
		return "", err
	}
	return response, nil
}

// It is used to transfer stdout and stderr to the terminal
func copyOutput(r io.Reader, response *string) {
	scanner := bufio.NewScanner(r)
	lineText := ""
	for scanner.Scan() {
		lineText = scanner.Text()
		if lineText == "response-incoming" {
			for lineText != "response-finished" {
				scanner.Scan()
				lineText = scanner.Text()
				//fmt.Println("response", text)
				if lineText != "response-finished" {
					*response = *response + lineText
				}
			}
		} else if lineText == "response-ready" {
			scanner.Scan()
			path := scanner.Text()
			*response = ReadFile(path)
			//	delete this file
			err := os.Remove(path)
			if err != nil {
				fmt.Println(err)
			}
		} else if strings.Contains(lineText, "progress*_*") {
			id := strings.Split(lineText, "*_*")[1]
			progress := strings.Split(lineText, "*_*")[2]
			Mu.Lock()
			Scripts[id] = ScriptInfo{
				Cmd:      Scripts[id].Cmd,
				Progress: progress,
			}
			Mu.Unlock()
		} else {
			fmt.Println(lineText)
		}
	}
}

// ReadFile reads a file and returns its content as a string
func ReadFile(filename string) string {
	absPath, _ := filepath.Abs(filename)
	fmt.Println("Reading file: " + absPath)
	data, err := os.ReadFile(absPath)
	if err != nil {
		log.Panicf("failed reading data from file: %s", err)
	}
	return string(data)
}

// GetDotEnvVariable gets the variable from the .env.local file or from env variables set by client side
func GetDotEnvVariable(key string) string {
	err := godotenv.Load(".env.local")
	if err != nil {
		return ""
	}
	electronKey := "ELECTRON_" + key
	if os.Getenv(electronKey) != "" {
		return os.Getenv(electronKey)
	} else {
		if key == "CONDA_ENV" {
			return ReadFile(os.Getenv(key))
		}
		return os.Getenv(key)
	}
}

func RemoveIdFromScripts(id string) {
	Mu.Lock()
	delete(Scripts, id)
	Mu.Unlock()
}
