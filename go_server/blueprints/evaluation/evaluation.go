package evaluation

import (
	Utils "go_module/src"
	"log"
	"strconv"
)

var prePath = "evaluation"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/open_dashboard/", handleOpenDashboard)
	Utils.CreateHandleFunc(prePath+"/close_dashboard/", handleCloseDashboard)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
	Utils.CreateHandleFunc(prePath+"/predict_test/", handlePredictTest)
}

// handleOpenDashboard handles the request to open the dashboard
// It returns the response from the python script
func handleOpenDashboard(jsonConfig string, id string) (string, error) {
	log.Println("Running dashboard...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/evaluation/open_dashboard.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	log.Println("Dashboard opened finished successfully with response: ", response)
	return response, nil
}

// handleCloseDashboard handles the request to close the dashboard
// It returns the response from the python script
func handleCloseDashboard(jsonConfig string, id string) (string, error) {
	ok := Utils.KillScript(id)
	return "closed successfully. killing script status: " + strconv.FormatBool(ok), nil
}

// handleProgress handles the request to get the progress of the experiment
// It returns the progress of the experiment
func handleProgress(jsonConfig string, id string) (string, error) {
	Utils.Mu.Lock()
	script, ok := Utils.Scripts[id]
	Utils.Mu.Unlock()
	progress := ""
	if ok {
		progress = script.Progress
	}
	if progress != "" {
		return progress, nil
	} else {
		return "{\"now\":\"0\", \"currentLabel\":\"Warming up\"}", nil
	}
}

// handlePredictTest handles the request to run the predict test
// It returns the response from the python script
func handlePredictTest(jsonConfig string, id string) (string, error) {
	log.Println("Running predict test...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/evaluation/predict_test.py", id)
	if err != nil {
		return "", err
	}
	Utils.RemoveIdFromScripts(id)
	return response, nil
}
