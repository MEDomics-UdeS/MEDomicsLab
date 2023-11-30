package input

import (
	Utils "go_module/src"
	"log"
)

var prePath = "input"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/merge_datasets/", handleMerge)
	Utils.CreateHandleFunc(prePath+"/create_holdout_set/", handleCreateHoldoutSet)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
}

// handleMerge handles the request to merge the datasets 
// It returns the response from the python script
func handleMerge(jsonConfig string, id string) (string, error) {
	log.Println("Merging datasets...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/merge.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}


// handleCreateHoldoutSet handles the request to create the holdout set
// It returns the response from the python script
func handleCreateHoldoutSet(jsonConfig string, id string) (string, error) {
	log.Println("Creating holdout set...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/create_holdout_set.py", id)
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
