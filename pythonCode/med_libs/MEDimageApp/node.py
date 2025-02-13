from abc import ABC, abstractmethod

class Node(ABC):
    """
    Abstract class representing a node in a pipeline. 
    Each node can be executed, provided that the necessary data is available
    in it's pipeline. A same node can be part of multiple pipelines.
    """
    def __init__(self, params: dict) -> None:
        """
        Constructor of the Node class.

        Args:
            params (dict): Dictionary containing the parameters of the node.
            
        Returns:
            None.
        """
        # A node must have a name and an id
        self.name = params["name"]
        self.id = params["id"]

        # The parameters associated with the node are stored in the params attribute unformatted
        self.params = params['data']
    
        # The output of the node is stored in the output attribute
        self.output = {key: None for key in ["vol", "roi", "vol_texture", "roi_texture"]}
    
    def __eq__(self, node: "Node") -> bool:
        """
        Compare two nodes. Two nodes are equal if they have the same id.

        Args:
            node (Node): Node to compare with.
            
        Returns:
            bool: True if the nodes are equal, False otherwise.
        """
        return self.id == node.id
    
    def change_params(self, new_params: dict) -> None:
        """
        Change the parameters of the node.

        Args:
            new_params (dict): Dictionary containing the new parameters of the node.
            
        Returns:
            None.
        """
        self.params = new_params
    
    @abstractmethod
    def run(self, pipeline: "Pipeline") -> None:
        """
        Abstract method to run the node. The node is executed and the output is stored in the output attribute.

        Args:
            pipeline (Pipeline): Pipeline object containing the node.
            
        Returns:
            None.
        """
        pass

    @staticmethod
    def create_node(node_data: dict) -> "Node":
        """
        Factory method to create a node object from a dictionary containing the node data.
        
        Args:
            node_data (dict): Dictionary containing the node data.

        Raises:
            ValueError: If the node type is unknown.

        Returns:
            Node: An instance of a subclass of Node.
        """
        node_type = node_data["name"]
        if node_type == "input":
            from .node_types.input_node import InputNode
            return InputNode(node_data)
        elif node_type == "segmentation":
            from .node_types.segmentation_node import SegmentationNode
            return SegmentationNode(node_data)
        elif node_type == "interpolation":
            from .node_types.interpolation_node import InterpolationNode    
            return InterpolationNode(node_data)
        elif node_type == "filter":
            from .node_types.filter_node import FilterNode
            return FilterNode(node_data)
        elif node_type == "re_segmentation":
            from .node_types.re_segmentation_node import ReSegmentationNode
            return ReSegmentationNode(node_data)
        elif node_type == "roi_extraction":
            from .node_types.roi_extraction_node import ROIExtractionNode
            return ROIExtractionNode(node_data)
        elif node_type == "discretization":
            from .node_types.discretization_node import DiscretizationNode
            return DiscretizationNode(node_data)
        elif node_type == "extraction":
            from .node_types.extraction_node import ExtractionNode
            return ExtractionNode(node_data)
        else:
            raise ValueError(f"Unknown node type: {node_type}")