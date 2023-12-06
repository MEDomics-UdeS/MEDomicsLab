import cv2
import dask.dataframe as dd
import json
import os
import pandas as pd
import skimage
import sys
import torch
import torch.nn.functional as F
import torchxrayvision as xrv

from pathlib import Path

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

json_params_dict, id_ = parse_arguments()
#go_print("running script.py:" + id_)


class GoExecScriptDenseNetExtraction(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The input json params
            _id: The id of the page that made the request if any
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}


    def get_single_chest_xray_embeddings(self, img_path, model_weights_name):
        """
        Code taken and updated from the HAIM github repository : https://github.com/lrsoenksen/HAIM
        The function take a JPG image path and DenseNet model weghts and return
        two embeddings vectors containing extracted features from image using the model.

        :param img_path: path to the JGP image
        :param model_weights_name: string identifying the model weights

        Returns: densefeature_embeddings, prediction_embeddings : embedding vectors for the image, computed by the model.


        """
        # Inputs:
        #   img -> Image array
        #
        # Outputs:
        #   densefeature_embeddings ->  CXR dense feature embeddings for image
        #   prediction_embeddings ->  CXR embeddings of predictions for image
        
        
        # %% EXAMPLE OF USE
        # densefeature_embeddings, prediction_embeddings = get_single_chest_xray_embeddings(img)
        
        # Extract chest x-ray image embeddings and preddictions
        densefeature_embeddings = []
        prediction_embeddings = []
        
        img = skimage.io.imread(img_path) # If importing from path use this
        img = xrv.datasets.normalize(img, 255)

        # For each image check if they are 2D arrays
        if len(img.shape) > 2:
            img = img[:, :, 0]
        if len(img.shape) < 2:
            print("Error: Dimension lower than 2 for image!")
        
        # Add color channel for prediction
        #Resize using OpenCV
        img = cv2.resize(img, (224, 224), interpolation=cv2.INTER_AREA)
        img = img[None, :, :]

        model = xrv.models.DenseNet(weights=model_weights_name)

        with torch.no_grad():
            img = torch.from_numpy(img).unsqueeze(0)
            
            # Extract dense features
            feats = model.features(img)
            feats = F.relu(feats, inplace=True)
            feats = F.adaptive_avg_pool2d(feats, (1, 1))
            densefeatures = feats.cpu().detach().numpy().reshape(-1)
            densefeature_embeddings = densefeatures

            # Extract predicted probabilities of considered 18 classes:
            # Get by calling "xrv.datasets.default_pathologies" or "dict(zip(xrv.datasets.default_pathologies,preds[0].detach().numpy()))"
            # ['Atelectasis','Consolidation','Infiltration','Pneumothorax','Edema','Emphysema',Fibrosis',
            #  'Effusion','Pneumonia','Pleural_Thickening','Cardiomegaly','Nodule',Mass','Hernia',
            #  'Lung Lesion','Fracture','Lung Opacity','Enlarged Cardiomediastinum']
            preds = model(img).cpu()
            predictions = preds[0].detach().numpy()
            prediction_embeddings = predictions  

        # Return embeddings
        return densefeature_embeddings, prediction_embeddings


    def _custom_process(self, json_config: dict) -> dict:
        """
        Run image extraction using DenseNet model.

        Returns: self.results : dict containing data relative to extraction.

        """
        #go_print(json.dumps(json_config, indent=4))
        # Set local variables
        file_path_list = json_config["filePathList"]
        csv_result_path = json_config["csvResultsPath"]
        depth = json_config["depth"]
        weights = json_config["relativeToExtractionType"]["selectedWeights"]
        features_to_generate = json_config["relativeToExtractionType"]["selectedFeaturesToGenerate"]
        column_prefix = json_config["relativeToExtractionType"]["columnPrefix"] + '_'

        # Proceed to the image extraction
        extracted_data = []

        for file in file_path_list:
            
            patient_extracted_data = {}

            # Get filename and folder infos
            path_list = file.split(os.sep)[-(depth + 1):]
            for i in range(len(path_list) - 1):
                patient_extracted_data["level_" + str(i + 1)] = path_list[i]
            patient_extracted_data["filename"] = path_list[-1]

            # Get densefeatures and predictions
            densefeatures, predictions = self.get_single_chest_xray_embeddings(file, weights)

            # Convert types
            if "denseFeatures" in features_to_generate:
                for i in range(len(densefeatures)):
                    patient_extracted_data[column_prefix + "densefeatures_" + str(i)] = densefeatures[i]
            if "predictions" in features_to_generate:
                for i in range(len(predictions)):
                    patient_extracted_data[column_prefix + "predictions_" + str(i)] = predictions[i]

            extracted_data.append(patient_extracted_data)

        # Save data
        if os.path.getsize(csv_result_path) > 1:
            all_extracted_data = pd.read_csv(csv_result_path)
        else:
            all_extracted_data = pd.DataFrame([])
        all_extracted_data = pd.concat([all_extracted_data, pd.DataFrame(extracted_data)], ignore_index=True)
        all_extracted_data.to_csv(csv_result_path, index=False)

        self.results = json_config

        return self.results


script = GoExecScriptDenseNetExtraction(json_params_dict, id_)
script.start()
