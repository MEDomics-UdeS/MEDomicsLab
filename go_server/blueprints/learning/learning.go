package learning

import (
	Utils "go_module/utils"
)

var prePath string = "learning"

func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/run_experiment", handleRunExperiment, true)
}

func handleRunExperiment(jsonConfig string) (string, error) {
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/learning/scripts/run_experiment.py")
	if err != nil {
		return "", err
	}
	return response, nil
}
