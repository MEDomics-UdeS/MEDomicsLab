package med3pa

import (
	Utils "go_module/src"
	"log"
)

var prePath = "med3pa"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/hello_world/", handleHelloWorld)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
}

// handleStartSweetviz handles the request to run a sweetviz analysis
// It returns the response from the python script
func handleHelloWorld(jsonConfig string, id string) (string, error) {
	log.Println("Hello World MED3pa...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/med3pa/hello_world_med3pa.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleProgress handles the request to get the progress of the experiment
// It returns the progress of the experiment
func handleProgress(jsonConfig string, id string) (string, error) {
	Utils.Mu.Lock()
	progress := Utils.Scripts[id].Progress
	Utils.Mu.Unlock()
	if progress != "" {
		return progress, nil
	} else {
		return "{\"now\":\"0\", \"currentLabel\":\"Warming up\"}", nil
	}
}
