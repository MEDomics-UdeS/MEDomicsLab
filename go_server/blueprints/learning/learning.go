package learning

import (
	Utils "go_module/src"
	"log"
)

var prePath = "learning"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/run_experiment/", handleRunExperiment)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
}

// handleRunExperiment handles the request to run an experiment
// It returns the response from the python script
func handleRunExperiment(jsonConfig string, id string) (string, error) {
	log.Println("Running experiment...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../flask_server/learning/scripts/run_experiment.py", id)
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
