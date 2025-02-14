import pickle

import MEDimage
from ..MEDimageExtraction import UPLOAD_FOLDER
from ..node import Node
from ..pipeline import Pipeline

class InputNode(Node):
    """
    Subclass of Node that implements the uploading of a pickled MEDimage object.
    """
    def __init__(self, params: dict) -> None:
        super().__init__(params)
        
        # Check if the filepath is empty
        if params["data"]["filepath"] == "":
            raise ValueError("No file uploaded in input node : " + self.id)
        self.filepath = params["data"]["filepath"]

        self.scan_type = None  # Formatted scan type of the image
    
    def change_params(self, new_params: dict) -> None:
        self.filepath = new_params["filepath"]
    
    def run(self, pipeline: Pipeline) -> None:
        print("************************ RUNNING INPUT ***************************")
        # Load the MEDimg object from the input file
        with open(UPLOAD_FOLDER / self.filepath, 'rb') as f:
            MEDimg = pickle.load(f)
        MEDimg = MEDimage.MEDscan(MEDimg)
        
        # Check the scan type of the input image and format it to correspond with the pipeline im_params
        scan_type = MEDimg.type
        if scan_type == "PTscan":
            scan_type = "imParamPET"
        else:
            scan_type = "imParam" + scan_type[:-4]
        self.scan_type = scan_type
        
        # Update the im_params of the pipeline with the scan type
        pipeline.update_im_params()
        # Update the MEDimg object with the pipeline im_params
        MEDimg.init_params(pipeline.im_params)
        
        # Remove dicom header from MEDimg object as it causes errors in get_3d_view()
        # TODO: check if dicom header is needed in the future
        MEDimg.dicomH = None
        
        # Place the result in the pipeline
        pipeline.MEDimg = MEDimg
        
        # Update the output of the node
        self.output["vol"] = MEDimg.data.volume.array