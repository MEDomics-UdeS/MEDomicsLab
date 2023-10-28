package main

import (
	"encoding/json"
	"fmt"
	"github.com/rs/cors"
	Evaluation "go_module/blueprints/evaluation"
	Learning "go_module/blueprints/learning"
	Utils "go_module/src"
	"net/http"
)

func main() {
	// Here is where you add the handle functions to the server
	Learning.AddHandleFunc()
	Evaluation.AddHandleFunc()
	Utils.CreateHandleFunc("get_server_health", handleGetServerHealth, true)

	// Here is where you start the server
	c := cors.Default()
	handler := c.Handler(http.DefaultServeMux)
	port := Utils.GetDotEnvVariable("PORT")
	fmt.Println("Server is listening on :" + port + "...")
	err := http.ListenAndServe(":"+port, handler)
	if err != nil {
		fmt.Println("Error starting server: ", err)
		return
	}
}

func handleGetServerHealth(jsonConfig string, id string) (string, error) {
	Utils.Mu.Lock()
	states := Utils.Scripts
	Utils.Mu.Unlock()
	data := make(map[string]string)
	for key, value := range states {
		data[key], _ = convScript2JsonStr(value)
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	fmt.Println("Server health: " + string(jsonData))
	return string(jsonData), nil
}

func convScript2JsonStr(script Utils.ScriptInfo) (string, error) {
	data := make(map[string]string)
	data["ProcessState"] = script.Cmd.ProcessState.String()
	data["progress"] = script.Progress
	jsonData, _ := Utils.Map2jsonStr(data)
	return string(jsonData), nil
}
