package extractionMEDimage

import (
	Utils "go_module/src"
	"log"
)

var prePath = "extraction_MEDimage"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/run_all", handleRunAll)
	Utils.CreateHandleFunc(prePath+"/upload", handleGetUpload)
}

// handleRunAll handles the request to run extraction using all nodes
// It returns the response from the python script
func handleRunAll(jsonConfig string, id string) (string, error) {
	log.Println("Running all extraction MEDimage", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/extraction_MEDimage/run_all_extraction.py", id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleGetUpload handles the request to run extraction using all nodes
// It returns the response from the python script
func handleGetUpload(jsonConfig string, id string) (string, error) {
	log.Println("Running get upload for MEDimage extraction", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/extraction_MEDimage/get_upload.py", id)
	if err != nil {
		return "", err
	}
	return response, nil
}
