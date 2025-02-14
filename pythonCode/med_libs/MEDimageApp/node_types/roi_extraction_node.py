import MEDimage
from ..node import Node
from ..pipeline import Pipeline

class ROIExtractionNode(Node):
    """
    Subclass of Node that implements the ROI extraction of a volume.
    """
    def __init__(self, params: dict):
        super().__init__(params)
        
    def run(self, pipeline: Pipeline):
        print("************************ RUNNING ROI EXTRACTION ***************************")
        # Compute ROI extraction for NON TEXTURE FEATURES
        ## Get the latest volume and roi output of the pipeline
        vol_obj = pipeline.latest_node_output["vol"] # comes from interpolation or filter node
        roi_obj_int = pipeline.latest_node_output["roi"] # comes from re_segmentation node (or segmentation node)
        
        ## ROI extraction (returns ndarray)
        vol_int_re = MEDimage.processing.roi_extract(
            vol=vol_obj.data,
            roi=roi_obj_int.data
        )
        
        ## Update the latest output object of the pipeline
        pipeline.latest_node_output["vol_int_re"] = vol_int_re
        
        ## Update the output of the node
        self.output["vol"] = vol_int_re
        self.output["roi"] = roi_obj_int.data

        # Compute ROI extraction for TEXTURE FEATURES
        ## Check if there is an output for texture features
        if pipeline.latest_node_output_texture["vol"] is not None:
            ## Get the latest texture volume and roi output of the pipeline
            vol_obj_texture = pipeline.latest_node_output_texture["vol"] # comes from interpolation or filter node
            roi_obj_int_texture = pipeline.latest_node_output_texture["roi"] # comes from re_segmentation node

            ## ROI extraction (returns ndarray)
            vol_int_re_texture = MEDimage.processing.roi_extract(
                    vol=vol_obj_texture.data,
                    roi=roi_obj_int_texture.data
            )
            
            ## Update the latest output object of the pipeline
            pipeline.latest_node_output_texture["vol_int_re"] = vol_int_re_texture
            
            # Update the output of the node
            self.output["vol_texture"] = vol_int_re_texture
            self.output["roi_texture"] = roi_obj_int_texture.data