import MEDimage
import numpy as np
from ..node import Node
from ..pipeline import Pipeline

class ExtractionNode(Node):
    """
    Subclass of Node that implements the extraction of radiomic features.
    """
    def __init__(self, params: dict) -> None:
        super().__init__(params)
        
        self.extracted_features = {}  # Dictionary to store the extracted features

    def change_params(self, new_params: dict) -> None:
        """
        Change the parameters of the node.

        Args:
            new_params (dict): Dictionary containing the new parameters of the node.
            
        Returns:
            None.
        """
        self.params = new_params
        self.extracted_features = {}  # Reset the extracted features dictionary 

    def __manage_exception(self, e: Exception) -> dict:
        """
        Manages exceptions that occur during the extraction of features.

        Args:
            e (Exception): Exception that occurred during the extraction of features.

        Returns:
            dict: Dictionary containing the error message.
        """
        # Get the string representation of the exception
        string_exception = str(e)
        
        if "vol_quant_re" in string_exception:
            return {"Error": f"A discretization node needs to be in the pipeline to compute these features."}
        
        if "roi_obj_morph" in string_exception:
            return {"Error": f"An interpolation node needs to be in the pipeline to compute these features."}
        
        if "vol_int_re" in string_exception:
            return {"Error": f"A ROI extraction node needs to be in the pipeline to compute these features."}
        
        if "arbitrary" in string_exception:
            return {"Error": f"These features cannot be computed using an image with arbitrary intensities."}
        
        return {"Error": f"Problem with computation of features {string_exception}"}
    
    def __sort_features_by_categories(self) -> None:
        """
        Sorts the extracted features keys (features families) to always be in the same order.
       
        Args:
            None. 

        Returns:
            None.
        """
        
        features_order = ["morph", "local_intensity", "stats", "intensity_histogram", "int_vol_hist", "glcm", "glrlm", "glszm", "gldzm", "ngtdm", "ngldm"]
        
        self.extracted_features = {features: self.extracted_features[features] for features in features_order if features in self.extracted_features}
    
    def get_morph_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of morphological features.

        Args:
            features_to_extract (list[str]): List of the morphological features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted morphological features.
        """
        try:
            # Initialize variables
            features = {}
            last_feat_vol = pipeline.latest_node_output["vol"]
            last_feat_roi = pipeline.latest_node_output["roi"]
            if "roi_obj_morph" not in pipeline.latest_node_output_texture or pipeline.latest_node_output_texture["roi_obj_morph"] is None:
                #raise Exception("roi_obj_morph")
                roi_obj_morph = last_feat_roi
            else:
                roi_obj_morph = pipeline.latest_node_output["roi_obj_morph"]

            # Extract all features
            # Note : Since the computation of morph features doesn't take a lot of time, we can extract all features
            # and then filter the ones we want instead of making multiple calls to the extraction functions.
            features = MEDimage.biomarkers.morph.extract_all(
                vol=last_feat_vol.data,  # vol_obj.data
                mask_int=last_feat_roi.data,  # roi_obj_int.data,
                mask_morph=roi_obj_morph.data,  # roi_obj_morph.data
                res=pipeline.MEDimg.params.process.scale_non_text,
                intensity_type=pipeline.MEDimg.params.process.intensity_type
            )
            
            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Fmorph_" + str(feature_type)) in features
                }
                    
            return features

        except Exception as e:
            return self.__manage_exception(e)
    
    def get_local_intensity_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of local intensity features.

        Args:
            features_to_extract (list[str]): List of the local intensity features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted local intensity features.
        """
        try:
            # If the intensity type is arbitrary, the LI features cannot be extracted
            if pipeline.MEDimg.params.process.intensity_type == "arbitrary":
                raise Exception("arbitrary")
            
            # Initialize variables
            features = {}
            last_feat_vol = pipeline.latest_node_output["vol"]
            last_feat_roi = pipeline.latest_node_output["roi"]
            
            # Extract all features
            features = MEDimage.biomarkers.local_intensity.extract_all(
                    img_obj=last_feat_vol.data,  # vol_obj.data
                    roi_obj=last_feat_roi.data,  # roi_obj_int.data
                    res=pipeline.MEDimg.params.process.scale_non_text,
                    intensity_type=pipeline.MEDimg.params.process.intensity_type
            )
            
            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Floc_" + str(feature_type)) in features
                }
            
            return features
            
        except Exception as e:
            return self.__manage_exception(e)
    
    def get_stats_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of statistical features.

        Args:
            features_to_extract (list[str]): List of the statistical features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted statistical features.
        """
        try:
            features = {}
            
            # If the intensity type is arbitrary, the LI features cannot be extracted
            if pipeline.MEDimg.params.process.intensity_type == "arbitrary":
                raise Exception("arbitrary")
            
            #NOTE : Could just use vol_int_re and raise exception if not present, but would not be
            #       able to compute stats features when there is no ROI extraction node.
            if "vol_int_re" in pipeline.latest_node_output:
                last_feat_vol = pipeline.latest_node_output["vol_int_re"]
            else:
                last_feat_vol = pipeline.latest_node_output["vol"].data
            
            # If all features need to be extracted
            if features_to_extract[0] == "extract_all":
                features = MEDimage.biomarkers.stats.extract_all(
                    vol=last_feat_vol,  # vol_int_re
                    intensity_type=pipeline.MEDimg.params.process.intensity_type # Only definite type is accepted for calculating features
                )
            else:
                # If only some features need to be extracted, use the name of the feature to build
                # extraction code (executed dynamically using exec()).
                for i in range(len(features_to_extract)):
                    function_name = "MEDimage.biomarkers.stats." + str(features_to_extract[i])
                    function_params = "vol=last_feat_vol"
                    function_call = "result = " + function_name + "(" + function_params + ")"
                    local_vars = {}
                    global_vars = {"MEDimage": MEDimage, "last_feat_vol": last_feat_vol, "MEDimg": pipeline.MEDimg}
                    exec(function_call, global_vars, local_vars)

                    feature_name_convention = "Fstat_" + str(features_to_extract[i])
                    features[feature_name_convention] = local_vars.get("result")

            return features
            
        except Exception as e:
            return self.__manage_exception(e)

    def get_intensity_histogram_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of intensity histogram features.

        Args:
            features_to_extract (list[str]): List of the intensity histogram features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted intensity histogram features.
        """
        try:
            features = {}
            
            if "vol_quant_re" not in pipeline.latest_node_output or pipeline.latest_node_output["vol_quant_re"] is None:
                raise Exception("vol_quant_re")
            vol_quant_re = pipeline.latest_node_output["vol_quant_re"]
            
            # Extract all features
            # Note : Since the computation of intensity histogram features doesn't take a lot of time, we can extract all features
            # and then filter the ones we want instead of making multiple calls to the extraction functions.
            features = MEDimage.biomarkers.intensity_histogram.extract_all(vol=vol_quant_re)

            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Fih_" + str(feature_type)) in features
                }

            return features

        except Exception as e:
            return self.__manage_exception(e)

    def get_int_vol_hist_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of intensity volume histogram features.

        Args:
            features_to_extract (list[str]): List of the intensity volume histogram features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted intensity volume histogram features.
        """
        try:
            features = {}
            
            if "vol_quant_re_ivh" not in pipeline.latest_node_output or pipeline.latest_node_output["vol_quant_re_ivh"] is None:
                raise Exception("vol_quant_re")
            last_feat_vol = pipeline.latest_node_output["vol_quant_re_ivh"]
            
            if "vol_int_re" not in pipeline.latest_node_output or pipeline.latest_node_output["vol_int_re"] is None:
                raise Exception("vol_int_re")
            vol_int_re = pipeline.latest_node_output["vol_int_re"]
            
            wd = pipeline.latest_node_output["wd"]

            features = MEDimage.biomarkers.int_vol_hist.extract_all(
                medscan=pipeline.MEDimg,
                vol=last_feat_vol,  # vol_quant_re
                vol_int_re=vol_int_re,
                wd=wd  # TODO: Missing user_set_range argument?
            )
                        
            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Fint_vol_hist_" + str(feature_type)) in features
                }

            return features
        
        except Exception as e:
            return self.__manage_exception(e)

    def get_glcm_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of glcm features.

        Args:
            features_to_extract (list[str]): List of the glcm features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted glcm features.
        """
        try:
            features = {}
            
            if "vol_quant_re" not in pipeline.latest_node_output_texture or pipeline.latest_node_output_texture["vol_quant_re"] is None:
                raise Exception("vol_quant_re")
            vol_quant_re_texture = pipeline.latest_node_output_texture["vol_quant_re"]
            
            
            features = MEDimage.biomarkers.glcm.extract_all(
                    vol=vol_quant_re_texture,
                    dist_correction=pipeline.MEDimg.params.radiomics.glcm.dist_correction,
                    merge_method=pipeline.MEDimg.params.radiomics.glcm.merge_method
            )
            
            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Fcm_" + str(feature_type)) in features
                }
            
            return features

        except Exception as e:
            return self.__manage_exception(e)
    
    def get_glrlm_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of glrlm features.

        Args:
            features_to_extract (list[str]): List of the glrlm features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted glrlm features.
        """
        try:
            features = {}
            
            if "vol_quant_re" not in pipeline.latest_node_output_texture or pipeline.latest_node_output_texture["vol_quant_re"] is None:
                raise Exception("vol_quant_re")
            vol_quant_re_texture = pipeline.latest_node_output_texture["vol_quant_re"]

            # TODO : temporary code used to replace single feature extraction for user
            features = MEDimage.biomarkers.glrlm.extract_all(
                vol=vol_quant_re_texture,
                dist_correction=pipeline.MEDimg.params.radiomics.glrlm.dist_correction,
                merge_method=pipeline.MEDimg.params.radiomics.glrlm.merge_method
            )

            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Frlm_" + str(feature_type)) in features
                }

            return features
        
        except Exception as e:
            return self.__manage_exception(e)
    
    def get_glszm_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of glszm features.

        Args:
            features_to_extract (list[str]): List of the glszm features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted glszm features.
        """
        try:
            features = {}
            
            if "vol_quant_re" not in pipeline.latest_node_output_texture or pipeline.latest_node_output_texture["vol_quant_re"] is None:
                raise Exception("vol_quant_re")
            vol_quant_re_texture = pipeline.latest_node_output_texture["vol_quant_re"]

            # TODO : temporary code used to replace single feature extraction for user
            features = MEDimage.biomarkers.glszm.extract_all(vol=vol_quant_re_texture)

            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Fszm_" + str(feature_type)) in features
                }
            
            return features

        except Exception as e:
            return self.__manage_exception(e)
    
    def get_gldzm_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of gldzm features.

        Args:
            features_to_extract (list[str]): List of the gldzm features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted gldzm features.
        """
        try:
            features = {}
            
            if "vol_quant_re" not in pipeline.latest_node_output_texture or pipeline.latest_node_output_texture["vol_quant_re"] is None:
                raise Exception("vol_quant_re")
            vol_quant_re_texture = pipeline.latest_node_output_texture["vol_quant_re"]
            
            if "roi_obj_morph" not in pipeline.latest_node_output_texture or pipeline.latest_node_output_texture["roi_obj_morph"] is None:
                #raise Exception("roi_obj_morph")
                roi_obj_morph_texture = pipeline.latest_node_output["roi"]
            else:
                roi_obj_morph_texture = pipeline.latest_node_output_texture["roi_obj_morph"]

            # TODO : temporary code used to replace single feature extraction for user
            features = MEDimage.biomarkers.gldzm.extract_all(
                    vol_int=vol_quant_re_texture,
                    mask_morph=roi_obj_morph_texture.data
            )

            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Fdzm_" + str(feature_type)) in features
                }

            return features
        
        except Exception as e:
            return self.__manage_exception(e)
    
    def get_ngtdm_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of ngtdm features.

        Args:
            features_to_extract (list[str]): List of the ngtdm features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted ngtdm features.
        """
        try:
            features = {}
            
            if "vol_quant_re" not in pipeline.latest_node_output_texture or pipeline.latest_node_output_texture["vol_quant_re"] is None:
                raise Exception("vol_quant_re")
            vol_quant_re_texture = pipeline.latest_node_output_texture["vol_quant_re"]

            # TODO : temporary code used to replace single feature extraction for user
            features = MEDimage.biomarkers.ngtdm.extract_all(
                    vol=vol_quant_re_texture,
                    dist_correction=pipeline.MEDimg.params.radiomics.ngtdm.dist_correction
            )

            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Fngt_" + str(feature_type)) in features
                }

            return features

        except Exception as e:
            return self.__manage_exception(e)
    
    def get_ngldm_features(self, features_to_extract: list[str], pipeline: Pipeline) -> dict:
        """
        Extraction of ngldm features.

        Args:
            features_to_extract (list[str]): List of the ngldm features to extract.
            pipeline (Pipeline): Pipeline object containing the node.

        Returns:
            dict: Dictionary containing the extracted ngldm features.
        """
        try:
            features = {}
            
            if "vol_quant_re" not in pipeline.latest_node_output_texture or pipeline.latest_node_output_texture["vol_quant_re"] is None:
                raise Exception("vol_quant_re")
            vol_quant_re_texture = pipeline.latest_node_output_texture["vol_quant_re"]
            
            # TODO : temporary code used to replace single feature extraction for user
            features = MEDimage.biomarkers.ngldm.extract_all(vol=vol_quant_re_texture)

            if features_to_extract[0] != "extract_all":
                features = {
                    feature_key: features[feature_key]
                    for feature_type in features_to_extract
                    if (feature_key := "Fngl_" + str(feature_type)) in features
                }

            return features

        except Exception as e:
            return self.__manage_exception(e)
    
    # TODO : refactor : for node in extraction node, run node. 
    def run(self, pipeline: Pipeline, pipeline_number: str = 1, set_progress = None, current_progress: str = 0) -> None:
        print("************************ RUNNING EXTRACTION ***************************")
        last_vol_compute = pipeline.latest_node_output["vol"]        
        
        # Initialize the non-texture features calculation
        pipeline.MEDimg.init_ntf_calculation(last_vol_compute)  # vol_obj
        
        # Initialize the texture features calculation
        a = 0
        n = 0
        s = 0

        pipeline.MEDimg.init_tf_calculation(
            algo=a,
            gl=n,
            scale=s)

        # Count all the features to extract
        extraction_count = 0
        for node in self.params:
            if self.params[node]["name"] in ["morph", "local_intensity", "stats", "intensity_histogram", 
                                             "int_vol_hist", "glcm", "glrlm", "glszm", "gldzm", "ngtdm", "ngldm"]:
                extraction_count += 1

        for node in self.params:    
            feature_family = self.params[node]["name"]
            features_to_extract = self.params[node]["data"]["features"]

            # Update the progress of the pipeline
            progress_step = (100 - current_progress) / extraction_count
            set_progress(label=f"Pipeline " + str(pipeline_number) + f" | Extracting {feature_family} features")
            
            if feature_family == "morph":
                self.extracted_features[feature_family] = self.get_morph_features(features_to_extract, pipeline)
                
            elif feature_family == "local_intensity":
                self.extracted_features[feature_family] = self.get_local_intensity_features(features_to_extract, pipeline)
            
            elif feature_family == "stats":
                self.extracted_features[feature_family] = self.get_stats_features(features_to_extract, pipeline)
            
            elif feature_family == "intensity_histogram":
                 self.extracted_features[feature_family] = self.get_intensity_histogram_features(features_to_extract, pipeline)
                 
            elif feature_family == "int_vol_hist":
                 self.extracted_features[feature_family] = self.get_int_vol_hist_features(features_to_extract, pipeline)
                 
            elif feature_family == "glcm":
                self.extracted_features[feature_family] = self.get_glcm_features(features_to_extract, pipeline)

            elif feature_family == "glrlm":
                self.extracted_features[feature_family] = self.get_glrlm_features(features_to_extract, pipeline)
            
            elif feature_family == "glszm":
                self.extracted_features[feature_family] = self.get_glszm_features(features_to_extract, pipeline)
            
            elif feature_family == "gldzm":
                self.extracted_features[feature_family] = self.get_gldzm_features(features_to_extract, pipeline)
                
            elif feature_family == "ngtdm":
                self.extracted_features[feature_family] = self.get_ngtdm_features(features_to_extract, pipeline)
                
            elif feature_family == "ngldm":
                self.extracted_features[feature_family] = self.get_ngldm_features(features_to_extract, pipeline)
                
            else:
                print("Feature family : ", feature_family, "is invalid.")

            # Update the progress of the pipeline
            if current_progress + progress_step >= 100:
                set_progress(now=100, label="Done")
            else:
                set_progress(now=current_progress + progress_step)
            
            # Sort the extracted features by categories
            self.__sort_features_by_categories()

            # Place the scan results in the pipeline
            pipeline.scan_res = self.extracted_features
