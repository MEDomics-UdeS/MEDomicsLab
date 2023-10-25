import cv2
import os
import pandas as pd
import requests
import skimage
import torch
import torch.nn.functional as F
import torchxrayvision as xrv

from flask import request, Blueprint
from pathlib import Path
from utils.server_utils import get_json_from_request, get_response_from_error

# blueprint definition
app_extraction_image = Blueprint('app_extraction_image', __name__, template_folder='templates', static_folder='static')

# global variable
progress = 0
step = "initialization"


def download_model(model):
    """
    Function used to download model from model name because TorchXRayVision downloading may cause errors on Windows.
    """
    if model == "densenet121-res224-all":
        url = "https://github.com/mlmed/torchxrayvision/releases/download/v1/nih-pc-chex-mimic_ch-google-openi-kaggle-densenet121-d121-tw-lr001-rot45-tr15-sc15-seed0-best.pt"
    elif model == "densenet121-res224-nih":
        url = "https://github.com/mlmed/torchxrayvision/releases/download/v1/nih-densenet121-d121-tw-lr001-rot45-tr15-sc15-seed0-best.pt"
    elif model == "densenet121-res224-pc":
        url = "https://github.com/mlmed/torchxrayvision/releases/download/v1/pc-densenet121-d121-tw-lr001-rot45-tr15-sc15-seed0-best.pt"
    elif model == "densenet121-res224-chex":
        url = "https://github.com/mlmed/torchxrayvision/releases/download/v1/chex-densenet121-d121-tw-lr001-rot45-tr15-sc15-seed0-best.pt"
    elif model == "densenet121-res224-rsna":
        url = "https://github.com/mlmed/torchxrayvision/releases/download/v1/kaggle-densenet121-d121-tw-lr001-rot45-tr15-sc15-seed0-best.pt"
    elif model == "densenet121-res224-mimic_nb":
        url = "https://github.com/mlmed/torchxrayvision/releases/download/v1/mimic_nb-densenet121-d121-tw-lr001-rot45-tr15-sc15-seed0-best.pt"
    elif model == "densenet121-res224-mimic_ch":
        url = "https://github.com/mlmed/torchxrayvision/releases/download/v1/mimic_ch-densenet121-d121-tw-lr001-rot45-tr15-sc15-seed0-best.pt"
    else: 
        return
    weights_filename = os.path.basename(url)
    weights_storage_folder = os.path.expanduser(os.path.join("~", ".torchxrayvision", "models_data"))
    weights_filename_local = os.path.expanduser(os.path.join(weights_storage_folder, weights_filename))
    with open(weights_filename_local, 'wb') as f:
        response = requests.get(url, stream=True)
        total = response.headers.get('content-length')

        if total is None:
            f.write(response.content)
        else:
            total = int(total)
            for data in response.iter_content(chunk_size=max(int(total / 1000), 1024 * 1024)):
                f.write(data)


def get_single_chest_xray_embeddings(img_path, model_weights_name):
    """
    Code taken and updated from the HAIM github repository : https://github.com/lrsoenksen/HAIM
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


@app_extraction_image.route("/DenseNet_extraction", methods=["GET", "POST"]) 
def DenseNet_extraction():
    """
    Run time series extraction using TSfresh library.

    Returns: json_config : dict containing data relative to extraction.

    """
    # global variables
    global progress
    global step
    progress = 0
    step = "Initialization"

    try:
        # Set local variables
        json_config = get_json_from_request(request)
        folder_path = json_config["folderPath"]
        depth = json_config["depth"]
        weights = json_config["relativeToExtractionType"]["selectedWeights"]
        features_to_generate = json_config["relativeToExtractionType"]["selectedFeaturesToGenerate"]

        data = pd.DataFrame()

        # Count total number of images, in order to update progressbar
        nb_images = 0
        for root, dirs, files in os.walk(folder_path):
            current_depth = root[len(folder_path):].count(os.sep)
            if current_depth == depth:
                for file in files:
                    if file.endswith(".jpg"):
                        nb_images += 1

        progress = 20
        step = "Downloading weights"
        download_model(weights)

        progress = 30
        step = "Extraction"
        # Proceed to extraction file by file
        for root, dirs, files in os.walk(folder_path):
            current_depth = root[len(folder_path):].count(os.sep)
            if current_depth == depth:
                for file in files:
                    if file.endswith(".jpg"):
                        data_img = root.split(os.sep)[-depth:]
                        data_img.append(file)
                        print(os.path.join(root, file))
                        features = get_single_chest_xray_embeddings(os.path.join(root, file), weights)
                        data_img = pd.concat([pd.DataFrame(data_img), pd.DataFrame(features[0]), pd.DataFrame(features[1])], ignore_index=True)
                        data = pd.concat([data, pd.DataFrame(data_img).transpose()], ignore_index=True)
                        progress += 1/nb_images*60

        data.columns = ["level_" + str(i+1) for i in range(depth)] + ["filename"] + ["densefeatures_" + str(i) for i in range(len(features[0]))] + ["predictions_" + str(i) for i in range(len(features[1]))]

        if "denseFeatures" not in features_to_generate:
            data.drop(["densefeatures_" + str(i) for i in range(len(features[0]))], axis=1, inplace=True)
        elif "predictions" not in features_to_generate:
            data.drop(["predictions_" + str(i) for i in range(len(features[1]))], axis=1, inplace=True)

        # Save extracted features
        progress = 90
        step = "Save extracted features"
        csv_result_path = os.path.join(str(Path(json_config["folderPath"]).parent.absolute()), json_config['filename'])
        data.to_csv(csv_result_path, index=False)
        json_config["csv_result_path"] = csv_result_path

    except BaseException as e:
        return get_response_from_error(e)

    return json_config 
    

@app_extraction_image.route("/progress", methods=["POST"])
def extraction_progress():
    """
    Triggered each x millisecond by the dashboard, it returns the progress of the extraction execution.

    Returns: the progress of the extraction execution

    """
    global progress
    global step
    return {"now": round(progress, 2), "currentLabel": step}
