import json
import os
import pickle
import pprint
import shutil
from pathlib import Path

import pandas as pd

pp = pprint.PrettyPrinter(indent=2, compact=True, width=40, sort_dicts=False)  # allow pretty print of datatypes in console

import MEDimage
import ray

from .node import Node
from .pipeline import Pipeline as MEDpipeline
from .utils import *

# Global variables
UPLOAD_FOLDER = Path(os.path.dirname(os.path.abspath(__file__)))  / "tmp"

class ExtractionWorkflow:
    """
    Class to represent the extraction workflow of the MEDimage application as a list of pipelines.
    Each pipeline is a list of nodes, where each node is a step in the extraction workflow.
    Each pipeline must start with an input node, else the pipeline is not added to the extraction workflow.
    """
    def __init__(self, workflow: dict) -> None:
        """
        Constructor of the class ExtractionWorkflow
        
        Args:
            workflow (dict): The workflow configuration in the form of a dictionary.
        """
        self.pipelines = self.__get_pipelines(workflow)  
    
    def __generate_pipelines(self, node_id: str, workflow: dict, pipelines: list[MEDpipeline], nodes_list: list[Node]) -> None:
        """
        Recursive function to generate the pipelines of the extraction workflow starting from the node associated with node_id.
        Creates the nodes and pipelines objects and adds them to the pipelines list.

        Args:
            node_id (str): Id of the node to start the pipeline from (should be an input node).
            workflow (dict): The workflow configuration in the form of a dictionary.
            pipelines (list[MEDpipeline]): List of the pipeline objects in the extraction workflow.
            nodes_list (list[Node]): List of the nodes of the pipeline being generated.
            
        Returns:
            None.
        """
        # Get the home module from the drawflow scene
        home_module = workflow['Home']['data']

        # Add the node associated with node_id to the nodes_list
        if home_module[node_id]['name'] == 'extraction':
            # If the node is an extraction node, the node data is in a separate module
            # If there is no module associated with the node, no feature nodes are associated
            # with it, the node data is empty
            if 'extraction-' + str(node_id) not in workflow:
                node_data = {"data": {}}
            else:
                node_data = workflow['extraction-' + str(node_id)]
            node_data['name'] = 'extraction'
            node_data['id'] = node_id
        else:
            node_data = home_module[node_id]
        
        try:
            # Create the node object from the node data
            new_node = Node.create_node(node_data)
        except ValueError:
            raise
        
        nodes_list.append(new_node)
        
        # If the node has output nodes, generate the pipelines starting from the output nodes
        output_nodes = home_module[node_id]['outputs']
        if output_nodes:
            for output_node_id in output_nodes["output_1"]["connections"]:
                self.__generate_pipelines(output_node_id['node'], workflow, pipelines, nodes_list[:])
        else:
            # If there are no outputs it is a end node, so we create a pipeline from the nodes_list
            new_pipeline_id = len(pipelines) + 1
            
            # Create pipeline name from the node names according to old naming convention
            new_pipeline_name = "pip"
            for node in nodes_list:
                new_pipeline_name += "/" + node.id
            
            new_pipeline = MEDpipeline(nodes_list, new_pipeline_id, new_pipeline_name)
            pipelines.append(new_pipeline)
      
    def __get_pipelines(self, workflow: dict) -> list[MEDpipeline]:
        """
        Given the extraction workflow configuration in the form of a dictionary, generates a list of
        pipeline objects representing the extraction workflow.

        Args:
            workflow (dict): The workflow configuration in the form of a dictionary.

        Returns:
            list[MEDpipeline]: List of the pipeline objects in the extraction workflow.
        """
        # In the json config, get the drawflow scene
        drawflow_scene = workflow['drawflow']
        
        # In the drawflow scene, there is one Home module and zero or more extraction modules
        home_module = drawflow_scene['Home']['data']
        
        # Pass over all nodes in the home module. If the node doesnt have any inputs, is an input node, 
        # and has an uploaded file, it is the start of a pipeline
        pipelines = []
        for node_id in home_module:
            if not home_module[node_id]['inputs'] and home_module[node_id]['name'] == 'input' and home_module[node_id]['data']['filepath'] != "":
                self.__generate_pipelines(node_id, drawflow_scene, pipelines, []) # Generate the pipelines starting from an input node
        
        # Return the generated pipelines
        return pipelines

    def print_pipelines(self) -> None:
        """
        Temporary debug function to print the pipelines of the workflow using the 
        node ids.
        
        Args:
            None.
        
        Returns:
            None.
        """
        for pipeline in self.pipelines:
            print("Pipeline " + str(pipeline.id) + ": ")
            for node in pipeline.nodes:
                print(node.id)
            print("\n")  
    
    def run_pipelines(self, set_progress: dict, node_id: str = "all") -> dict:
        """
        Runs all the pipelines in the extraction workflow up to the node associated with
        node_id and collects the results in a dictionary.

        Args:
            set_progress (dict): Function to set the progress of a pipeline execution.
            node_id (str, optional): Id of the node to stop at in the pipelines.
                                     Defaults to "all" (running all the nodes in all the pipelines).

        Returns:
            dict: Dictionary of the results of the pipelines execution, with the filename as key and 
                  the pipeline name as sub key.
        """
        # Initialize the results dictionary
        results = {}
        
        # Get the pipelines containing the node associated with node_id
        node_pipelines = [pipeline for pipeline in self.pipelines if node_id == "all" or pipeline.contains_node(node_id)]
        
        # Go over each pipeline
        for idx, pipeline in enumerate(node_pipelines):
            
            # Run the pipeline
            res = pipeline.run(set_progress, node_id, idx+1)
            
            # Get the filepath associated with the pipeline
            filepath = pipeline.nodes[0].filepath  # A pipeline starts with an input node, the filepath is stored in the input node
            
            if filepath and filepath != "":
                if filepath not in results:
                    results[filepath] = {}
                    
                # Store the pipeline results in the results dictionary under the right filename and pipeline name    
                results[filepath][pipeline.pipeline_name] = res
        
        return results
    
    def get_node_pipeline(self, node_id: str) -> tuple[Node, MEDpipeline]:
        """
        From a node id, returns de node object and the first pipeline object it belongs to.

        Args:
            node_id (str): Id of the node to find.

        Returns:
            Tuple (Node, MEDpipeline): The node object and the first pipeline object it belongs to.
        """
        for pipeline in self.pipelines:
            for node in pipeline.nodes:
                if node.id == node_id:
                    return (node, pipeline)
        return (None, None)
    
    def update_workflow(self, new_workflow: "ExtractionWorkflow") -> None:
        """
        Updates the extraction workflow with a new one.
        
        Args:
            new_workflow (ExtractionWorkflow): The new extraction workflow to update with.
        
        Returns:
            None.
        """
        # Initialize the new pipelines list
        pipelines = []
        
        # Go over the pipelines of the new workflow
        for pipeline in new_workflow.pipelines:
            
            # If the pipeline is in the new workflow, but not in the current one, add it
            if pipeline not in self.pipelines:
                pipelines.append(pipeline)
            
            # The pipeline is already in the current workflow, update its parameters using new_workflow
            elif pipeline in self.pipelines:
                # Find the existing pipeline in self.pipelines
                for old_pipeline in self.pipelines:
                    if old_pipeline == pipeline:
                        old_pipeline.update_pipeline(pipeline)
                        pipelines.append(old_pipeline)
                        break
                
        # Update the pipelines attribute
        self.pipelines = pipelines


class MEDimageExtraction:
    def __init__(self, json_config: dict) -> None:
        self.json_config = json_config  # JSON config sent from the front end in the form of a dictionary
        self._progress = {'currentLabel': '', 'now': 0} # Progress of a pipeline execution.
        
        self.nb_runs = 0
        self.runs = {}

    def __update_upload_folder(self, upload_folder: Path) -> Path:
        """
        Updates the upload folder attribute of the extraction workflow.
        
        Args:
            upload_folder (str): The new upload folder.
        
        Returns:
            Path: The new upload folder.
        """
        global UPLOAD_FOLDER
        UPLOAD_FOLDER = upload_folder
        return UPLOAD_FOLDER
    
    def get_3d_view(self) -> dict:
        """
        Plots the 3D view of the volume and the ROI associated with a node.

        Args:
            None.
            
        Returns:
            dict: The success message if the 3D view was successfully plotted, else an error.
        """
        try:
            # Initialize variables
            extraction_workflow = None
            file_path = None

            # Set workspace
            if "workspace" in self.json_config and self.json_config["workspace"] != "":
                new_path = Path(self.json_config["workspace"]) / ".medomics" / "tmp"
                UPLOAD_FOLDER = self.__update_upload_folder(new_path)

                # Check if the workspace exists, if not create it
                if not os.path.isdir(UPLOAD_FOLDER):
                    return {"error": "The workspace path provided is not valid (.medomics/tmp/ folder is missing)"}
        
            # Verify if the extraction workflow object exists and load it
            if "extractionWorkflow.pkl" in os.listdir(UPLOAD_FOLDER):
                with open(os.path.join(UPLOAD_FOLDER, "extractionWorkflow.pkl"), 'rb') as f:
                    extraction_workflow = pickle.load(f)
            elif "file_loaded" in self.json_config and self.json_config["file_loaded"] != "":
                file_path = os.path.join(UPLOAD_FOLDER, self.json_config["file_loaded"])
            else:
                return {"error": "No file loaded and no extraction workflow found. Please load a file or run the extraction workflow before trying to visualize it."}
            
            if extraction_workflow:
                # Get the output of the node where the 3D view button was clicked
                node, pipeline = extraction_workflow.get_node_pipeline(self.json_config["id"])
                
                # If the node is an input node, and is not yet in the extraction workflow, use the file name to load the MEDimage object directly
                if node is None and self.json_config["name"] == "input" and "file_loaded" in self.json_config:
                    if self.json_config["file_loaded"] != "":
                        # Load the MEDimg object from the input file
                        with open(UPLOAD_FOLDER / self.json_config["file_loaded"], 'rb') as f:
                            MEDimg = pickle.load(f)
                        MEDimg = MEDimage.MEDscan(MEDimg)
                        
                        # Remove dicom header from MEDimg object as it causes errors in get_3d_view()
                        # TODO: check if dicom header is needed in the future
                        MEDimg.dicomH = None
                        
                        # View 3D image
                        image_viewer(MEDimg.data.volume.array, "Input image : " + self.json_config["file_loaded"])
                    else:
                        # In case the view button is clicked without uploading a file first
                        return {"error": "No file uploaded in input node."}
                # If the node is an input node in the extraction workflow, use it's output to plot the 3D view
                elif node is not None and node.name == "input":
                    image_viewer(node.output["vol"], "Input image : " + node.filepath)
                # If there is no node or there is no output for the node, it hasn't run yet
                elif node is None or node.output is None:
                    return {"error": "No volume was computed for this node. Please run the node first."}
                # For any other node in the extraction workflow, the output should have a volume and a ROI to plot the 3D view
                else:
                    node_output = node.output

                    # In case the view button was clicked without running the node first
                    # Or the volume couldn't be computed
                    if "vol" not in node_output or node_output["vol"] is None or "roi" not in node_output or node_output["roi"] is None:
                        return {"error": "No volume or ROI found in node output."}

                    # Figure name for the 3D view
                    fig_name = "Pipeline name: " + pipeline.pipeline_name + "<br>" + \
                            "Node id: " + node.id + "<br>" + \
                            "Node type: " + node.name + "\n" 
                    
                    # View 3D image
                    image_viewer(node_output["vol"], fig_name, node_output["roi"])

            elif file_path:
                # Load and store MEDimage instance from file loaded
                with open(file_path, 'rb') as f:
                    medscan = pickle.load(f)
                    medscan = MEDimage.MEDscan(medscan)
                
                # View 3D image
                image_viewer(medscan.data.volume.array, "Original Volume, Patient ID: " + medscan.patientID)

            # Return success message
            return {"success": "3D view successfully plotted."}
        
        except Exception as e:
            return {"error": str(e)}
    
    def get_upload(self) -> dict:
        """
        Gets the MEDimage associated with the file or folder and saves it to the UPLOAD_FOLDER.
        Returns the informations of the file uploaded.
        
        Args:
            None.

        Returns:
            dict: Dictionary with uploaded file information, or error if the file is not in the right format.
                  The dictionary contains the name of the file and the list of ROIs associated with the image.
        """
        try:
            # Check if the post request has the necessary informations
            if 'workspace' not in self.json_config and self.json_config['workspace'] == "":
                return {"error": "No workspace provided."}
            if 'file' not in self.json_config and self.json_config['file'] != "":
                return {"error": "No file found in the configuration dict."}
            elif 'type' not in self.json_config and self.json_config['type'] != "":
                return {"error": "No type found in the configuration dict."}
            
            # Initialize the dictionary to store the file informations
            up_file_infos = {}
            new_path = Path(self.json_config['workspace']) / ".medomics"
            
            # Check if the path exists and update it
            if not os.path.isdir(new_path):
                return {"error": "The workspace path provided is not valid (.medomics folder is missing)"}

            # Check if the tmp folder exists, if not create it
            new_path = new_path / "tmp"
            if not os.path.isdir(new_path): 
                os.makedirs(new_path) 
            UPLOAD_FOLDER = self.__update_upload_folder(new_path)
            
            file = self.json_config["file"] # Path of the file
            file_type = self.json_config["type"] # Type of file (folder or file)

            # If the file is a folder, process the DICOM scan
            if file_type == "folder":
                # Initialize the DataManager class
                dm = MEDimage.wrangling.DataManager(path_to_dicoms=file, path_save=UPLOAD_FOLDER, n_batch=2, save=True)

                # Process the DICOM scan
                os.environ['RAY_DISABLE_MEMORY_MONITOR'] = '1'
                dm.process_all_dicoms()

                # Ray shutdown for safety
                ray.shutdown()

                # Get the path to the file created by MEDimage
                file = dm.path_to_objects[0]

            # Check if the file is a valid pickle object
            if file and allowed_pickle_object(file):
                filename = os.path.basename(file)
                file_path = os.path.join(UPLOAD_FOLDER, filename)

                # If the file is a .npy object and therefore has been processed by MEDimage, copy it to the UPLOAD_FOLDER
                if file_type == "file":
                    shutil.copy2(file, file_path)

                # Load the MEDimage pickle object to get the list of ROIs associated
                with open(file_path, 'rb') as f:
                    medscan = pickle.load(f)
                medscan = MEDimage.MEDscan(medscan)
                rois_list = medscan.data.ROI.roi_names
                
                # Return informations of instance loaded
                up_file_infos["name"] = filename
                up_file_infos["rois_list"] = rois_list
                return up_file_infos
            else:
                return {"error": "The file you tried to upload doesn't have the right format."}
            
        except Exception as e:
            return {"error": str(e)}
    
    def run(self) -> dict:
        """
        Runs all the pipeline(s) in the extraction workflow containing a node up to said node.
        Returns the results of the pipeline(s) execution. 

        Args:
            None.
        
        Returns:
            dict: Dictionary with the results of the pipeline(s) execution.
        """
        try:
            # Initialize variables
            if "id" not in self.json_config:
                node_id = "all"
                json_scene = self.json_config
            else:
                node_id = self.json_config["id"]
                json_scene = self.json_config["json_scene"]
            
            # Check and set worksapce
            if "workspace" in self.json_config and self.json_config["workspace"] != "":
                new_path = Path(self.json_config["workspace"]) / ".medomics" / "tmp"
                UPLOAD_FOLDER = self.__update_upload_folder(new_path)

            # Create a new extraction workflow object from the json_scene
            new_extraction_workflow = ExtractionWorkflow(json_scene)
            
            # Check if an extraction workflow already exists and retrieve it
            if "extractionWorkflow.pkl" in os.listdir(UPLOAD_FOLDER):
                with open(os.path.join(UPLOAD_FOLDER, "extractionWorkflow.pkl"), 'rb') as f:
                    extraction_workflow = pickle.load(f)
                    
                # Compare the new extraction workflow with the old one and update it
                extraction_workflow.update_workflow(new_extraction_workflow)
            else:
                extraction_workflow = new_extraction_workflow
            
            # Run the extraction workflow up to the node associated with node_id
            results = extraction_workflow.run_pipelines(self.set_progress, node_id)
            
            # Pickle extraction_workflow objet and put it in the UPLOAD_FOLDER
            with open(os.path.join(UPLOAD_FOLDER, "extractionWorkflow.pkl"), 'wb') as f:
                pickle.dump(extraction_workflow, f)
                       
            return convert_np_to_py(results)

        except Exception as e:
            return {"error": str(e)}
    
    def run_dm(self) -> dict:
        """
        Runs the DataManager instance to process all DICOM or NIFTI files in the given path.

        Returns:
            dict: The summary of the DataManager instance execution.
        """

        # Retrieve data from json request
        if "pathDicoms" in self.json_config.keys() and self.json_config["pathDicoms"] != "":
            path_to_dicoms = Path(self.json_config["pathDicoms"])
        else:
            path_to_dicoms = None
        if "pathNiftis" in self.json_config.keys() and self.json_config["pathNiftis"] != "":
            path_to_niftis = Path(self.json_config["pathNiftis"])
        else:
            path_to_niftis = None
        if "pathSave" in self.json_config.keys() and self.json_config["pathSave"] != "":
            path_save = Path(self.json_config["pathSave"])
        if "pathCSV" in self.json_config.keys() and self.json_config["pathCSV"] != "":
            path_csv = Path(self.json_config["pathCSV"])
        else:
            path_csv = None
        if "save" in self.json_config.keys():
            save = self.json_config["save"]
        else:
            save = True
        if "nBatch" in self.json_config.keys():
            n_batch = self.json_config["nBatch"]

        # Check if at least one path to data is given
        if not ("pathDicoms" in self.json_config.keys() and self.json_config["pathDicoms"] != "") and not (
                "pathNiftis" in self.json_config.keys() and self.json_config["pathNiftis"] != ""):
            return {"error": "No path to data given! At least DICOM or NIFTI path must be given."}
        
        # Init DataManager instance
        result = []
        try:
            # Check if path save exists:
            if not path_save.exists():
                return {"message": "The path to save the data does not exist."}
            
            os.environ['RAY_DISABLE_MEMORY_MONITOR'] = '1'
            
            dm = MEDimage.wrangling.DataManager(
                path_to_dicoms=path_to_dicoms,
                path_to_niftis=path_to_niftis,
                path_save=path_save,
                path_csv=path_csv,
                save=save, 
                n_batch=n_batch
            )

            # Run the DataManager
            if path_to_dicoms is not None and path_to_niftis is None:
                dm.process_all_dicoms()
            elif path_to_dicoms is None and path_to_niftis is not None:
                dm.process_all_niftis()
            else:
                dm.process_all()
            
            # Return success message
            try:
                summary = dm.summarize(True).to_dict()
                
                # Get the number of rows
                num_rows = len(summary["count"])

                # Create a list of objects in the desired format
                for i in range(num_rows):
                    obj = {
                        "count": summary["count"][i],
                        "institution": summary["institution"][i],
                        "roi_type": summary["roi_type"][i],
                        "scan_type": summary["scan_type"][i],
                        "study": summary["study"][i]
                    }
                    result.append(obj)
            except Exception as e:
                print("exception getting summary", e)
                summary = {}
                        
        except Exception as e:
            return {"error": str(e)}

        return result

    def run_pre_checks(self) -> dict:
        """
        Runs the DataManager instance to perform pre-radiomics checks on the given DICOM or NIFTI files.

        Returns:
            dict: The summary of the DataManager instance execution.
        """

        # Data from json request
        data = self.json_config

        # Retrieve data from json request
        if "pathDicoms" in data.keys() and data["pathDicoms"] != "":
            path_to_dicoms = Path(data["pathDicoms"])
        else:
            path_to_dicoms = None
        if "pathNiftis" in data.keys() and data["pathNiftis"] != "":
            path_to_niftis = Path(data["pathNiftis"])
        else:
            path_to_niftis = None
        if "pathNpy" in data.keys() and data["pathNpy"] != "":
            path_npy = Path(data["pathNpy"])
        if "pathSave" in data.keys() and data["pathSave"] != "":
            path_save = Path(data["pathSave"])
        if "pathCSV" in data.keys() and data["pathCSV"] != "":
            path_csv = Path(data["pathCSV"])
        else:
            path_csv = None
        if "nBatch" in data.keys():
            n_batch = data["nBatch"]
        if "wildcards_dimensions" in data.keys():
            wildcards_dimensions = data["wildcards_dimensions"]
        else:
            wildcards_dimensions = None
        if "wildcards_window" in data.keys():
            wildcards_window = data["wildcards_window"]
        else:
            wildcards_window = None
        
        # Check if wildcards are given
        if not wildcards_dimensions and not wildcards_window:
            return {"error": "No wildcards given! both wildcard for dimensions and for window must be given."}
        
        try:            
            # Init DataManager instance
            dm = MEDimage.wrangling.DataManager(
                path_to_dicoms=path_to_dicoms,
                path_to_niftis=path_to_niftis,
                path_save=path_save,
                path_csv=path_csv,
                path_save_checks=path_save,
                n_batch=n_batch)

            # Run the DataManager
            dm.pre_radiomics_checks(
                path_data=path_npy,
                wildcards_dimensions=wildcards_dimensions, 
                wildcards_window=wildcards_window, 
                path_csv=path_csv,
                save=True)

            # Get pre-checks images
            if not (path_save / 'checks').exists():
                (path_save / 'checks').mkdir()
            
            # Find all png files in path
            list_png = list((path_save / 'checks').glob('*.png'))
            list_titles = [png.name for png in list_png]
            list_png = [str(png) for png in list_png]
        
        except Exception as e:
            return {"error": str(e)}
        
        # Return success message
        return {"url_list": list_png, "list_titles": list_titles, "message": "Pre-checks done successfully."}
    
    def run_be_get_json(self) -> dict:
        """
        Load the settings file and return the settings in a json format.

        Returns:
            dict: The settings in json format.
        """
        # Path json setting
        try:
            path_settings = self.json_config['selectedSettingsFile']
            settings_dict = json.load(open(path_settings, 'r'))
        except Exception as e:
            return {"error": f"PROBLEM WITH LOADING SETTINGS {str(e)}"}

        return settings_dict

    def run_be_save_json(self) -> dict:
        """
        Save the settings in a json file.

        Returns:
            dict: The success message.
        """
        try:
            # Get path
            settings = self.json_config
            path_save = settings['pathSettings']
            settings = settings['settings']
            json.dump(settings, open(path_save, 'w'), indent=4)
        except Exception as e:
            return {"error": f"PROBLEM WITH SAVING SETTINGS {str(e)}"}

        return {"success": "Settings saved successfully."}

    def run_be_count(self) -> dict:
        """
        Count the number of scans in the given path and return the number of scans and the path to save the features.

        Returns:
            dict: The number of scans and the path to save the features.
        """
        # Retrieve data from json request
        data = self.json_config
        if "path_read" in data.keys() and data["path_read"] != "":
            path_read = Path(data["path_read"])
        else:
            return {"error": "No path to read given!"}
        if "path_csv" in data.keys() and data["path_csv"] != "":
            path_csv = Path(data["path_csv"])
        else:
            return {"error": "No path to csv given!"}
        if "path_params" in data.keys() and data["path_params"] != "":
            path_params = Path(data["path_params"])
        else:
            return {"error": "No path to params given!"}
        if "path_save" in data.keys() and data["path_save"] != "":
            path_save = Path(data["path_save"])
        else:
            path_save = None

        try:
            # CSV file path process
            if str(path_csv).endswith('.csv'):
                path_csv = path_csv.parent
            
            # Load params
            with open(path_params, 'r') as f:
                params = json.load(f)
            
            # Load csv and count scans
            tabel_roi = pd.read_csv(path_csv / ('roiNames_' + params["roi_type_labels"][0] + '.csv'))
            tabel_roi['under'] = '_'
            tabel_roi['dot'] = '.'
            tabel_roi['npy'] = '.npy'
            name_patients = (pd.Series(
                tabel_roi[['PatientID', 'under', 'under',
                        'ImagingScanName',
                        'dot',
                        'ImagingModality',
                        'npy']].fillna('').values.tolist()).str.join('')).tolist()
            
            
            # Count scans in path read
            list_scans = [scan.name for scan in list(path_read.glob('*.npy'))]
            list_scans_unique = [name_patient for name_patient in name_patients if name_patient in list_scans]
            n_scans = len(list_scans_unique)

            if type(params["roi_types"]) is list:
                roi_label = params["roi_types"][0]
            else:
                roi_label = params["roi_types"]
            folder_save_path = path_save / f'features({roi_label})'
        
        except Exception as e:
            return {"error": f"PROBLEM WITH COUNTING SCANS {str(e)}"}
        
        return {"n_scans": n_scans, "folder_save_path": str(folder_save_path)}
    
    def run_be(self) -> dict:
        """
        Run the BatchExtractor instance to extract radiomics features from dataset in the given path.

        Returns:
            dict: The success message.
        """
        # Retrieve data from json request
        data = self.json_config
        if "path_read" in data.keys() and data["path_read"] != "":
            path_read = Path(data["path_read"])
        else:
            path_read = None
        if "path_save" in data.keys() and data["path_save"] != "":
            path_save = Path(data["path_save"])
        if "path_csv" in data.keys() and data["path_csv"] != "":
            path_csv = Path(data["path_csv"])
        else:
            return {"error": "No path to csv given!"}
        if "path_params" in data.keys() and data["path_params"] != "":
            path_params = Path(data["path_params"])
        else:
            path_params = None
        if "skip_existing" in data.keys():
            skip_existing = data["skip_existing"]
        else:
            skip_existing = False
        if "n_batch" in data.keys():
            n_batch = data["n_batch"]

        try:
            # CSV file path process
            if 'csv' in path_csv.name:
                path_csv = path_csv.parent
            
            # Check if at least one path to data is given
            if not ("path_read" in data.keys() and data["path_read"] != "") and not (
                    "path_params" in data.keys() and data["path_params"] != "") and not (
                    "path_csv" in data.keys() and data["path_csv"] != ""):
                return {"error": "No path to data given! At least path to read, params and csv must be given."}

            # To avoid RAY memory issues
            os.environ['RAY_DISABLE_MEMORY_MONITOR'] = '1'
            
            # Init BatchExtractor instance
            be = MEDimage.biomarkers.BatchExtractor(
                path_read=path_read,
                path_csv=path_csv,
                path_params=path_params,
                path_save=path_save,
                skip_existing=skip_existing,
                n_batch=n_batch
            )

            # Run the BatchExtractor
            be.compute_radiomics()
        
        except Exception as e:
            return {"error": f"PROBLEM WITH BATCH EXTRACTION {str(e)}"}
        
        return {"success": "Radiomics features extracted successfully."}
        
    def get_progress(self) -> dict:
        """
        Returns the progress of the pipeline execution.\n
        self._progress is a dict containing the current node in execution and the current progress of all processed nodes.\n
        this function is called by the frontend to update the progress bar continuously when the pipeline is running.

        Returns:
            dict: The progress of all pipelines execution.
        """
        return self._progress

    def set_progress(self, now: int = -1, label: str = "same") -> None:
        """
        Sets the progress of the pipeline execution.

        Args:
            now (int, optional): The current progress. Defaults to 0.
            label (str, optional): The current node in execution. Defaults to "".
        """
        if now == -1:
            now = self._progress['now']
        if label == "same":
            label = self._progress['currentLabel']
        self._progress = {'currentLabel': label, 'now': now}   