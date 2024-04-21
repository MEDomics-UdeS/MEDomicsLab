package learningMEDimage

import (
	Utils "go_module/src"
	"log"
)

var prePath = "learning_MEDimage"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/run_all", handleRunExperiment)
}

// handleRunExperiment handles the request to run an experiment
// It returns the response from the python script
func handleRunExperiment(jsonConfig string, id string) (string, error) {
	log.Println("Running MEDimage experiment...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/learning_MEDimage/run_all_learning.py", id)
	if err != nil {
		return "", err
	}
	return response, nil
}
