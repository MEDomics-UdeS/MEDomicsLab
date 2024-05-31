from MEDfl.LearningManager.model import Model
from MEDfl.NetManager.node import Node
from MEDfl.NetManager.flsetup import FLsetup
from MEDfl.NetManager.network import Network
from MEDfl.NetManager.database_connector import DatabaseManager
from MEDfl.LearningManager.flpipeline import FLpipeline
from MEDfl.LearningManager.server import FlowerServer
from MEDfl.LearningManager.strategy import Strategy
from MEDfl.LearningManager.utils import *

import os
import json
import sys
from pathlib import Path

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))


from med_libs.server_utils import go_print
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments

import time

import torch.optim as optim
import torch.nn as nn



#  MEDfl imports
# LearningManager Imports

# Network Manager Imports


json_params_dict, id_ = parse_arguments()


class GoExecScriptRunPipelineFromMEDfl(GoExecutionScript):
    """
        This class is used to execute a process from Go

        Args:
            json_params: The json params of the execution
            _id: The id of the execution
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"data": "nothing to return"}

    def _custom_process(self, json_config: dict) -> dict:
        """
        This function is the main script of the execution of the process from Go
        """

        set_db_config(json_config['dbConfigfile'])

        db_manager = DatabaseManager()

        self.set_progress(label="Creating MEDfl DB", now=2)
        # Create the master dataset
        db_manager.create_MEDfl_db(
            path_to_csv=json_config['flConfig'][0]['masterDatasetNode']['path'])

        self.set_progress(label="Creating the Network", now=5)
        # Create Network
        Net_1 = Network(json_config['flConfig'][0]['Network']['name'])
        Net_1.create_network()

        self.set_progress(label="Creating the MasterDataset", now=10)
        # Creating the masterdataset
        Net_1.create_master_dataset(
            json_config['flConfig'][0]['masterDatasetNode']['path'])

        self.set_progress(label="Creating the FL setup", now=20)
        # auto FLsetup creation
        autoFl = FLsetup(name=json_config['flConfig'][0]['flSetupNode']['name'],
                         description=json_config['flConfig'][0]['flSetupNode']['description'], network=Net_1)
        autoFl.create()

        # Create nodes
        self.set_progress(label="Creating the FL clients", now=25)

        for client in json_config['flConfig'][0]['Network']['clients']:
            hospital = Node(
                name=client["name"], train=1 if client['type'] == 'Train node' else 0)
            Net_1.add_node(hospital)
            hospital.upload_dataset("datasetName",  client["dataset"]['path'])

         # Create FLDataSet
        self.set_progress(label="Creating the Federated dataset", now=35)

        fl_dataset = autoFl.create_federated_dataset(
            output=json_config['flConfig'][0]['masterDatasetNode']['target'],
            fit_encode=[],
            to_drop=[json_config['flConfig'][0]['masterDatasetNode']['target']]
        )

        # Create the model
        self.set_progress(label="Creating The model", now=40)

        if json_config['flConfig'][0]['flModelNode']['activateTl']:
            model = Model.load_model(
                json_config['flConfig'][0]['flModelNode']['file']['path'])

        else:
            pass

        if json_config['flConfig'][0]['flModelNode']['optimizer'] == 'Adam':
            optimizer = optim.Adam(
                model.parameters(), lr=json_config['flConfig'][0]['flModelNode']['learning rate'])
        elif json_config['flConfig'][0]['flModelNode']['optimizer'] == 'SGD':
            optimizer = optim.SGD(model.parameters(),
                                  lr=json_config['flConfig'][0]['flModelNode']['learning rate'])
        elif json_config['flConfig'][0]['flModelNode']['optimizer'] == 'RMSprop':
            optimizer = optim.RMSprop(
                model.parameters(), lr=json_config['flConfig'][0]['flModelNode']['learning rate'])

        criterion = nn.BCEWithLogitsLoss()

        # Creating a new Model instance using the specific model created by DynamicModel
        global_model = Model(model, optimizer, criterion)

        # Get the initial params of the model
        init_params = global_model.get_parameters()

        # Create the strategy
        self.set_progress(label="Creating The Server strategy", now=45)

        aggreg_algo = Strategy(json_config['flConfig'][0]['flStrategyNode']['Aggregation algorithm'],
                               fraction_fit=json_config['flConfig'][0]['flStrategyNode']['Training fraction'],
                               fraction_evaluate=json_config['flConfig'][0]['flStrategyNode']['Evaluation fraction'],
                               min_fit_clients=json_config['flConfig'][0]['flStrategyNode']['Minimal used clients for training'],
                               min_evaluate_clients=json_config['flConfig'][0][
                                   'flStrategyNode']['Minimal used clients for evaluation'],
                               min_available_clients=json_config['flConfig'][0][
                                   'flStrategyNode']['Minimal available clients'],
                               initial_parameters=init_params)
        aggreg_algo.create_strategy()

        # Create The server
        self.set_progress(label="Creating The Server", now=55)

        server = FlowerServer(global_model,
                              strategy=aggreg_algo,
                              num_rounds=json_config['flConfig'][0]['Network']['server']['nRounds'],
                              num_clients=len(fl_dataset.trainloaders),
                              fed_dataset=fl_dataset,
                              diff_privacy=True if json_config['flConfig'][0]['Network'][
                                  'server']['activateDP'] == "Activate" else False,
                              # You can change the resources alocated for each client based on your machine
                              client_resources={
                                      'num_cpus': 1.0, 'num_gpus': 0.0}
                              )

        # Create the pipeline
        self.set_progress(label="Creating The pipeline", now=65)

        ppl_1 = FLpipeline(name=json_config['flConfig'][0]['flPipelineNode']['name'],
                           description=json_config['flConfig'][0]['flPipelineNode']['description'],
                           server=server)

        # Run the Traning of the model
        self.set_progress(label="Running the FL pipeline", now=75)
        history = ppl_1.server.run()

        # Test the model
        self.set_progress(label="Testing the model", now=95)
        report = ppl_1.auto_test()

        results = {
            'results': server.auc,
            'test_results': report
        }

        self.set_progress(label="The results are ready !", now=99)
        time.sleep(1)
        self.results = {"data": results,
                        "stringFromBackend": "Pipeline training completed!"}

        return self.results


fl_pipeline = GoExecScriptRunPipelineFromMEDfl(json_params_dict, id_)
fl_pipeline.start()
