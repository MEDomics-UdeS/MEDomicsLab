package input

import (
	Utils "go_module/src"
	"log"
)

var prePath = "input"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc() {
	Utils.CreateHandleFunc(prePath+"/merge_datasets_DB/", handleMergeDB)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
	Utils.CreateHandleFunc(prePath+"/cleanDB/", handleCleanDB)
	Utils.CreateHandleFunc(prePath+"/create_holdout_set_DB/", handleCreateHoldoutSetDB)
	Utils.CreateHandleFunc(prePath+"/compute_eigenvaluesDB/", handleComputeEigenvaluesDB)
	Utils.CreateHandleFunc(prePath+"/create_pcaDB/", handleCreatePCADB)
	Utils.CreateHandleFunc(prePath+"/apply_pcaDB/", handleApplyPCADB)
	Utils.CreateHandleFunc(prePath+"/compute_correlationsDB/", handleComputeCorrelationsDB)
	Utils.CreateHandleFunc(prePath+"/compute_spearmanDB/", handleComputeSpearmanDB)
	Utils.CreateHandleFunc(prePath+"/create_tags/", handleCreateTags)
	Utils.CreateHandleFunc(prePath+"/delete_tag_from_column/", handleDeleteTagFromColumn)
}


// handleMerge handles the request to merge the datasets for the DB
// It returns the response from the python script
func handleMergeDB(jsonConfig string, id string) (string, error) {
	log.Println("Merging datasets DB...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/mergeDB.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleCreateHoldoutSet handles the request to create the holdout set
// It returns the response from the python script
func handleCreateHoldoutSetDB(jsonConfig string, id string) (string, error) {
	log.Println("Creating holdout set DB...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/create_holdout_set_DB.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleCleanDB handles the request to clean the DB
// It returns the response from the python script
func handleCleanDB(jsonConfig string, id string) (string, error) {
	log.Println("Cleaning DB...", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/cleanDB.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}


// handleComputeEigenvaluesDB handles the request to compute the eigenvalues for the DB
// It returns the response from the python script
func handleComputeEigenvaluesDB(jsonConfig string, id string) (string, error) {
	log.Println("Compute Eigenvalues", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/compute_eigenvaluesDB.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}


// handleCreatePCADB handles the request to compute pca for the db
// It returns the response from the python script
func handleCreatePCADB(jsonConfig string, id string) (string, error) {
	log.Println("Create PCA", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/create_pcaDB.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}


// handleApplyPCA handles the request to compute pca with DB
// It returns the response from the python script
func handleApplyPCADB(jsonConfig string, id string) (string, error) {
	log.Println("Create PCA", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/apply_pcaDB.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}


// handleComputeCorrelations handles the request to compute correlations for the DB
// It returns the response from the python script
func handleComputeCorrelationsDB(jsonConfig string, id string) (string, error) {
	log.Println("Compute Correlations", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/compute_correlationsDB.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}


// handleComputeSpearman handles the request to compute Spearman for the DB
// It returns the response from the python script
func handleComputeSpearmanDB(jsonConfig string, id string) (string, error) {
	log.Println("Compute Spearman", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/compute_spearmanDB.py", id)
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

// handleCreateTags handles the request to create the tags for the DB
// It returns the response from the python script
func handleCreateTags(jsonConfig string, id string) (string, error) {
	log.Println("Compute Tags Creation", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/create_tags.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleDeleteTagFromColumn handles the request to tag deletion for the DB
// It returns the response from the python script
func handleDeleteTagFromColumn(jsonConfig string, id string) (string, error) {
	log.Println("Compute Tag Deletion", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/delete_tag_from_column.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}
