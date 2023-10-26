package utils

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

// RequestData is the data sent in the request
type RequestData struct {
	Message string `json:"message"`
}

// ResponseData is the data sent in the response
type ResponseData struct {
	Response string `json:"response_message"`
	Type     string `json:"type"`
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
	fmt.Println("Data: " + string(request))
	if err != nil {
		http.Error(w, "Failed to parse JSON request body", http.StatusBadRequest)
		return "", err
	}
	return data["message"].(string), nil
}

type Progress struct {
	Progress string
}

// CreateHandleFunc creates the handle function for the server
func CreateHandleFunc(topic string, processRequest func(jsonConfig string) (string, error), isThreaded bool, progress *map[string]string) {
	fmt.Println("Adding handle func for topic: " + topic)
	http.HandleFunc("/"+topic, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method. Only POST is allowed.", http.StatusMethodNotAllowed)
			return
		}

		// Read and reset the request body
		fmt.Println("Reading request body")
		savedRequestBody, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}
		fmt.Println("Request body: " + string(savedRequestBody))

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

				processResponse, err = processRequest(jsonConfig)
				if err != nil {
					http.Error(w, "Failed to process request", http.StatusInternalServerError)
					return
				}
				defer wg.Done()
			}(&wg)
			wg.Add(1)
			go func(wg *sync.WaitGroup) {
				startUDPServer("5008", progress)
				defer wg.Done()
			}(&wg)
			wg.Wait()
			fmt.Println("Done")
		} else {
			processResponse, err = processRequest(jsonConfig)
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

// StartPythonScript starts a python script
// It takes the json param and the filename of the script in input
// It returns the response from the script
func StartPythonScript(jsonParam string, filename string) (string, error) {
	fmt.Println("Starting python script: " + filename)
	condaEnv := GetDotEnvVariable("CONDA_ENV")
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	fmt.Println("Conda env: " + condaEnv)
	script, _ := filepath.Abs(filepath.Join(cwd, filename))
	cmd := exec.Command(condaEnv, script, "--json-param", jsonParam)
	fmt.Println("Command: " + cmd.String())
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Println("Error getting stdout pipe")
		panic(err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		fmt.Println("Error getting stderr pipe")
		panic(err)
	}
	err = cmd.Start()
	if err != nil {
		fmt.Println("Error starting command " + script + " " + condaEnv)
		panic(err)
	}
	response := ""
	go copyOutput(stdout, &response)
	go copyOutput(stderr, &response)
	err = cmd.Wait()
	if err != nil {
		return "", err
	}
	//fmt.Println("Script finished returning response: " + response)
	return response, nil
}

// It is used to transfer stdout and stderr to the terminal
func copyOutput(r io.Reader, response *string) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		if scanner.Text() == "response-incoming" {
			text := scanner.Text()
			for text != "response-finished" {
				scanner.Scan()
				text = scanner.Text()
				//fmt.Println("response", text)
				if text != "response-finished" {
					*response = *response + text
				}
			}
		} else if scanner.Text() == "response-ready" {
			scanner.Scan()
			path := scanner.Text()
			*response = ReadFile(path)
			//	delete this file
			err := os.Remove(path)
			if err != nil {
				fmt.Println(err)
			}
		} else {
			fmt.Println(scanner.Text())
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
