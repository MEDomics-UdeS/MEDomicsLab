from copy import deepcopy

import MEDimage
from ..node import Node
from ..pipeline import Pipeline

class DiscretizationNode(Node):
    """
    Subclass of Node that implements the discretization of a volume.
    """
    def __init__(self, params: dict) -> None:
        super().__init__(params)
        
    def run(self, pipeline: Pipeline) -> None:
        print("************************ RUNNING DISCRETIZATION ***************************")
        # Discretization for NON TEXTURE FEATURES
        ## Only a roi_extraction_node can be before a discretization_node, so vol_int_re must be in the pipeline
        if "vol_int_re" in pipeline.latest_node_output and pipeline.latest_node_output["vol_int_re"] is not None:
            vol_int_re = pipeline.latest_node_output["vol_int_re"]    
        else:
            raise ValueError("No volume to discretize.")
        
        ## Intensity discretization for IH computation (returns an ndarray and a float)
        vol_quant_re, _ = MEDimage.processing.discretisation.discretize(
            vol_re=vol_int_re,  # vol_int_re
            discr_type=pipeline.MEDimg.params.process.ih["type"],
            n_q=pipeline.MEDimg.params.process.ih["val"],
            user_set_min_val=pipeline.MEDimg.params.process.user_set_min_value, # TODO : user_set_min_val necessary for ih?
            ivh=False
        )
        
        ## Update the latest output object of the pipeline
        pipeline.latest_node_output["vol_quant_re"] = vol_quant_re 
        
        ## Update the output of the node
        self.output["vol"] = deepcopy(vol_quant_re)
        self.output["roi"] = deepcopy(pipeline.latest_node_output["roi"].data)
        
        ## Intensity discretization for IVH computation
        if pipeline.MEDimg.params.process.ivh and 'type' in pipeline.MEDimg.params.process.ivh and 'val' in pipeline.MEDimg.params.process.ivh:
            if pipeline.MEDimg.params.process.ivh['type'] and pipeline.MEDimg.params.process.ivh['val']:
                vol_quand_re_ivh, wd = MEDimage.processing.discretisation.discretize(
                    vol_re=vol_int_re,  # vol_int_re
                    discr_type=pipeline.MEDimg.params.process.ivh["type"],
                    n_q=pipeline.MEDimg.params.process.ivh["val"],
                    user_set_min_val=pipeline.MEDimg.params.process.user_set_min_value,
                    ivh=True
                )
        else:
            vol_quand_re_ivh = deepcopy(vol_int_re)
            wd = 1
        
        ## Update the latest output object of the pipeline
        pipeline.latest_node_output["vol_quant_re_ivh"] = vol_quand_re_ivh
        pipeline.latest_node_output["wd"] = wd
        
        ## Update the output of the node
        self.output["vol_ivh"] = deepcopy(vol_quand_re_ivh)
        self.output["roi_ivh"] = deepcopy(pipeline.latest_node_output["roi"].data)
        
        # Discretization for TEXTURE FEATURES
        if "vol_int_re" in pipeline.latest_node_output_texture and pipeline.latest_node_output_texture["vol_int_re"] is not None:
            vol_int_re_texture = pipeline.latest_node_output_texture["vol_int_re"]
        else:
            vol_int_re_texture = deepcopy(vol_int_re)
            
        vol_quant_re_texture, _texture = MEDimage.processing.discretize(
                vol_re=vol_int_re_texture,
                discr_type=pipeline.MEDimg.params.process.algo[0],
                n_q=pipeline.MEDimg.params.process.gray_levels[0][0],
                user_set_min_val=pipeline.MEDimg.params.process.user_set_min_value
        )
       
        ## Update the latest output texture object of the pipeline 
        pipeline.latest_node_output_texture["vol_quant_re"] = vol_quant_re_texture
       
        ## Update the output of the node
        self.output["vol_texture"] = vol_quant_re_texture
        
        # Update settings results of the pipeline
        pipeline.settings_res['discretization'] = self.params
        