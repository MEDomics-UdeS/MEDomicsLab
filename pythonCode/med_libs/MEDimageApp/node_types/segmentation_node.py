import MEDimage
from ..node import Node
from ..pipeline import Pipeline

class SegmentationNode(Node):
    """
    Subclass of Node that implements the segmentation of a volume.
    """
    def __init__(self, params: dict):
        super().__init__(params)
        
        self.selected_rois = self.params['rois_data']  # TODO : Check if rois_data is empty!
        
    def run(self, pipeline: Pipeline):
        print("************************ RUNNING SEGMENTATION ***************************")
        #Extract the ROI mask (returns two image_volume_objects: vol_obj_init and roi_obj_init)
        vol_obj_init, roi_obj_init = MEDimage.processing.get_roi_from_indexes(
            pipeline.MEDimg,
            name_roi=self.selected_rois,
            box_string="full"
        )
        
        # Update the latest output object of the pipeline
        pipeline.latest_node_output["vol"] = vol_obj_init
        pipeline.latest_node_output["roi"] = roi_obj_init
        
        # Update the output of the node
        self.output["vol"] = vol_obj_init.data
        self.output["roi"] = roi_obj_init.data
        
        # Update settings results of the pipeline
        pipeline.settings_res['segmentation'] = self.params