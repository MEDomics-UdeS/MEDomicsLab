import copy
import json
import os
import pickle
import pprint
import shutil
import sys
from copy import deepcopy
from pathlib import Path

import numpy as np
import pandas as pd

SUBMODULE_DIR = str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent / 'submodules' / 'MEDimage')
sys.path.append(SUBMODULE_DIR)

pp = pprint.PrettyPrinter(indent=4, compact=True, width=40, sort_dicts=False)  # allow pretty print of datatypes in console

import MEDimage
import ray

from .utils import *

# Global variables
JSON_SETTINGS_PATH = Path(os.path.join(os.path.dirname(os.path.abspath(__file__)))) / 'settings/settings_frame.json'
UPLOAD_FOLDER = Path(os.path.dirname(os.path.abspath(__file__)))  / 'tmp'


class MEDimageExtraction:
    def __init__(self, json_config: dict) -> None:
        self.json_config = json_config
        self.medscan_obj = None
        self.pipelines = []
        self._progress = {'currentLabel': '', 'now': 0.0}
        self.nb_runs = 0
        self.runs = {}
    
    def __format_features(self, features_dict: dict):
        for key, value in features_dict.items():
            if (type(value) is list):
                features_dict[key] = value
            else:
                features_dict[key] = np.float64(value)
        return features_dict
    
    def __min_node_required(self, pip, node_list):
        found = False
        for node in pip:
            if pip[node]["type"] in node_list:
                found = True

        return found
    
    def __get_features_list(self, content: dict) -> list:
        if (content["name"] == "extraction"):
            features_list = []
            key = "extraction-" + str(content["id"])

            # Safety check
            if key not in self.json_config['drawflow']:
                return []

            for node_id in self.json_config['drawflow'][key]["data"]:  # We scan all node of each modulef in scene
                features_list.append(node_id)

            return features_list
        else:
            print("Node different to extraction not allowed")
            return []

    def __get_last_output_from_pip(self, pip: list, output_name: str, nodes_to_parse: list) -> object:
        """
        Get the last output from a pipeline

        Args:
            pip (list): Pipeline
            output_name (str): Name of the output to get
            nodes_to_parse (list): Nodes to parse

        Returns:
            object: Last output found
        """
        # Init variables
        found = False
        i = 1
        # Loop stop if current node parsed is the fisrt of the pip
        while (i <= len(list(pip))):
            last_node_found = list(pip)[-i]  # return node's id

            # Current parse node not in the list.
            if (pip[last_node_found]["type"] not in nodes_to_parse):
                i += 1
                
            # If the element is a scalar (single value or string)
            elif np.isscalar(pip[last_node_found]["output"][output_name]):
                if pip[last_node_found]["output"][output_name] == "empty":
                    i += 1

            # Ouput found
            else:
                found = True
                last_output_found = deepcopy(pip[last_node_found]["output"][output_name])
                return last_output_found

        if not found: print("Last output not updated")
    
    def __sort_features_categories(self, features_ids: list) -> list:
        """
        Sorts the features by categories

        Args:
            features_ids (list): List of features

        Returns:
            list: Features sorted by categories
        """
        features_order = ["morph", "local_intensity", "stats", "intensity_histogram", "int_vol_hist", "glcm", "glrlm", "glszm", "gldzm", "ngtdm", "ngldm"]

        # Create a dictionary of feature IDs sorted by their category name
        features_ids_dict = {feature_content["name"]: id for id in features_ids if (feature_content := get_node_content(id, self.json_config))["name"] in features_order}

        # Generate the sorted list based on the order in features_order
        return [features_ids_dict[name] for name in features_order if name in features_ids_dict]

    
    def __update_pip_settings(self, pip: list, im_params: dict, scan_type: str) -> dict:
        """
        Updates the extraction parameters of the pipeline

        Args:
            pip (list): Pipeline
            im_params (dict): Extraction parameters
            scan_type (str): Type of scan

        Returns:
            dict: Updated extraction parameters
        """
        if scan_type == "PTscan":
            scan_type = "imParamPET"
        else:
            scan_type = "imParam" + scan_type[:-4]

        for node in pip:
            content = get_node_content(node, self.json_config)

            # FILTERING
            if (content["name"] == "filter") or (content["name"] == "filter_processing"):
                im_params["imParamFilter"] = content["data"]

            # INTERPOLATION
            elif (content["name"] == "interpolation"):
                im_params[scan_type]["interp"] = content["data"]

            # RE-SEGMENTATION
            elif (content["name"] == "re_segmentation"):
                im_params[scan_type]["reSeg"] = content["data"]

            # DISCRETIZATION
            elif (content["name"] == "discretization"):
                im_params[scan_type]["discretisation"] = content["data"]

        return im_params

    def generate_all_pipelines(self, id: str, node_content, pip) -> list:
        """
        Generates all possible pipelines from the nodes of the scene

        Args:
            id (str): id of the node
            node_content (dict): Content of the node
            pip (list): Current pipeline

        Returns:
            list: list of all pipelines
        """
        # -------------------------------------------------- NODE ADD ---------------------------------------------------
        pip.append(id)  # Current node added to pip

        # Specific cases with processing submodule jumps
        if (node_content["name"] == "processing"):
            id_next_node = str(
                int(node_content["id"] + 1))  # Retrieve id of the input_processing node (present in submodule)
            pip.append(id_next_node)  # add second processing into pip
            node_content = get_node_content(id_next_node, self.json_config)  # node content updated

        if (node_content["name"] == "output_processing"):
            id_next_node = str(
                node_content["data"]["parent_node"])  # Retrieve id of parent processing node of out_processing node
            pip.append(id_next_node)
            node_content = get_node_content(id_next_node, self.json_config)  # node content updated

        # ---------------------------------------------- NEXT NODES COMPUTE ----------------------------------------------
        # NO OUPUT CONNECTION
        if not "output_1" in node_content["outputs"]:  # if no ouput connection
            self.pipelines.append(pip)
            return pip

        # ONE OUPUT CONNECTION
        elif len(node_content["outputs"]["output_1"]["connections"]) == 1:
            out_node_id = node_content["outputs"]["output_1"]["connections"][0]["node"]
            out_node_content = get_node_content(out_node_id, self.json_config)
            pip = self.generate_all_pipelines(out_node_id, out_node_content, pip)

        # MORE ONE OUPUT CONNECTION
        else:
            connections = node_content["outputs"]["output_1"]["connections"]  # output connections of last node added to pip
            tab_pip = []
            buff = deepcopy(pip)

            for counter, connection in enumerate(connections):
                tab_pip.append(deepcopy(buff))  # duplicate current pip from connections number
                out_node_id = connection["node"]  # Retrieve output connection of current node
                out_node_content = get_node_content(out_node_id, self.json_config)  # Retrieve content of node connected of the current node output
                tab_pip[counter] = self.generate_all_pipelines(out_node_id, out_node_content, tab_pip[counter])
                pip = tab_pip[counter]

        return pip
    
    def generate_pipelines_from_node(self, id: str, node_content, pip):
        # -------------------------------------------------- NODE ADD ---------------------------------------------------
        pip.append(id)  # Current node added to pip
        print("current pip", pip)

        # Specific cases with processing submodule jumps
        if (node_content["name"] == "input_processing"):
            id_next_node = str(
                int(node_content["id"] - 1))  # Retrieve id of the input_processing node (present in submodule)
            pip.append(id_next_node)  # add second processing into pip
            node_content = get_node_content(id_next_node, self.json_config)  # node content updated

        # ---------------------------------------------- NEXT NODES COMPUTE ----------------------------------------------
        # NO INPUT CONNECTION (input node reached)
        if not "input_1" in node_content["inputs"]:  # if no ouput connection
            pip.reverse()
            self.pipelines.append(pip)
            return pip

        # ONE INPUT CONNECTION
        elif len(node_content["inputs"]["input_1"]["connections"]) == 1:
            in_node_id = node_content["inputs"]["input_1"]["connections"][0]["node"]
            in_node_content = get_node_content(in_node_id, self.json_config)
            pip = self.generate_pipelines_from_node(in_node_id, in_node_content, pip)

        # MORE ONE INPUT CONNECTION
        else:
            print("MULTI input connections : ", len(node_content["inputs"]["input_1"]["connections"]))
            connections = node_content["inputs"]["input_1"]["connections"]  # input connections of last node added to pip
            tab_pip = []
            buff = deepcopy(pip)

            for counter, connection in enumerate(connections):
                tab_pip.append(deepcopy(buff))  # duplicate current pip from connections number
                in_node_id = connection["node"]  # Retrieve input connection of current node
                in_node_content = get_node_content(in_node_id, self.json_config)  # Retrieve content of node connected of the current node input
                tab_pip[counter] = self.generate_pipelines_from_node(in_node_id, in_node_content, tab_pip[counter])
                pip = tab_pip[counter]

        return pip

    def execute_pips(self):
        # Init RUNS dict for store instances and logs (xxx_obj)
        self.nb_runs += 1
        pips_obj = {}

        # Init results dict for result response (xxx_res)
        pips_res = {}
        scan_res = {}
        filename_loaded = ""

        # ------------------------------------------ PIP EXECUTION ------------------------------------------
        for idx_pip, pip in enumerate(self.pipelines):

            print("\n\n!!!!!!!!!!!!!!!!!! New pipeline execution !!!!!!!!!!!!!!!!!! \n --> Pip : ", pip)

            # Loading default settings from MEDimageApp json file as im_params
            im_params = MEDimage.utils.json_utils.load_json(JSON_SETTINGS_PATH)

            # Init object and variables for new pipeline
            pip_obj = {}
            pip_name_obj = ""
            pip_res = {}
            pip_name_res = "pip"
            features_res = {}
            settings_res = {}

            # CODE FRAGMENT TO INCLUDE TEXTURE FEATURES
            flag_texture = False
            features_list = []

            # If the pipeline has an extraction node, it must be the last node
            # Check if the last node is an extraction node
            if pip[-1:]:
                last_node_content = get_node_content(pip[-1], self.json_config)
                if last_node_content["name"] == "extraction":
                    all_texture_features = ["glcm", "gldzm", "glrlm", "glszm", "ngldm", "ngtdm"]
                    # Get IDs of nodes contained into feature node
                    features_id = self.__get_features_list(last_node_content)
                    for id in features_id:
                        feature_content = get_node_content(id, self.json_config)
                        features_list.append(feature_content["name"])
                        if feature_content["name"] in all_texture_features:
                            flag_texture = True

            # Variables to keep segmentation return matrices if there is a texture feature to extract
            vol_obj_init_texture = None
            roi_obj_init_texture = None

            # ------------------------------------------ NODE EXECUTION ------------------------------------------
            for node in pip:
                content = get_node_content(node, self.json_config)
                print("\n\n\n///////////////// CURRENT NODE :", content["name"], "-", node, " /////////////////")

                # Update RUNS dict for store instances and logs (xxx_obj)
                update_pip = False
                pip_name_obj += node
                id_obj = {}
                output_obj = {}
                id_obj["type"] = content["name"]
                id_obj["settings"] = content["data"]

                # Update results dict for result response (xxx_res)
                pip_name_res += "/" + node
                nodes_needing_last_output = [
                    "filter", "interpolation", "re_segmentation", "roi_extraction", 
                    "filter_processing", "discretization", "extraction"
                ]

                # ------------------------------ GET LAST VOL and ROI computed ------------------------------------------
                if (content["name"] in nodes_needing_last_output):
                    last_vol_compute = self.__get_last_output_from_pip(
                        pip_obj, "vol",
                        ["segmentation", "filter", "interpolation",
                        "re_segmentation", "filter_processing",
                         "roi_extraction", "discretization"]
                    )
                    last_roi_compute = self.__get_last_output_from_pip(
                        pip_obj, "roi",
                        ["segmentation", "filter", "interpolation",
                        "re_segmentation", "filter_processing",
                        "roi_extraction", "discretization"]
                    )

                # ------------------------------------------ HOME ------------------------------------------
                # INPUT
                if (content["name"] == "input"):
                    self.set_progress(now=0.0, label=f"Pip {idx_pip + 1} | Loading input")
                    print("\n********INPUT execution********")
                    print("filename_loaded : ", filename_loaded)
                    print("content data : ", content["data"]["filepath"])

                    # If new input computed
                    if (filename_loaded != content["data"]["filepath"]):
                        print("scan res init")
                        scan_res = {}
                        filename_loaded = content["data"]["filepath"]

                    # Load MEDscan instance from file
                    with open(UPLOAD_FOLDER / filename_loaded, 'rb') as f:
                        MEDimg = pickle.load(f)
                        MEDimg = MEDimage.MEDscan(MEDimg)
                    print("---> Instance from \"", filename_loaded, "\" file loaded.")

                    scan_type = MEDimg.type
                    im_params = self.__update_pip_settings(pip, im_params, scan_type)
                    #im_params['imParamMR']['reSeg']['range'] = [0, np.inf]
                    print("---> Default params updatted with pipeline settings.")
                    MEDimage.MEDscan.init_params(MEDimg, im_params)
                    print("---> New params loaded.")

                    # Update output infos for RUNS
                    update_pip = True
                    output_obj["MEDimg"] = MEDimg
                    id_obj["output"] = output_obj
                    self.set_progress(now=8.5/len(self.pipelines))
                    print(" --> outputs updated.")

                # SEGMENTATION
                elif (content["name"] == "segmentation"):
                    # Update progress
                    self.set_progress(now=8.5/len(self.pipelines), label=f"Pip {idx_pip + 1} | Segmentation")

                    # Get ROI (region of interest)
                    print("\n--> Extraction of ROI mask:")
                    print("ROI_NAME apply : ", content["data"]["rois_data"])

                    # Safety check
                    if not content["data"]["rois_data"]:
                        return {"error": "ERROR on segmentation. No ROI name provided."}

                    vol_obj_init, roi_obj_init = MEDimage.processing.get_roi_from_indexes(
                        MEDimg,
                        name_roi=content["data"]["rois_data"],
                        # retrieve name_roi from segmentation rois_data. pip[0] match the input id of current pip.
                        box_string="full"
                    )
                    print(" --> ", content["name"], " executed.")

                    # ADDED CODE FRAGMENT FOR TEXTURE FEATURES
                    # If there are some texture features to compute later, keep initial version of vol_obj_init
                    # and roi_obj_init
                    if flag_texture:
                        vol_obj_init_texture = copy.deepcopy(vol_obj_init)
                        roi_obj_init_texture = copy.deepcopy(roi_obj_init)

                    # Update output infos
                    update_pip = True
                    output_obj["vol"] = vol_obj_init
                    output_obj["roi"] = roi_obj_init
                    id_obj["output"] = output_obj
                    print(" --> outputs updated.")
                    # Update settings infos pour json response
                    settings_res[content["name"]] = content["data"]

                    # Update progress
                    self.set_progress(now=17.0/len(self.pipelines))

                # ------------------------------------------PROCESSING------------------------------------------
                # INTERPOLATION
                elif (content["name"] == "interpolation"):
                    # Update progress
                    self.set_progress(now=17.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | Interpolation")

                    # Intensity Mask
                    vol_obj = MEDimage.processing.interp_volume(
                        vol_obj_s=last_vol_compute,  # vol_obj_init,
                        medscan=MEDimg,
                        vox_dim=MEDimg.params.process.scale_non_text,
                        interp_met=MEDimg.params.process.vol_interp,
                        round_val=MEDimg.params.process.gl_round,
                        image_type='image',
                        roi_obj_s=last_roi_compute,  # roi_obj_init
                        box_string="full"
                    )
                    # Morphological Mask
                    roi_obj_morph = MEDimage.processing.interp_volume(
                        vol_obj_s=last_roi_compute,  # roi_obj_init,
                        medscan=MEDimg,
                        vox_dim=MEDimg.params.process.scale_non_text,
                        interp_met=MEDimg.params.process.roi_interp,
                        round_val=MEDimg.params.process.roi_pv,
                        image_type='roi',
                        roi_obj_s=last_roi_compute,  # roi_obj_init
                        box_string="full"
                    )
                    print(" --> ", content["name"], " executed.")

                    # Update output infos
                    update_pip = True
                    output_obj["vol"] = vol_obj
                    output_obj["roi"] = roi_obj_morph
                    output_obj["roi_morph"] = roi_obj_morph
                    id_obj["output"] = output_obj
                    print(" --> outputs updated.")
                    # Update settings infos pour json response
                    settings_res[content["name"]] = content["data"]

                    # Update progress
                    self.set_progress(now=25.5/len(self.pipelines))

                # FILTER
                elif (content["name"] == "filter"):
                    # Update progress
                    self.set_progress(now=25.5/len(self.pipelines), label=f"Pip {idx_pip + 1} | Filtering")

                    # Apply filter to the imaging volume
                    MEDimg.params.filter.filter_type = content["data"]["filter_type"] 
                    vol_obj_filter = MEDimage.filters.apply_filter(MEDimg, last_vol_compute)  # vol_obj_init
                    print(" --> ", content["name"], " executed.")

                    # Update output infos
                    update_pip = True
                    output_obj["vol"] = vol_obj_filter
                    output_obj["roi"] = "empty"
                    id_obj["output"] = output_obj
                    print(" --> outputs updated.")
                    
                    # Update settings infos pour json response
                    settings_res[content["name"]] = content["data"]

                    # Update progress
                    self.set_progress(now=35/len(self.pipelines))

                # RE-SEGMENTATION
                elif (content["name"] == "re_segmentation"):
                    # Update progress
                    self.set_progress(now=35/len(self.pipelines), label=f"Pip {idx_pip + 1} | Re-segmentation")

                    # Intensity mask range re-segmentation
                    roi_obj_int = deepcopy(last_roi_compute)  # roi_obj_morph
                    roi_obj_int.data = MEDimage.processing.range_re_seg(
                        vol=last_vol_compute.data,  # vol_obj
                        roi=roi_obj_int.data,
                        im_range=MEDimg.params.process.im_range
                    )

                    # Intensity mask outlier re-segmentation
                    roi_obj_int.data = np.logical_and(
                        MEDimage.processing.outlier_re_seg(
                            vol=last_vol_compute.data,  # vol_obj
                            roi=roi_obj_int.data,
                            outliers=MEDimg.params.process.outliers
                        ),
                        roi_obj_int.data
                    ).astype(int)
                    print(" --> ", content["name"], " executed.")

                    # Update output infos
                    update_pip = True
                    output_obj["vol"] = "empty"
                    output_obj["roi"] = roi_obj_int
                    id_obj["output"] = output_obj
                    print(" --> outputs updated.")

                    # Update settings infos pour json response
                    # If re-segmentation is not serialized, change inf to string
                    if np.isinf(MEDimg.params.process.im_range[1]):
                        print("inf to string 1")
                        content["data"]['range'][1] = "inf"
                    if np.isinf(MEDimg.params.process.im_range[0]):
                        print("inf to string 0")
                        content["data"]['range'][0] = "inf"
                    settings_res[content["name"]] = content["data"]
                    print(" --> settings updated.", content["data"])

                    # Update progress
                    self.set_progress(now=42.5/len(self.pipelines))

                # ROI_EXTRACTION
                elif (content["name"] == "roi_extraction"):
                    # Update progress
                    self.set_progress(now=42.5/len(self.pipelines), label=f"Pip {idx_pip + 1} | ROI extraction")

                    # ROI Extraction :
                    vol_int_re = MEDimage.processing.roi_extract(
                        vol=last_vol_compute.data,  # vol_obj
                        roi=last_roi_compute.data  # roi_obj_int
                    )
                    print(" -->", content["name"], " executed.")

                    # Update output infos
                    update_pip = True
                    output_obj["vol"] = vol_int_re
                    output_obj["roi"] = "empty"
                    id_obj["output"] = output_obj
                    print(" --> outputs updated.")

                    # Update progress
                    self.set_progress(now=50/len(self.pipelines))

                # DISCRETIZATION
                elif (content["name"] == "discretization"):
                    # Update progress
                    self.set_progress(now=50/len(self.pipelines), label=f"Pip {idx_pip + 1} | Discretization")

                    # Intensity histogram equalization of the imaging volume
                    if MEDimg.params.process.ivh and 'type' in MEDimg.params.process.ivh and 'val' in MEDimg.params.process.ivh:
                        if MEDimg.params.process.ivh['type'] and MEDimg.params.process.ivh['val']:
                            vol_quant_re, wd = MEDimage.processing.discretize(
                                vol_re=last_vol_compute,  # vol_int_re
                                discr_type=MEDimg.params.process.ivh['type'],
                                n_q=MEDimg.params.process.ivh['val'],
                                user_set_min_val=MEDimg.params.process.user_set_min_value,
                                ivh=True
                            )
                    else:
                        vol_quant_re = last_vol_compute
                        wd = 1

                    # Update output infos
                    update_pip = True
                    output_obj["vol"] = vol_quant_re  # temp : to change after new implementation of discretization node
                    output_obj["roi"] = "empty"
                    id_obj["output"] = output_obj
                    print(" --> outputs updated.")
                    # Update settings infos for json response
                    settings_res[content["name"]] = content["data"]

                    # Update progress
                    self.set_progress(now=60.0/len(self.pipelines))

                # EXTRACTION
                elif (content["name"] == "extraction"):
                    # Update progress
                    self.set_progress(now=60.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | Extraction")

                    # Preparation of computation :
                    MEDimg.init_ntf_calculation(last_vol_compute)  # vol_obj

                    # ----------------- CODE FRAGMENT ADDED FOR TEXTURE FEATURES -----------------------------------------
                    # THIS IS A PATCH : we prepare texture feature for extraction AS IF all the nodes are placed correctly
                    # the pipeline.
                    if flag_texture:
                        print("Preparation of texture feature extraction.")

                        # TODO : Verifier si on doit bien mettre zero pour scale_text!
                        # Interpolation
                        # Intensity Mask
                        vol_obj_texture = MEDimage.processing.interp_volume(
                            vol_obj_s=vol_obj_init_texture,
                            vox_dim=MEDimg.params.process.scale_text[0],
                            interp_met=MEDimg.params.process.vol_interp,
                            round_val=MEDimg.params.process.gl_round,
                            image_type='image',
                            roi_obj_s=roi_obj_init_texture,
                            box_string=MEDimg.params.process.box_string
                        )
                        # Morphological Mask
                        roi_obj_morph_texture = MEDimage.processing.interp_volume(
                            vol_obj_s=roi_obj_init_texture,
                            vox_dim=MEDimg.params.process.scale_text[0],
                            interp_met=MEDimg.params.process.roi_interp,
                            round_val=MEDimg.params.process.roi_pv,
                            image_type='roi',
                            roi_obj_s=roi_obj_init_texture,
                            box_string=MEDimg.params.process.box_string
                        )

                        # update progress
                        self.set_progress(now=65.0/len(self.pipelines))

                        # Re-segmentation
                        # Intensity mask range re-segmentation
                        roi_obj_int_texture = deepcopy(roi_obj_morph_texture)
                        roi_obj_int_texture.data = MEDimage.processing.range_re_seg(
                            vol=vol_obj_texture.data,
                            roi=roi_obj_int_texture.data,
                            im_range=MEDimg.params.process.im_range
                        )
                        # Intensity mask outlier re-segmentation
                        roi_obj_int_texture.data = np.logical_and(
                            MEDimage.processing.outlier_re_seg(
                                vol=vol_obj_texture.data,
                                roi=roi_obj_int_texture.data,
                                outliers=MEDimg.params.process.outliers
                            ),
                            roi_obj_int_texture.data
                        ).astype(int)

                        # Image filtering
                        if MEDimg.params.filter.filter_type:
                            vol_obj_texture = MEDimage.filters.apply_filter(MEDimg, vol_obj_texture)

                        a = 0
                        n = 0
                        s = 0

                        # Preparation of computation :
                        MEDimg.init_tf_calculation(
                            algo=a,
                            gl=n,
                            scale=s)

                        # ROI Extraction :
                        vol_int_re_texture = MEDimage.processing.roi_extract(
                            vol=vol_obj_texture.data,
                            roi=roi_obj_int_texture.data)

                        # Discretisation :
                        vol_quant_re_texture, _texture = MEDimage.processing.discretize(
                            vol_re=vol_int_re_texture,
                            discr_type=MEDimg.params.process.algo[a],
                            n_q=MEDimg.params.process.gray_levels[a][n],
                            user_set_min_val=MEDimg.params.process.user_set_min_value
                        )

                        # Update progress
                        self.set_progress(now=70.0/len(self.pipelines))

                    # update progress
                    self.set_progress(now=70.0/len(self.pipelines))
                        
                    # Get IDs of nodes contained into feature node and extract all features selected in node
                    features_id = self.__get_features_list(content)
                    print("features_id : ", features_id)
                    features_id = self.__sort_features_categories(features_id)
                    print("features_id POST SORT /////////////////////////////: ", features_id)
                    for id in features_id:
                        feature_content = get_node_content(id, self.json_config)
                        feature_name = feature_content["name"]
                        print("feature_name : /////////////////////////////:\n", feature_name)
                        # Get list of all features to extract
                        features_to_extract = feature_content["data"]["features"]
                        # Initialize features to put in dictionnary
                        features = None

                        # ---------------------------------- NON TEXTURE FEATURES -----------------------------------------
                        # MORPH
                        if feature_name == "morph":

                            nodes_allowed = ["interpolation", "re_segmentation", "filter_processing"]
                            if self.__min_node_required(pip_obj, nodes_allowed):
                                last_feat_vol = self.__get_last_output_from_pip(pip_obj, "vol", nodes_allowed)
                                last_feat_roi = self.__get_last_output_from_pip(pip_obj, "roi", nodes_allowed)
                            else:
                                error = "ERROR on " + feature_content[
                                    "name"] + " extraction. Minimum one node required from this list :", nodes_allowed
                                return error

                            # Morphological features extraction
                            try:
                                # update progress
                                self.set_progress(now=70.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | Morphological features extraction")

                                # Create an empty list to store the keys that match the condition
                                roi_morph = []

                                # Iterate through the outer dictionary items
                                for key, inner_dict in pip_obj.items():
                                    if 'type' in inner_dict and inner_dict['type'] == 'interpolation':
                                        # Append the key to the list if the condition is met
                                        roi_morph = inner_dict['output']['roi_morph']
                                
                                
                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = MEDimage.biomarkers.morph.extract_all(
                                        vol=last_feat_vol.data,  # vol_obj.data
                                        mask_int=last_feat_roi.data,  # roi_obj_morph.data,
                                        mask_morph=roi_morph.data,  # roi_obj_morph.data,
                                        res=MEDimg.params.process.scale_non_text,
                                        intensity_type=MEDimg.params.process.intensity_type
                                    )

                                    # update progress
                                    self.set_progress(now=72.0/len(self.pipelines))

                                else:
                                    # If only some features need to be extracted, use the name of the feature to build
                                    # extraction code (executed dynamically using exec()).
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        # TODO : Would a for loop be more efficient than calling exec for each feature?
                                        function_name = "MEDimage.biomarkers.morph." + str(features_to_extract[i])
                                        function_params = "vol=last_feat_vol.data, mask_int=last_feat_roi.data, " \
                                                        "mask_morph=last_feat_roi.data, res=MEDimg.params.process.scale_non_text"
                                        function_call = "result = " + function_name + "(" + function_params + ")"
                                        local_vars = {}
                                        global_vars = {"MEDimage": MEDimage, "last_feat_vol": last_feat_vol,
                                                    "last_feat_roi": last_feat_roi, "MEDimg": MEDimg}
                                        exec(function_call, global_vars, local_vars)

                                        feature_name_convention = "F" + feature_name + "_" + str(features_to_extract[i])
                                        features[feature_name_convention] = local_vars.get("result")

                                print("---> morph features extracted")
                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF MORPHOLOGICAL FEATURES {str(e)}"}

                        # LOCAL INTENSITY
                        elif feature_name == "local_intensity":
                            nodes_allowed = ["interpolation", "re_segmentation", "filter_processing"]
                            if self.__min_node_required(pip_obj, nodes_allowed):
                                last_feat_vol = self.__get_last_output_from_pip(pip_obj, "vol", nodes_allowed)
                                last_feat_roi = self.__get_last_output_from_pip(pip_obj, "roi", nodes_allowed)
                            else:
                                print("ERROR on " + feature_content[
                                    "name"] + " extraction. Minimum one node required from this list :", nodes_allowed)

                            # Local intensity features extraction
                            try:
                                # update progress
                                self.set_progress(now=72.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | Local intensity features extraction")

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = MEDimage.biomarkers.local_intensity.extract_all(
                                        img_obj=last_feat_vol.data,  # vol_obj
                                        roi_obj=last_feat_roi.data,  # roi_obj_int
                                        res=MEDimg.params.process.scale_non_text,
                                        intensity_type=MEDimg.params.process.intensity_type
                                        # TODO: missing parameter that is automatically set to false
                                    )
                                else:
                                    # If only some features need to be extracted, use the name of the feature to build
                                    # extraction code (executed dynamically using exec()).
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        function_name = "MEDimage.biomarkers.local_intensity." + str(features_to_extract[i])
                                        function_params = "img_obj=last_feat_vol.data, roi_obj=last_feat_roi.data, " \
                                                        "res=MEDimg.params.process.scale_non_text "
                                        function_call = "result = " + function_name + "(" + function_params + ")"
                                        local_vars = {}
                                        global_vars = {"MEDimage": MEDimage, "last_feat_vol": last_feat_vol,
                                                    "last_feat_roi": last_feat_roi, "MEDimg": MEDimg}
                                        exec(function_call, global_vars, local_vars)

                                        feature_name_convention = "Floc_" + str(features_to_extract[i])
                                        features[feature_name_convention] = local_vars.get("result")
                                
                                # update progress
                                self.set_progress(now=74.0/len(self.pipelines))
                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF LOCAL INTENSITY FEATURES {str(e)}"}

                            print("---> local_intensity features extracted")

                        # STATS
                        elif feature_name == "stats":
                            if self.__min_node_required(pip_obj, ["roi_extraction"]):
                                last_feat_vol = self.__get_last_output_from_pip(pip_obj, "vol", ["roi_extraction"])
                            else:
                                print("ERROR on ", feature_content["name"], " extraction. Minimum one node required from this list :", ["roi_extraction"])

                            # Statistical features extraction
                            try:
                                # update progress
                                self.set_progress(now=74.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | Statistical features extraction")

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = MEDimage.biomarkers.stats.extract_all(
                                        vol=last_feat_vol,  # vol_int_re
                                        intensity_type=MEDimg.params.process.intensity_type
                                    )
                                else:
                                    # If only some features need to be extracted, use the name of the feature to build
                                    # extraction code (executed dynamically using exec()).
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        function_name = "MEDimage.biomarkers.stats." + str(features_to_extract[i])
                                        function_params = "vol=last_feat_vol"
                                        function_call = "result = " + function_name + "(" + function_params + ")"
                                        local_vars = {}
                                        global_vars = {"MEDimage": MEDimage, "last_feat_vol": last_feat_vol}
                                        exec(function_call, global_vars, local_vars)

                                        feature_name_convention = "Fstat_" + str(features_to_extract[i])
                                        features[feature_name_convention] = local_vars.get("result")
                                
                                # update progress
                                self.set_progress(now=76.0/len(self.pipelines))
                                
                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF STATISTICAL FEATURES {str(e)}"}

                            print("---> stats features extracted")

                        # IH
                        elif feature_name == "intensity_histogram":
                            # DISCRETIZATION
                            if self.__min_node_required(pip_obj, ["discretization"]):
                                last_vol_compute = self.__get_last_output_from_pip(pip_obj, "vol", ["roi_extraction"])
                                last_feat_vol, _ = MEDimage.processing.discretize(
                                    vol_re=last_vol_compute,  # vol_int_re
                                    discr_type=MEDimg.params.process.ih['type'],
                                    n_q=MEDimg.params.process.ih['val'],
                                    user_set_min_val=MEDimg.params.process.user_set_min_value
                                )
                                print("---> discretization executed.")

                            elif self.__min_node_required(pip_obj, ["roi_extraction", "discretization"]):
                                last_feat_vol = self.__get_last_output_from_pip(pip_obj, "vol", ["roi_extraction", "discretization"])

                            else:
                                print("ERROR on ", feature_content["name"],
                                    " extraction. Minimum one node required from this list :", ["roi_extraction", "discretization"])

                            # Intensity histogram features extraction
                            try:
                                # update progress
                                self.set_progress(now=76.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | Intensity histogram features extraction")

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = MEDimage.biomarkers.intensity_histogram.extract_all(vol=last_feat_vol)
                                else:
                                    # If only some features need to be extracted, use the name of the feature to build
                                    # extraction code (executed dynamically using exec()).
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        function_name = "MEDimage.biomarkers.intensity_histogram." + str(
                                            features_to_extract[i])
                                        function_params = "vol=last_feat_vol"
                                        function_call = "result = " + function_name + "(" + function_params + ")"
                                        local_vars = {}
                                        global_vars = {"MEDimage": MEDimage, "last_feat_vol": last_feat_vol}
                                        exec(function_call, global_vars, local_vars)

                                        feature_name_convention = "Fih_" + str(features_to_extract[i])
                                        features[feature_name_convention] = local_vars.get("result")
                                
                                # update progress
                                self.set_progress(now=78.0/len(self.pipelines))
                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF INTENSITY HISTOGRAM FEATURES {str(e)}"}

                            print("---> intensity_histogram features extracted")

                        # IVH
                        elif feature_name == "int_vol_hist":
                            if self.__min_node_required(pip_obj, ["discretization"]):
                                last_vol_compute = self.__get_last_output_from_pip(pip_obj, "vol", ["roi_extraction"])

                                # Intensity histogram equalization of the imaging volume
                                if MEDimg.params.process.ivh and 'type' in MEDimg.params.process.ivh and 'val' in MEDimg.params.process.ivh:
                                    if MEDimg.params.process.ivh['type'] and MEDimg.params.process.ivh['val']:
                                        last_feat_vol, wd = MEDimage.processing.discretize(
                                            vol_re=last_vol_compute,  # vol_int_re
                                            discr_type=MEDimg.params.process.ivh['type'],
                                            n_q=MEDimg.params.process.ivh['val'],
                                            user_set_min_val=MEDimg.params.process.user_set_min_value,
                                            ivh=True
                                        )
                                print("---> discretization executed.")

                            elif self.__min_node_required(pip_obj, ["roi_extraction", "discretization"]):
                                last_feat_vol = self.__get_last_output_from_pip(pip_obj, "vol", ["roi_extraction", "discretization"])
                                wd = 1

                            else:
                                print("ERROR on ", feature_content["name"],
                                    " extraction. Minimum one node required from this list :", ["roi_extraction", "discretization"])

                            # Intensity volume histogram features extraction
                            try:
                                # update progress
                                self.set_progress(now=78.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | Intensity volume histogram features extraction")

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = MEDimage.biomarkers.int_vol_hist.extract_all(
                                        medscan=MEDimg,
                                        vol=last_feat_vol,  # vol_quant_re
                                        vol_int_re=vol_int_re,
                                        wd=wd  # TODO: Missing user_set_range argument?
                                    )
                                else:
                                    # If only some features need to be extracted, use the name of the feature to build
                                    # extraction code (executed dynamically using exec()).
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        function_name = "MEDimage.biomarkers.int_vol_hist." + str(features_to_extract[i])
                                        function_params = "medscan=MEDimg, vol=last_feat_vol, vol_int_re=vol_int_re, wd=wd"
                                        function_call = "result = " + function_name + "(" + function_params + ")"
                                        local_vars = {}
                                        global_vars = {"MEDimage": MEDimage, "last_feat_vol": last_feat_vol,
                                                    "vol_int_re": vol_int_re, "MEDimg": MEDimg, "wd": wd}
                                        exec(function_call, global_vars, local_vars)

                                        feature_name_convention = "F" + feature_name + "_" + str(features_to_extract[i])
                                        features[feature_name_convention] = local_vars.get("result")
                                
                                # update progress
                                self.set_progress(now=80.0/len(self.pipelines))

                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF INTENSITY VOLUME HISTOGRAM FEATURES {str(e)}"}

                            print("---> ivh features extracted")

                        # ------------------------------------- TEXTURE FEATURES ------------------------------------------
                        # GLCM
                        elif feature_name == "glcm":
                            try:
                                # update progress
                                self.set_progress(now=80.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | GLCM features extraction")

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = MEDimage.biomarkers.glcm.extract_all(
                                        vol=vol_quant_re_texture,
                                        dist_correction=MEDimg.params.radiomics.glcm.dist_correction,
                                        merge_method=MEDimg.params.radiomics.glcm.merge_method)
                                else:
                                    # Extracts co-occurrence matrices from the intensity roi mask prior to features
                                    matrices_dict = MEDimage.biomarkers.glcm.get_glcm_matrices(
                                        vol_quant_re_texture,
                                        merge_method=MEDimg.params.radiomics.glcm.merge_method,
                                        dist_weight_norm=MEDimg.params.radiomics.glcm.dist_correction)

                                    # If not all features need to be extracted, use the name of each feature to build
                                    # extraction code (executed dynamically using exec()).
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        function_name = "MEDimage.biomarkers.glcm." + str(features_to_extract[i])
                                        function_params = "matrices_dict"
                                        function_call = "result = " + function_name + "(" + function_params + ")"
                                        local_vars = {}
                                        global_vars = {"MEDimage": MEDimage, "matrices_dict": matrices_dict}
                                        exec(function_call, global_vars, local_vars)

                                        feature_name_convention = "Fcm_" + str(features_to_extract[i])
                                        features[feature_name_convention] = local_vars.get("result")

                                print("---> glcm features extracted")

                                # update progress
                                self.set_progress(now=83.0/len(self.pipelines))

                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF GLCM FEATURES {str(e)}"}

                        # GLRLM
                        elif feature_name == "glrlm":
                            try:
                                # update progress
                                self.set_progress(now=83.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | GLRLM features extraction")

                                # TODO : temporary code used to replace single feature extraction for user
                                all_features = MEDimage.biomarkers.glrlm.extract_all(
                                    vol=vol_quant_re_texture,
                                    dist_correction=MEDimg.params.radiomics.glrlm.dist_correction,
                                    merge_method=MEDimg.params.radiomics.glrlm.merge_method)

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = all_features
                                else:
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        feature_name_convention = "Frlm_" + str(features_to_extract[i])
                                        features[feature_name_convention] = all_features[feature_name_convention]

                                print("---> glrlm features extracted")

                                # update progress
                                self.set_progress(now=86.0/len(self.pipelines))
                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF GLRLM FEATURES {str(e)}"}

                        # GLSZM
                        elif feature_name == "glszm":
                            try:
                                # update progress
                                self.set_progress(now=86.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | GLSZM features extraction")

                                # TODO : temporary code used to replace single feature extraction for user
                                all_features = MEDimage.biomarkers.glszm.extract_all(vol=vol_quant_re_texture)

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = all_features
                                else:
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        feature_name_convention = "Fszm_" + str(features_to_extract[i])
                                        features[feature_name_convention] = all_features[feature_name_convention]

                                print("---> glszm features extracted")

                                # update progress
                                self.set_progress(now=89.0/len(self.pipelines))
                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF GLSZM FEATURES {str(e)}"}

                        # GLDZM
                        elif feature_name == "gldzm":
                            try:
                                # update progress
                                self.set_progress(now=92.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | GLDZM features extraction")

                                # TODO : temporary code used to replace single feature extraction for user
                                all_features = MEDimage.biomarkers.gldzm.extract_all(
                                        vol_int=vol_quant_re_texture,
                                        mask_morph=roi_obj_morph_texture.data)

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = all_features
                                else:
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        feature_name_convention = "Fdzm_" + str(features_to_extract[i])
                                        features[feature_name_convention] = all_features[feature_name_convention]

                                print("---> gldzm features extracted")

                                # update progress
                                self.set_progress(now=95.0/len(self.pipelines))
                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF GLDZM FEATURES {str(e)}"}

                        # NGTDM
                        elif feature_name == "ngtdm":
                            try:
                                # update progress
                                self.set_progress(now=95.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | NGTDM features extraction")

                                # TODO : temporary code used to replace single feature extraction for user
                                all_features = MEDimage.biomarkers.ngtdm.extract_all(
                                        vol=vol_quant_re_texture,
                                        dist_correction=MEDimg.params.radiomics.ngtdm.dist_correction)

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = all_features
                                else:
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        feature_name_convention = "Fngt_" + str(features_to_extract[i])
                                        features[feature_name_convention] = all_features[feature_name_convention]

                                print("---> ngtdm features extracted")

                                # update progress
                                self.set_progress(now=98.0/len(self.pipelines))

                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF NGTDM FEATURES {str(e)}"}

                        # NGLDM
                        elif feature_name == "ngldm":
                            try:
                                # update progress
                                self.set_progress(now=98.0/len(self.pipelines), label=f"Pip {idx_pip + 1} | NGLDM features extraction")

                                # TODO : temporary code used to replace single feature extraction for user
                                all_features = MEDimage.biomarkers.ngldm.extract_all(vol=vol_quant_re_texture)

                                # If all features need to be extracted
                                if features_to_extract[0] == "extract_all":
                                    features = all_features
                                else:
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        feature_name_convention = "Fngl_" + str(features_to_extract[i])
                                        features[feature_name_convention] = all_features[feature_name_convention]

                                    """ NOTE : Code to use in prevision of future MEDimage update allowing extraction of single features
                                    matrices_dict = MEDimage.biomarkers.ngldm.get_ngldm_matrices(
                                        vol=vol_quant_re_texture)
                                    
                                    # If only some features need to be extracted, use the name of the feature to build
                                    # extraction code (executed dynamically using exec()).
                                    features = {}
                                    for i in range(len(features_to_extract)):
                                        function_name = "MEDimage.biomarkers.ngldm." + str(features_to_extract[i])
                                        function_params = "matrices_dict"
                                        function_call = "result = " + function_name + "(" + function_params + ")"
                                        local_vars = {}
                                        global_vars = {"MEDimage": MEDimage, "matrices_dict": matrices_dict}
                                        exec(function_call, global_vars, local_vars)
                                        features[str(features_to_extract[i])] = local_vars.get("result")
                                    """

                                print("---> ngldm features extracted")

                                # update progress
                                self.set_progress(now=100.0/len(self.pipelines))

                            except Exception as e:
                                return {"error": f"PROBLEM WITH COMPUTATION OF NGLDM FEATURES {str(e)}"}

                        # FEATURE NOT FOUND
                        else:
                            print("Feature : ", feature_name, " is not a valid feature name.")

                        # Add feature to dictionnary
                        if features is not None:
                            features = self.__format_features(features)
                            features_res[feature_name] = features  # UP response
                            output_obj[feature_name] = features  # UP runs

                    # Update output infos of extraction node
                    update_pip = True
                    id_obj["output"] = output_obj

                # NODE NOT FOUND
                else:
                    print("Node not implemented yet:", content["name"])

                    # add relevant nodes
                if (update_pip):
                    pip_obj[content["id"]] = id_obj

            # Update final progress
            self.set_progress(now=100.0, label="Done!")

            # pip features and settings update
            pip_res["features"] = features_res
            pip_res["settings"] = settings_res
            scan_res[pip_name_res] = pip_res

            pips_res[filename_loaded] = scan_res  # pips response update
            pips_obj[pip_name_obj] = pip_obj  # pips object update
        
        # Update RUNS dict
        print("FINISHED ALL")
        self.runs[self.nb_runs] = pips_obj

        print("RUNS DICT : ", self.runs)
        
        # Pickle dump runs
        with open(os.path.join(UPLOAD_FOLDER, "runs.pkl"), 'wb') as f:
            pickle.dump(self.runs, f)
        
        return pips_res
    
    def get_3d_view(self):
        """
        Plots the 3D view of the volume and the ROI.
        """
        try:
            if "name" not in self.json_config:
                return {"error": "Wrong dict sent to server: name key is missing in the json_config. Must send node content dict."}
            if "file_loaded" in self.json_config and self.json_config["file_loaded"] != "":
                file_path = os.path.join(UPLOAD_FOLDER, self.json_config["file_loaded"])
            else:
                return {"error": "No file loaded. Please load a file before trying to visualize it."}

            # Load and store MEDimage instance from file loaded
            with open(file_path, 'rb') as f:
                medscan = pickle.load(f)
                medscan = MEDimage.MEDscan(medscan)
            self.medscan_obj[self.json_config["file_loaded"]] = medscan

            # Upload runs
            if "runs.pkl" in os.listdir(UPLOAD_FOLDER):
                with open(os.path.join(UPLOAD_FOLDER, "runs.pkl"), 'rb') as f:
                    self.runs = pickle.load(f)
            
            # View 3D image
            image_viewer(self.medscan_obj, self.json_config, self.runs)

            # All set
            return {"success": "3D view successfully plotted."}
        
        except Exception as e:
            return {"error": str(e)}
    
    def get_upload(self):
        try:
            up_file_infos = {}
            # check if the post request has the file part
            if 'file' not in self.json_config and self.json_config['file'] != "":
                return {"error": "No file found in the configuration dict."}
            elif 'type' not in self.json_config and self.json_config['type'] != "":
                return {"error": "No type found in the configuration dict."}

            file = self.json_config["file"]
            file_type = self.json_config["type"]

            if file_type == "folder":
                # Initialize the DataManager class
                path_to_dicoms = file
                dm = MEDimage.wrangling.DataManager(path_to_dicoms=path_to_dicoms, path_save=UPLOAD_FOLDER, save=True)

                # Process the DICOM scan
                dm.process_all_dicoms()

                # Ray shutdown for safety
                ray.shutdown()

                # Get the path to the file created by MEDimage
                file = dm.path_to_objects[0]

            # Check if the file is a valid pickle object
            if file and allowed_pickle_object(file):
                filename = os.path.basename(file)
                file_path = os.path.join(UPLOAD_FOLDER, filename)

                if file_type == "file":
                    shutil.copy2(file, file_path)

                # Load and store MEDimage instance from file loaded
                with open(file_path, 'rb') as f:
                    medscan = pickle.load(f)
                medscan = MEDimage.MEDscan(medscan)
                self.medscan_obj[filename] = medscan

                # Return infos of instance loaded
                rois_list = medscan.data.ROI.roi_names
                up_file_infos["name"] = filename
                up_file_infos["rois_list"] = rois_list
                return up_file_infos
            else:
                return {"error": "The file you tried to upload doesnt have the right format."}
        except Exception as e:
            return {"error": str(e)}
    
    def run(self) -> dict:
        try:
            pip = []
            if "json_scene" in self.json_config:
                if "id" not in self.json_config:
                    return {"error": "The id of the node where the run button was clicked is missing."}
                start_id = self.json_config["id"]  # id of node where run button was clicked
                self.json_config = self.json_config["json_scene"]
            pip = self.generate_pipelines_from_node(str(start_id), get_node_content(start_id, self.json_config), pip)

            print("The pipelines found ending with node ", start_id, " are ")
            json_res = self.execute_pips()

            return json_res
        except Exception as e:
            return {"error": str(e)}
    
    def run_all(self) -> dict:
        try:
            drawflow_scene = self.json_config['drawflow']
            for module in drawflow_scene:  # We scan all module in scene
                for node_id in drawflow_scene[module]['data']:  # We scan all node of each module in scene
                    node_content = drawflow_scene[module]['data'][node_id]  # Getting node content
                    if node_content["name"] == "input":  # If the node name is input, it is the start of a pipeline
                        pip = []
                        pip = self.generate_all_pipelines(str(node_content["id"]), node_content, [])

            print("\n The pipelines found in the current drawflow scene are : ", self.pipelines)
            json_res = self.execute_pips()

            return json_res  # return pipeline results in the form of a dict
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
        if "nBatch" in self.json_config.keys():
            n_batch = self.json_config["nBatch"]

        # Check if at least one path to data is given
        if not ("pathDicoms" in self.json_config.keys() and self.json_config["pathDicoms"] != "") and not (
                "pathNiftis" in self.json_config.keys() and self.json_config["pathNiftis"] != ""):
            return {"error": "No path to data given! At least DICOM or NIFTI path must be given."}
        
        # Init DataManager instance
        try:
            dm = MEDimage.wrangling.DataManager(
            path_to_dicoms=path_to_dicoms,
            path_to_niftis=path_to_niftis,
            path_save=path_save,
            path_csv=path_csv,
            save=save, 
            n_batch=n_batch)

            # Run the DataManager
            if path_to_dicoms is not None and path_to_niftis is None:
                dm.process_all_dicoms()
            elif path_to_dicoms is None and path_to_niftis is not None:
                dm.process_all_niftis()
            else:
                dm.process_all()
            
            # Return success message
            summary = dm.summarize(return_summary=True).to_dict()
            
            # Get the number of rows
            num_rows = len(summary["count"])

            # Create a list of objects in the desired format
            result = []
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
        if "save" in data.keys():
            save = data["save"]
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
            # path save (TODO: find another work-around)
            path_save_checks = Path.cwd().parent / "renderer/public/images"
            
            # Init DataManager instance
            dm = MEDimage.wrangling.DataManager(
                path_to_dicoms=path_to_dicoms,
                path_to_niftis=path_to_niftis,
                path_save=path_save,
                path_csv=path_csv,
                path_save_checks=path_save_checks,
                save=save, 
                n_batch=n_batch)

            # Run the DataManager
            dm.pre_radiomics_checks(
                path_data=path_npy,
                wildcards_dimensions=wildcards_dimensions, 
                wildcards_window=wildcards_window, 
                path_csv=path_csv,
                save=True)

            # Get pre-checks images
            # Find all png files in path
            list_png = list((path_save_checks / 'checks').glob('*.png'))
            list_titles = [png.name for png in list_png]
            list_png = [str(png) for png in list_png]
            url_list = ['.' + png.split('public')[-1].replace('\\', '/') for png in list_png]
        
        except Exception as e:
            print("\nERROR : ", str(e))
            return {"error": str(e)}
        
        # Return success message
        return {"url_list": url_list, "list_titles": list_titles, "message": "Pre-checks done successfully."}
    
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
            path_csv = None
        if "path_params" in data.keys() and data["path_params"] != "":
            path_params = Path(data["path_params"])
        else:
            path_params = None
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
                print("Multiple arguments missing")
                return {"error": "No path to data given! At least path to read, params and csv must be given."}
            
            # Init BatchExtractor instance
            be = MEDimage.biomarkers.BatchExtractor(
                path_read=path_read,
                path_csv=path_csv,
                path_params=path_params,
                path_save=path_save,
                n_batch=n_batch)

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