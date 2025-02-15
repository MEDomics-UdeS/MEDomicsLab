import os
from pathlib import Path
from typing import List

import MEDimage
from .node import Node

JSON_SETTINGS_PATH = Path(os.path.join(os.path.dirname(os.path.abspath(__file__)))) / 'settings/settings_frame.json'

class Pipeline:
    """
    Class representing a pipeline of nodes. A pipeline is a sequence of nodes that are executed in order.
    A pipeline must start with an input node. 
    """
    def __init__(self, nodes: List[Node], id: int, name: str) -> None:
        """
        Constructor of the Pipeline class.

        Args:
            nodes (List[Node]): Ordered list of nodes in the pipeline.
            id (int): Id of the pipeline.
            name (str): Name of the pipeline.
        
        Returns:
            None.
        """
        self.nodes = nodes  # List of nodes object in the pipeline
        self.id = id  # ID of the pipeline
        self.pipeline_name = name  # Name of the pipeline
        self.MEDimg = None  # MEDimg object of the input image
        self.latest_node_output = {key: None for key in ["vol", "roi"]} # Output of the latest node in the pipeline (used for non texture features)
        self.latest_node_output_texture = {key: None for key in ["vol", "roi"]}  # Output of the latest node in the pipeline (used for texture features)
        self.settings_res = {}  # Dictionary to store the settings results of the pipeline
        self.scan_res = {}  # Dictionary to store the scan results (radiomics)
        # Dictionary that contains the parameters of the image processing pipeline in the format used by MEDimage.
        self.im_params = MEDimage.utils.json_utils.load_json(JSON_SETTINGS_PATH)  # Loading default settings from MEDimageApp json file as im_params

    def __eq__(self, pipeline: "Pipeline") -> bool:
        """
        Compares two pipelines. Two pipelines are equal if they have the same id and
        the same list of nodes.

        Args:
            pipeline (Pipeline): Pipeline to compare with.

        Returns:
            bool: True if the pipelines are equal, False otherwise.
        """
        return self.nodes == pipeline.nodes

    def contains_node(self, node_id: str) -> bool:
        """
        Checks if the pipeline contains a node with the given id.

        Args:
            node_id (str): Id of the node to check for.

        Returns:
            bool: True if the node is in the pipeline, False otherwise.
        """
        return any(node.id == node_id for node in self.nodes)

    def get_previous_node_output(self, node: Node) -> dict:
        """ 
        Given a node, return the output of the previous node in the pipeline.

        Args:
            node (Node): Node for which to get the previous output.
        
        Returns:
            dict: Output of the previous node in the pipeline.
        """
        prev = [self.nodes[i-1] for i in range(len(self.nodes)) if self.nodes[i].id == node.id]
        if prev:
            return prev[0].output
        else:
            return None
    
    def get_node_output_from_type(self, node_name: str) -> dict:
        """ 
        Checks if a node with the given type (name) exists in the pipeline and returns its output.

        Args:
            node_name (str): _description_

        Returns:
            dict: Output of the node with the given name.
        """
        for node in self.nodes:
            if node.name == node_name:
                return node.output
        return {"error": f"Node not found in pipeline."}  # TODO : Good way to return error?    
    
    def update_im_params(self) -> None:
        """ 
        Update the im_params dictionnary with the parameters of the nodes in the pipeline.
        
        Args:
            None.
            
        Returns:
            None.
        """
        scan_type = self.nodes[0].scan_type # Get the scan type from the input node
        
        for node in self.nodes:
            if (node.name == "filter"):
                self.im_params["imParamFilter"] = node.params
                
            elif (node.name == "interpolation"):
                self.im_params[scan_type]["interp"] = node.params

            elif (node.name == "re_segmentation"):
                self.im_params[scan_type]["reSeg"] = node.params

            elif (node.name == "discretization"):
                self.im_params[scan_type]["discretisation"] = node.params
            
            elif (node.name == "extraction"):
                for feature_node in node.params:
                    feature_name = node.params[feature_node]["name"]
                    if feature_name in ["glcm", "glrlm"]:
                        self.im_params[scan_type][feature_name]["dist_correction"] = node.params[feature_node]["data"]["dist_correction"]
                        self.im_params[scan_type][feature_name]["merge_method"] = node.params[feature_node]["data"]["merge_method"]
    
    def update_pipeline(self, new_pipeline: "Pipeline") -> None:
        """ 
        Update the current pipeline with the new pipeline.
        
        Args:
            new_pipeline (Pipeline): Pipeline to update with.
            
        Returns:
            None.
        """
        for i in range(len(self.nodes)):
            self.nodes[i].change_params(new_pipeline.nodes[i].params)
    
    def run(self, set_progress: dict, node_id: str = "all", pipeline_number: int = 1) -> dict:
        """
        Runs the pipeline up to the node associated with node_id and collects the results
        in a dictionary.

        Args:
            set_progress (dict): Function to set the progress of a pipeline execution.
            node_id (str, optional): Id of the node to stop at in the pipeline. Defaults to 
                                     "all" (running all the nodes in the pipeline).

        Returns:
            dict: Dictionary of the results of the pipeline execution. Contains the features extracted
                  (if any) and the settings used in the pipeline.
        """
        # Reset the results of the pipeline
        self.settings_res = {}
        self.scan_res = {}
    
        # Precautionary measure since upon running the input node, im_params is updated with the parameters of the nodes
        self.im_params = MEDimage.utils.json_utils.load_json(JSON_SETTINGS_PATH)  # Loading default settings from MEDimageApp json file as im_params
        
        # The pipeline is starting, set the progress to 0%
        set_progress(now=0, label=f"Starting pipeline : " + self.pipeline_name)
        
        # Number of nodes in the pipeline
        number_nodes = len(self.nodes)

        # Run each node in the pipeline in order up to node_id
        for index, node in enumerate(self.nodes, start = 1):
            
            # Update the progress bar
            if node.name.lower() != "extraction":
                progress = int(index * 100 / number_nodes)
                set_progress(now=progress, label=f"Pipeline " + str(pipeline_number) + " | Running node : " + node.name)

            # Run node
            if node.name.lower() == "extraction":
                node.run(self, pipeline_number, set_progress, progress)
            else:
                node.run(self)
            
            if node.id == node_id:
                break
        
        # Create the results dictionary
        results = {
            "features": self.scan_res, 
            "settings": self.settings_res
        }
        
        # Reset the latest node output
        self.MEDimg = None
        self.latest_node_output = {key: None for key in ["vol", "roi"]}
        self.latest_node_output_texture = {key: None for key in ["vol", "roi"]}

        return results