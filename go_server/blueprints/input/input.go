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
	Utils.CreateHandleFunc(prePath+"/compute_eigenvalues/", handleComputeEigenvalues)
	Utils.CreateHandleFunc(prePath+"/create_pca/", handleCreatePCA)
	Utils.CreateHandleFunc(prePath+"/apply_pca/", handleApplyPCA)
	Utils.CreateHandleFunc(prePath+"/compute_correlations/", handleComputeCorrelations)
	Utils.CreateHandleFunc(prePath+"/compute_spearman/", handleComputeSpearman)
	Utils.CreateHandleFunc(prePath+"/clean/", handleClean)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress)
	Utils.CreateHandleFunc(prePath+"/cleanDB/", handleCleanDB)
	Utils.CreateHandleFunc(prePath+"/create_holdout_set_DB/", handleCreateHoldoutSetDB)
	Utils.CreateHandleFunc(prePath+"/compute_eigenvaluesDB/", handleComputeEigenvaluesDB)
	Utils.CreateHandleFunc(prePath+"/create_pcaDB/", handleCreatePCADB)
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


// handleComputeEigenvalues handles the request to compute the eigenvalues
// It returns the response from the python script
func handleComputeEigenvalues(jsonConfig string, id string) (string, error) {
	log.Println("Compute Eigenvalues", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/compute_eigenvalues.py", id)
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


// handleCreatePCA handles the request to compute pca
// It returns the response from the python script
func handleCreatePCA(jsonConfig string, id string) (string, error) {
	log.Println("Create PCA", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/create_pca.py", id)
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

// handleApplyPCA handles the request to compute pca
// It returns the response from the python script
func handleApplyPCA(jsonConfig string, id string) (string, error) {
	log.Println("Create PCA", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/apply_pca.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleComputeCorrelations handles the request to compute correlations
// It returns the response from the python script
func handleComputeCorrelations(jsonConfig string, id string) (string, error) {
	log.Println("Compute Correlations", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/compute_correlations.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleComputeSpearman handles the request to compute Spearman
// It returns the response from the python script
func handleComputeSpearman(jsonConfig string, id string) (string, error) {
	log.Println("Compute Spearman", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/compute_spearman.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleClean handles the request to clean a dataset
// It returns the response from the python script
func handleClean(jsonConfig string, id string) (string, error) {
	log.Println("Clean", id)
	response, err := Utils.StartPythonScripts(jsonConfig, "../pythonCode/modules/input/clean.py", id)
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
