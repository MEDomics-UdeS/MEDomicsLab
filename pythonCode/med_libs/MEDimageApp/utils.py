import numpy as np
from .figure import Figure


# Remplace la fonction allowed_file de app_extraction_blueprint.py
def allowed_pickle_object(filepath):
    extension = '.npy'
    # TODO : Plus de paramètres que l'extension doivent être vérifiés pour le pickle object
    return filepath.endswith(extension)


# TODO : Pour remplacer la fonction formatFeatures de app_extraction_blueprint.py
def format_features(features_dict):
    return {k: (np.float64(v) if not isinstance(v, list) else v) for (k, v) in features_dict.items()}


####################UTILS FOR NODES#########################################
# Remplace la fonction getNodeContentFromId de app_extraction_blueprint.py
# TODO : REFACTOR
def get_node_content(id: str, json_scene):
    find = False
    for module in json_scene['drawflow']:  # We scan all module in scene
        for node_id in json_scene['drawflow'][module]['data']:  # We scan all node of each modulef in scene
            if (node_id == str(id)):  # they are "str"
                find = True
                content = json_scene['drawflow'][module]['data'][node_id]

    if (find == True):
        return content
    else:
        print("No node with this ID")
        return 0


# Find all instances of key value in dictionnary : https://stackoverflow.com/questions/9807634/find-all-occurrences-of-a-key-in-nested-dictionaries-and-lists
def gen_dict_extract(key, var):
    if hasattr(var, 'items'):
        for k, v in var.items():
            if k == key:
                yield v
            if isinstance(v, dict):
                for result in gen_dict_extract(key, v):
                    yield result
            elif isinstance(v, list):
                for d in v:
                    for result in gen_dict_extract(key, d):
                        yield result


# Instantiates image figure when calling view on node from app_extraction_blueprint.py
def image_viewer(medimage_list, data, runs):
    # Check if the node to view is input
    if data["name"] == "input":
        fig_title = "3D Volume of \"" + data["file_loaded"] + "\""

        vol = medimage_list[data["file_loaded"]].data.volume.array

        fig = Figure(vol, fig_title)
        fig.add_data()
        fig.create_figure_sliders()
        fig.update_figure_layout()
        fig.show_figure()

    # If node is not input, need to retrace pipeline
    else:
        mask = None
        last_run = list(runs)[-1]
        # 3D view created for each pip related to the view button clicked
        for pip in runs[last_run]:
            for id in runs[last_run][pip]:

                if (str(id) == str(data["id"])):
                    if (data["name"] == "segmentationNode" or data["name"] == "re_segmentation"):
                        # Code cleaning for ROI contour tracing
                        mask = runs[last_run][pip][id]['output']['roi']
                        if type(mask) != np.ndarray:
                            mask = mask.data
                        
                        if data["name"] == "re_segmentation":
                            id_before_reseg = pip[-82:-41]
                            vol = runs[last_run][pip][id_before_reseg]['output']['vol']
                        else:
                            vol = runs[last_run][pip][id]['output']['vol']
                        
                        if type(vol) != np.ndarray:
                            vol = vol.data
                    else:
                        vol = runs[last_run][pip][id]['output']['vol']  # display VOL for others nodes
                    print(type(runs[last_run][pip][id]['output']['vol']))
                    if type(vol) != np.ndarray:
                        vol = vol.data

                    # Figure title
                    fig_title = ""
                    if (runs[last_run][pip][id]["type"] == "filter"):
                        fig_title = '3D Volume - Pipeline ' + pip + " - " + runs[last_run][pip][id]["settings"][
                            "filter_type"] + \
                                    " " + runs[last_run][pip][id]["type"] + " output."
                    else:
                        fig_title = '3D Volume - Pipeline ' + pip + " - " + runs[last_run][pip][id]["type"] + " output."

                    fig = Figure(vol, fig_title, mask)
                    fig.add_data()
                    fig.create_figure_sliders()
                    fig.update_figure_layout()
                    fig.show_figure()
