from copy import deepcopy
import numpy as np
from ..node import Node
import MEDimage
from ..pipeline import Pipeline

class ReSegmentationNode(Node):
    """
    Subclass of Node that implements the re-segmentation of a volume.
    """
    def __init__(self, params: dict) -> None:
        super().__init__(params)
        
    def run(self, pipeline: Pipeline) -> None:
        print("************************ RUNNING RE-SEGMENTATION ***************************")
        # Compute re-segmentation for NON TEXTURE FEATURES
        ## Get the latest volume output of the pipeline (should be the one from interpolation or segmentation node)
        vol_obj = pipeline.latest_node_output["vol"]
        
        ## Create deep copy of roi_obj_morph to avoid modifying the original object
        # Check if roi_obj_morph is present, otherwise missing interpolation node, use latest roi object as a fallback
        if "roi_obj_morph" in pipeline.latest_node_output and pipeline.latest_node_output["roi_obj_morph"] is not None:
            roi_obj_int = deepcopy(pipeline.latest_node_output["roi_obj_morph"])
        elif "roi" in pipeline.latest_node_output and pipeline.latest_node_output["roi"] is not None:
            roi_obj_int = deepcopy(pipeline.latest_node_output["roi"])
        else:
            raise ValueError("No roi object found in pipeline.")
        
        ## Intensity mask range re-segmentation (returns an ndarray)
        roi_obj_int.data = MEDimage.processing.range_re_seg(
            vol=vol_obj.data,
            roi=roi_obj_int.data,
            im_range=pipeline.MEDimg.params.process.im_range
        )
        
        ## Intensity mask outlier re-segmentation (returns an ndarray)
        roi_obj_int.data = np.logical_and(
            MEDimage.processing.outlier_re_seg(
                vol=vol_obj.data,
                roi=roi_obj_int.data,
                outliers=pipeline.MEDimg.params.process.outliers
            ),
            roi_obj_int.data
        ).astype(int)
        
        ## Update the latest output object of the pipeline (only the roi was modified)
        #pipeline.latest_node_output["roi"] = roi_obj_int
        # Keep a reference to roi_obj_int in the pipeline for future feature extraction
        pipeline.latest_node_output["roi_obj_int"] = roi_obj_int
        
        ## Update the output of the node
        self.output["vol"] = vol_obj.data
        self.output["roi"] = roi_obj_int.data
        
        # Compute re-segmentation for TEXTURE FEATURES
        if "vol" in pipeline.latest_node_output_texture and pipeline.latest_node_output_texture["vol"] is not None:
            ## Get the latest texture volume output of the pipeline (should be the one from interpolation node)
            vol_obj_texture = pipeline.latest_node_output_texture["vol"]

            ## Create deep copy of texture roi_obj_morph to avoid modifying the original object
            roi_obj_int_texture = deepcopy(pipeline.latest_node_output_texture["roi_obj_morph"])
            
            ## Intensity mask range re-segmentation (returns an ndarray)
            roi_obj_int_texture.data = MEDimage.processing.range_re_seg(
                    vol=vol_obj_texture.data,
                    roi=roi_obj_int_texture.data,
                    im_range=pipeline.MEDimg.params.process.im_range
            )
            
            ## Intensity mask outlier re-segmentation (returns an ndarray)
            roi_obj_int_texture.data = np.logical_and(
                MEDimage.processing.outlier_re_seg(
                    vol=vol_obj_texture.data,
                    roi=roi_obj_int_texture.data,
                    outliers=pipeline.MEDimg.params.process.outliers
                ),
                roi_obj_int_texture.data
            ).astype(int)
            
            ## Update the latest texture output object of the pipeline (only the roi was modified)
            pipeline.latest_node_output_texture["roi"] = roi_obj_int_texture
            
            # Keep a reference to roi_obj_int in the pipeline for future feature extraction
            pipeline.latest_node_output_texture["roi_obj_int"] = roi_obj_int_texture
        
            ## Update the output of the node
            self.output["vol_texture"] = vol_obj_texture.data
            self.output["roi_texture"] = roi_obj_int_texture.data
            
        # Update settings results of pipeline
        ## If re-segmentation is not serialized, change inf to string
        if np.isinf(pipeline.MEDimg.params.process.im_range[1]):
            self.params["range"][1] = "inf"
        if np.isinf(pipeline.MEDimg.params.process.im_range[0]):
            self.params["range"][0] = "inf"      
        pipeline.settings_res["re_segmentation"] = self.params
