package exploratory

import (
	Utils "go_module/src"
	"log"
)

var prePath = "exploratory"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/start_sweetviz/", handleStartSweetviz)
	Utils.CreateHandleFunc(prePath+"/start_ydata_profiling/", handleStartYDataProfiling)
	Utils.CreateHandleFunc(prePath+"/start_dtale/", handleStartDtale)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
}

// handleStartSweetviz handles the request to run a sweetviz analysis
// It returns the response from the python script
func handleStartSweetviz(jsonConfig string, id string) (string, error) {
	log.Println("Start Sweetviz...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../flask_server/exploratory/scripts/start_sweetviz.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleStartYDataProfiling handles the request to run a ydata profiling analysis
// It returns the response from the python script
func handleStartYDataProfiling(jsonConfig string, id string) (string, error) {
	log.Println("Start YData Profiling...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../flask_server/exploratory/scripts/start_ydata_profiling.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleStartDtale handles the request to run a dtale analysis
// It returns the response from the python script
func handleStartDtale(jsonConfig string, id string) (string, error) {
	log.Println("Start Dtale...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../flask_server/exploratory/scripts/start_dtale.py", id)
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
