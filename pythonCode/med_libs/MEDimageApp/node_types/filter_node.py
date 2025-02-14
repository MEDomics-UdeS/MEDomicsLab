from copy import deepcopy
import MEDimage
from ..node import Node
from ..pipeline import Pipeline

class FilterNode(Node):
    """
    Subclass of Node that implements the filtering of a volume.
    """
    def __init__(self, params: dict) -> None:
        super().__init__(params)
        
    def run(self, pipeline: Pipeline) -> None:
        print("************************ RUNNING FILTER ***************************")
        # Set the correct filter type in the MEDimg object
        pipeline.MEDimg.params.filter.filter_type = self.params["filter_type"]
        
        # Compute filter for NON TEXTURE FEATURES
        ## Apply filter to the imaging volume 
        vol_obj_filter = MEDimage.filters.apply_filter(
            pipeline.MEDimg, 
            pipeline.latest_node_output["vol"] # Comes from interpolation node (IBSI)
        )
                        
        ## Update the latest output object of the pipeline
        pipeline.latest_node_output["vol"] = vol_obj_filter
                
        ## Update the output of the node
        self.output["vol"] = deepcopy(vol_obj_filter.data)
        self.output["roi"] = deepcopy(pipeline.latest_node_output["roi"].data)

        # Compute filter for TEXTURE FEATURES
        ## Check if there is an output for texture features
        if "vol" in pipeline.latest_node_output_texture and pipeline.latest_node_output_texture["vol"] is not None:
            ## Apply filter to the imaging volume 
            vol_obj_filter_texture = MEDimage.filters.apply_filter(
                pipeline.MEDimg, 
                pipeline.latest_node_output_texture["vol"] # Comes from interpolation node
            )
                
            ## Update the latest output object of the pipeline
            pipeline.latest_node_output_texture["vol"] = vol_obj_filter_texture
        
            ## Update the output of the node
            self.output["vol_texture"] = vol_obj_filter_texture.data
            self.output["roi_texture"] = pipeline.latest_node_output_texture["roi"].data
        
        # Update settings results of the pipeline
        pipeline.settings_res["filter"] = self.params