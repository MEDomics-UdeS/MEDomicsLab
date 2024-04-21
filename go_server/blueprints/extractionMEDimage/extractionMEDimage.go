package extractionMEDimage

import (
	Utils "go_module/utils"
)

var prePath string = "extraction_MEDimage"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/run_all", handleRunAll, true)
	Utils.CreateHandleFunc(prePath+"/upload", handleGetUpload, true)
}

// handleRunAll handles the request to run extraction using all nodes
// It returns the response from the python script
func handleRunAll(jsonConfig string) (string, error) {
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/extraction_MEDimage/scripts/run_all_extraction.py")
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleGetUpload handles the request to run extraction using all nodes
// It returns the response from the python script
func handleGetUpload(jsonConfig string) (string, error) {
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/extraction_MEDimage/scripts/get_upload.py")
	if err != nil {
		return "", err
	}
	return response, nil
}
