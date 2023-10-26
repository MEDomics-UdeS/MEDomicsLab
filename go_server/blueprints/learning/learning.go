package learning

import (
	"fmt"
	Utils "go_module/utils"
)

var prePath string = "learning"

var scriptProgress = make(map[string]string)

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/run_experiment", handleRunExperiment, true, &scriptProgress)
	Utils.CreateHandleFunc(prePath+"/progress", handleProgress, true, &scriptProgress)
}

// handleRunExperiment handles the request to run an experiment
// It returns the response from the python script
func handleRunExperiment(jsonConfig string) (string, error) {
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/learning/scripts/run_experiment.py")
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleProgress handles the request to get the progress of the experiment
// It returns the progress of the experiment
func handleProgress(jsonConfig string) (string, error) {
	fmt.Println("Getting progress for config: " + jsonConfig)
	if scriptProgress[jsonConfig] == "" {
		mapJson := map[string]string{
			"now":          "0",
			"currentLabel": "running",
		}
		scriptProgress[jsonConfig], _ = Utils.Map2jsonStr(mapJson)
	}
	return scriptProgress[jsonConfig], nil
}
