package MEDprofiles

import (
	Utils "go_module/src"
	"log"
)

var prePath = "MEDprofiles"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/create_master_table/", handleCreateMasterTable)
	Utils.CreateHandleFunc(prePath+"/create_MEDclasses/", handleCreateMEDclasses)
	Utils.CreateHandleFunc(prePath+"/create_MEDprofiles_folder/", handleCreateMEDprofilesFolder)
	Utils.CreateHandleFunc(prePath+"/get_master_csv/", handleGetMasterCsv)
	Utils.CreateHandleFunc(prePath+"/initialize_MEDprofiles_instantiation/", handleCreateInitializeMEDprofilesInstantiation)
	Utils.CreateHandleFunc(prePath+"/instantiate_MEDprofiles/", handleCreateInstantiateMEDprofiles)
	Utils.CreateHandleFunc(prePath+"/load_pickle_cohort/", handleLoadPickleCohort)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
}

// handleCreateMasterTable handles the request to create a master table
// It returns the response from the python script
func handleCreateMasterTable(jsonConfig string, id string) (string, error) {
	log.Println("Running master table creation", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/MEDprofiles_/create_master_table.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleCreateMEDclasses handles the request to create MEDclasses
// It returns the response from the python script
func handleCreateMEDclasses(jsonConfig string, id string) (string, error) {
	log.Println("Running MEDclasses creation", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/MEDprofiles_/create_MEDclasses.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleCreateMEDprofilesFolder handles the request to create the MEDprofiles folder
// It returns the response from the python script
func handleCreateMEDprofilesFolder(jsonConfig string, id string) (string, error) {
	log.Println("Running MEDprofiles folder creation", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/MEDprofiles_/create_MEDprofiles_folder.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleGetMasterCsv handles the request to get master csvs files
// It returns the response from the python script
func handleGetMasterCsv(jsonConfig string, id string) (string, error) {
	log.Println("Running get master csv", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/MEDprofiles_/get_master_csv.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleCreateInstantiateMEDprofiles handles the request to initialize the MEDprofiles instantiation
// It returns the response from the python script
func handleCreateInitializeMEDprofilesInstantiation(jsonConfig string, id string) (string, error) {
	log.Println("Running MEDprofiles data instantiation initialization", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/MEDprofiles_/initialize_MEDprofiles_instantiation.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleCreateInstantiateMEDprofiles handles the request to instantiate the MEDprofiles data
// It returns the response from the python script
func handleCreateInstantiateMEDprofiles(jsonConfig string, id string) (string, error) {
	log.Println("Running MEDprofiles data instantiation", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/MEDprofiles_/instantiate_MEDprofiles.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleLoadPickleCohort handles the request to load the pickle cohort
// It returns the response from the python script
func handleLoadPickleCohort(jsonConfig string, id string) (string, error) {
	log.Println("Running loading pickle cohort", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/MEDprofiles_/load_pickle_cohort.py", id)
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
