import learningNodesParams from "./learningNodesParams"
import optimizeNodesParams from "./optimizeNodesParams"
import extractionMEDimageNodesParams from "./extractionMEDimageNodesParams"
import featuresNodesParams from "./featuresNodesParams"
import medflNodesParams from "./medflNodesParams"
import flNetworkNodesParams from './flNetworkNodesParams'

const nodesParams = {
  learning: learningNodesParams,
  optimize: optimizeNodesParams,
  extraction: extractionMEDimageNodesParams,
  features: featuresNodesParams, 
  fl : medflNodesParams, 
  flNetwork : flNetworkNodesParams
  
}

export default nodesParams
