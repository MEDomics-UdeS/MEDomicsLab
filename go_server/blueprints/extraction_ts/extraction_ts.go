package extraction_ts

import (
	Utils "go_module/src"
	"log"
)

var prePath = "extraction_ts"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/initialize_TSfresh_extraction/", handleInitializeTSfreshExtraction)
	Utils.CreateHandleFunc(prePath+"/TSfresh_extraction/", handleTSfreshExtraction)
	Utils.CreateHandleFunc(prePath+"/to_master_TSfresh_extraction/", handleToMasterTSfreshExtraction)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
}

// handleInitializeTSfreshExtraction handles the request to run a TSfresh extraction intitailization
// It returns the response from the python script
func handleInitializeTSfreshExtraction(jsonConfig string, id string) (string, error) {
	log.Println("Running TSfresh extraction initialization", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/extraction_ts/initialize_TSfresh_extraction.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleTSfreshExtraction handles the request to run a TSfresh extraction
// It returns the response from the python script
func handleTSfreshExtraction(jsonConfig string, id string) (string, error) {
	log.Println("Running TSfresh extraction", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/extraction_ts/TSfresh_extraction.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleToMasterTSfreshExtraction handles the request to run format the result of a TSfresh extraction as submaster table
// It returns the response from the python script
func handleToMasterTSfreshExtraction(jsonConfig string, id string) (string, error) {
	log.Println("Running TSfresh extraction to master format", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/extraction_ts/to_master_TSfresh_extraction.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleProgress handles the request to get the progress of the execution
// It returns the progress of the execution
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
