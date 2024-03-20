package learningMEDimage

import (
	Utils "go_module/utils"
)

var prePath string = "learning_MEDimage"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/run_all", handleRunExperiment, true)
}

// handleRunExperiment handles the request to run an experiment
// It returns the response from the python script
func handleRunExperiment(jsonConfig string) (string, error) {
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/learning_MEDimage/scripts/run_all_learning.py")
	if err != nil {
		return "", err
	}
	return response, nil
}
