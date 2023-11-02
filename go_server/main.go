package main

import (
	"encoding/json"
	"fmt"
	"github.com/rs/cors"
	Evaluation "go_module/blueprints/evaluation"
	Learning "go_module/blueprints/learning"
	Utils "go_module/src"
	"log"
	"net/http"
)

func main() {

	// Here is where you add the handle functions to the server
	Learning.AddHandleFunc()
	Evaluation.AddHandleFunc()
	Utils.CreateHandleFunc("get_server_health", handleGetServerHealth)
	Utils.CreateHandleFunc("removeId/", handleRemoveId)
	Utils.CreateHandleFunc("clearAll", handleClearAll)

	// Here is where you start the server
	c := cors.Default()
	handler := c.Handler(http.DefaultServeMux)
	port := Utils.GetDotEnvVariable("PORT")
	log.Println("Server is listening on :" + port + "...")
	err := http.ListenAndServe(":"+port, handler)
	if err != nil {
		log.Println("Error starting server: ", err)
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
	// check number of keys in map
	numKeys := len(states)
	log.Printf("Server health: %d active processes", numKeys)
	return string(jsonData), nil
}

func convScript2JsonStr(script Utils.ScriptInfo) (string, error) {
	data := make(map[string]string)
	//data["info"] = script.Cmd.String()
	data["progress"] = script.Progress
	jsonData, _ := Utils.Map2jsonStr(data)
	return jsonData, nil
}

func handleRemoveId(jsonConfig string, id string) (string, error) {
	ok := Utils.KillScript(id)
	Utils.RemoveIdFromScripts(id)
	return "Removed successfully state : " + fmt.Sprint(ok), nil
}

func handleClearAll(jsonConfig string, id string) (string, error) {
	Utils.ClearAllScripts()
	return "Removed all states successfully", nil
}
