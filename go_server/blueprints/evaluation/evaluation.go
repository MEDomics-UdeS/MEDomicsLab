package evaluation

import (
	"fmt"
	Utils "go_module/src"
)

var prePath = "evaluation"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/open_dashboard/", handleOpenDashboard, true)
	Utils.CreateHandleFunc(prePath+"/close_dashboard/", handleCloseDashboard, true)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress, true)
	Utils.CreateHandleFunc(prePath+"/predict_test/", handlePredictTest, true)
}

// handleOpenDashboard handles the request to open the dashboard
// It returns the response from the python script
func handleOpenDashboard(jsonConfig string, id string) (string, error) {
	fmt.Println("Running dashboard...", id)
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/evaluation/scripts/open_dashboard.py", id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleCloseDashboard handles the request to close the dashboard
// It returns the response from the python script
func handleCloseDashboard(jsonConfig string, id string) (string, error) {
	Utils.Mu.Lock()
	_, ok := Utils.Scripts[id]
	if ok {
		err := Utils.Scripts[id].Cmd.Process.Kill()
		if err != nil {
			return "", err
		}
	}
	Utils.Mu.Unlock()
	Utils.RemoveIdFromScripts(id)
	return "closed successfully", nil
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

func handlePredictTest(jsonConfig string, id string) (string, error) {
	fmt.Println("Running predict test...", id)
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/learning/scripts/predict_test.py", id)
	if err != nil {
		return "", err
	}
	Utils.RemoveIdFromScripts(id)
	return response, nil
}
