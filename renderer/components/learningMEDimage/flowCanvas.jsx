import React, { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

// Import utilities
import { loadJsonSync, processBatchSettings } from "../../utilities/fileManagementUtils.js"
import { requestBackend } from "../../utilities/requests.js"
import ProgressBarRequests from "../generalPurpose/progressBarRequests.jsx"
import { getCollectionData } from "../dbComponents/utils.js"
import { overwriteMEDDataObjectContent } from "../mongoDB/mongoDBUtils.js"
import { updateHasWarning } from "../flow/node.jsx"


// Workflow imports
import { useEdgesState, useNodesState, useReactFlow } from "reactflow"
import { FlowFunctionsContext } from "../flow/context/flowFunctionsContext.jsx"
import { FlowResultsContext } from "../flow/context/flowResultsContext.jsx"
import WorkflowBase from "../flow/workflowBase.jsx"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext.jsx"
import { WorkspaceContext } from "../workspace/workspaceContext.jsx"
import { MEDDataObject } from "../workspace/NewMedDataObject.js"
import { DataContext } from "../workspace/dataContext.jsx"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext.jsx"

// Import node types
import Analyze from "./nodes/Analyze.jsx"
import Cleaning from "./nodes/Cleaning.jsx"
import Data from "./nodes/Data.jsx"
import Design from "./nodes/Design.jsx"
import FeatureReduction from "./nodes/FeatureReduction.jsx"
import Normalization from "./nodes/Normalization.jsx"
import RadiomicsLearner from "./nodes/RadiomicsLearner.jsx"
import Split from "./nodes/Split.jsx"

// Import node parameters
import nodesParams from "../../public/setupVariables/allNodesParams.jsx"

// Import buttons
import BtnDiv from "../flow/btnDiv.jsx"

// Static functions used in the workflow
import { deepCopy } from "../../utilities/staticFunctions.js"

// Useful libraries
import { useRef } from "react"

/**
 * @param {String} id id of the workflow for multiple workflows management
 * @param {Function} changeSidebarType function to change the sidebar type
 * @param {String} workflowType type of the workflow (extraction or features)
 * @returns {JSX.Element} A workflow component as defined in /flow
 *
 * @description
 * Component used to display the workflow of the extraction tab of MEDomicsLab.
 */
const FlowCanvas = ({ workflowType, setWorkflowType }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]) // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges, onEdgesChange] = useEdgesState([]) // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const [reactFlowInstance, setReactFlowInstance] = useState(null) // reactFlowInstance is used to get the reactFlowInstance object important for the reactFlow library
  const [nodeUpdate, setNodeUpdate] = useState({}) // nodeUpdate is used to update a node internal data
  const { setViewport } = useReactFlow() // setViewport is used to update the viewport of the workflow
  const [treeData, setTreeData] = useState({}) // treeData is used to set the data of the tree menu
  const [isProgressUpdating, setIsProgressUpdating] = useState(false) // progress is used to store the progress of the workflow execution
  const [progress, setProgress] = useState({
    now: 0,
    currentLabel: ""
  })
  const [nSplits, setNSplits] = useState([]) // nSplits is used to store the number of splits to be done in the learning experiment
  const [resultsFolder, setResultsFolder] = useState([])   // resultsFolder is used to store the path to the machine learning results
  const [experiments, setExperiments] = useState([]) // experiments is used to store the experiments to be done in the learning experiment
  const { pageId } = useContext(PageInfosContext) // used to get the page infos such as id and config path
  const { setIsResults, isResults } = useContext(FlowResultsContext)
  const { groupNodeId, changeSubFlow, updateNode } = useContext(FlowFunctionsContext)
  const { globalData } = useContext(DataContext)
  const { port } = useContext(WorkspaceContext)
  const { setError, setShowError } = useContext(ErrorRequestContext) // used to get the flow infos
  const op = useRef(null);
  const [selectedModalities, setSelectModalities] = useState([])
  const [metadataFileID, setMetadataFileID] = useState(null) // the metadata file in the .medml folder containing the frontend workflow

  // Hook executed upon modification of edges to verify the connections between input and segmentation nodes
  useEffect(() => {
    // Check if there are any connections between an input and segmentation node
    const inputSegmentationConnections = edges.filter((edge) => (nodes.find((node) => node.id === edge.source).data.internal.type === "input" && nodes.find((node) => node.id === edge.target).data.internal.type === "segmentation") || (nodes.find((node) => node.id === edge.source).data.internal.type === "segmentation" && nodes.find((node) => node.id === edge.target).data.internal.type === "inputNode"))

    // Update the segmentation node's data with the ROIs from the input node
    inputSegmentationConnections.forEach((connection) => {
      const inputNodeId = nodes.find((node) => node.id === connection.source).id
      const segmentationNodeId = nodes.find((node) => node.id === connection.target).id

      const inputNode = nodes.find((node) => node.id === inputNodeId)
      const segmentationNode = nodes.find((node) => node.id === segmentationNodeId)

      const inputROIs = inputNode.data.internal.settings.rois
      segmentationNode.data.internal.settings.rois = inputROIs

      // Update the segmentation node
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === segmentationNodeId) {
            return segmentationNode
          }
          return node
        })
      )
    })

    // Remove ROIs from segmentation nodes that are not connected to an input node
    nodes.forEach((node) => {
      if (node.data.internal.type === "segmentation" && !inputSegmentationConnections.some((connection) => connection.target === node.id)) {
        node.data.internal.settings.rois = {}
        setNodes((prevNodes) =>
          prevNodes.map((n) => {
            if (n.id === node.id) {
              return node
            }
            return n
          })
        )
      }
    })
  }, [edges])

  // Declare node types using useMemo hook to avoid re-creating component types unnecessarily (memoize output)
  const nodeTypes = useMemo(
    () => ({
      Split: Split,
      Cleaning: Cleaning,
      Design: Design,
      Data: Data,
      Normalization: Normalization,
      FeatureReduction: FeatureReduction,
      RadiomicsLearner: RadiomicsLearner,
      Analyze: Analyze
    }),
    []
  )

  // When config is changed, we update the workflow
  useEffect(() => {
    async function getConfig() {
      // Get Config file
      if (globalData[pageId]?.childrenIDs) {
        let configToLoad = MEDDataObject.getChildIDWithName(globalData, pageId, "metadata.json")
        setMetadataFileID(configToLoad)
        if (configToLoad) {
          let jsonContent = await getCollectionData(configToLoad)
          updateScene(jsonContent[0])
          toast.success("Config file has been loaded successfully")
        } else {
          console.log("No config file found for this page, base workflow will be used")
        }
      }
    }
    getConfig()
  }, [pageId])

  // Executes setTreeData when there is a change in nodes or edges arrays.
  useEffect(() => {
    setTreeData(createTreeFromNodes())
  }, [nodes, edges])

  // Hook executed upon modification of groupNodeId to show the current workflow
  useEffect(() => {
    // If there is a groupNodeId, the workflow is a features workflow
    if (groupNodeId.id != "MAIN") {
      // Set the workflow type to features
      setWorkflowType("features")
      // Hide the nodes that are not in the features group
      hideNodesbut(groupNodeId.id)
    } else {
      // Else the workflow is an learningMEDimage workflow
      setWorkflowType("learningMEDimage")
      // Hide the nodes that are not in the learningMEDimage group
      hideNodesbut(groupNodeId.id)
    }
  }, [groupNodeId])

  // when isResults is changed, we set the progressBar to completed state
  useEffect(() => {
    if (isResults) {
      setProgress({
        now: 100,
        currentLabel: "Done!"
      })
    }
  }, [isResults])

  /**
   * @param {String} activeNodeId id of the group that is active
   *
   * @description
   * This function hides the nodes and edges that are not in the active group
   * each node has a subflowId that is the id of the group it belongs to
   * if the subflowId is not equal to the activeNodeId, then the node is hidden
   */
  const hideNodesbut = (activeNodeId) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        node = {
          ...node
        }
        node.hidden = node.data.internal.subflowId != activeNodeId
        return node
      })
    )

    setEdges((edges) =>
      edges.map((edge) => {
        edge = {
          ...edge
        }
        edge.hidden = nodes.find((node) => node.id === edge.source).data.internal.subflowId != activeNodeId || nodes.find((node) => node.id === edge.target).data.internal.subflowId != activeNodeId
        return edge
      })
    )
  }

  /**
   * @returns {Object} updated tree data
   *
   * @description
   * This function creates the tree data from the nodes array
   * it is used to create the recursive workflow
   */
  const createTreeFromNodes = useCallback(() => {
    // Recursively create tree from nodes
    const createTreeFromNodesRec = (node) => {
      let children = {}
      edges.forEach((edge) => {
        if (edge.source == node.id) {
          let targetNode = JSON.parse(JSON.stringify(nodes.find((node) => node.id === edge.target)))
          if (targetNode.type != "extractionNode") {
            let subIdText = ""
            let subflowId = targetNode.data.internal.subflowId
            if (subflowId != "MAIN") {
              console.log("subflowId", subflowId)
              subIdText = JSON.parse(JSON.stringify(nodes.find((node) => node.id == subflowId))).data.internal.name + "."
            }
            children[targetNode.id] = {
              label: subIdText + targetNode.data.internal.name,
              nodes: createTreeFromNodesRec(targetNode)
            }
          }
        }
      })
      return children
    }

    // Create the tree data
    let treeMenuData = {}
    edges.forEach((edge) => {
      let sourceNode = JSON.parse(JSON.stringify(nodes.find((node) => node.id === edge.source)))

      // If the node is an input node, add its tree to the treeMenuData (input node is always a root of a tree)
      if (sourceNode.data.internal.type === "input") {
        treeMenuData[sourceNode.id] = {
          label: sourceNode.data.internal.name,
          nodes: createTreeFromNodesRec(sourceNode)
        }
      }
    })

    return treeMenuData
  }, [nodes, edges])

  /**
   * @param {Object} newNode base node object
   * @param {String} associatedNode id of the parent node if the node is a sub-group node
   * @returns {Object} updated node object
   *
   * @description
   * Function passed to workflowBase to add the specific properties of a
   * node in the workflow for extraction or features
   */
  const addSpecificToNode = (newNode, associatedNode) => {
    newNode.id = `${newNode.id}${associatedNode ? `.${associatedNode}` : ""}`

    // Add defaut parameters of node to possibleSettings
    let type = newNode.data.internal.type.replaceAll(/ |-/g, "_").replace(/[^a-z_]/g, "")
    console.log("nodesParams[workflowType]", nodesParams[workflowType])

    let setupParams = {}
    if (nodesParams[workflowType][type]) {
      setupParams = JSON.parse(JSON.stringify(nodesParams[workflowType][type]))
    }

    // Add default parameters to node data
    newNode.data.setupParam = setupParams

    // Initialize settings in node data to put the parameters selected by the user
    let featuresNodeDefaultSettings = { features: ["extract_all"] }
    console.log("newNode", newNode)
    newNode.data.internal.settings = newNode.type === "featuresNode" ? featuresNodeDefaultSettings : newNode.data.setupParam.possibleSettings.defaultSettings

    newNode.data.internal.subflowId = !associatedNode ? groupNodeId.id : associatedNode

    // Used to enable the view button of a node (if it exists)
    newNode.data.internal.enableView = false

    // Add warning to node
    newNode.data.internal.hasWarning = { state: false }

    // Add dictionnary to put results in node data if the node is an extractionNode
    if (newNode.type === "extractionNode") {
      newNode.data.internal.results = {}
    }

    return newNode
  }

  /**
   * @param {Object} id id of the node to delete
   *
   * @description
   * This function is called when the user clicks on the delete button of a node
   * it deletes the node and its edges. If the node is a group node, it deletes
   * all the nodes inside the group node
   */
  const deleteNode = useCallback(
    (id) => {
      console.log("Deleting node ", id)

      setNodes((nds) =>
        nds.reduce((filteredNodes, n) => {
          if (n.id !== id) {
            filteredNodes.push(n)
          }

          if (n.type == "extractionNode") {
            let childrenNodes = nds.filter((node) => node.data.internal.subflowId == id)
            childrenNodes.forEach((node) => {
              deleteNode(node.id)
            })
          }

          return filteredNodes
        }, [])
      )
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    },
    [nodes]
  )

  /**
   * @returns {Object} modified flow instance, if a reactFlowInstance exists
   *
   * @description
   * Temporary fix used to simulate the call to the backend that is not yet refactored
   * Will be removed when the backed is finished
   * TODO : Did not do the special case for extraction node!
   */
  const transformFlowInstance = useCallback(() => {
    // Initialize the new dictionnary for the modified flow
    let modifiedFlow = {
      drawflow: {
        Home: {
          data: {}
        }
      }
    }

    // If the reactFlowInstance exists
    if (reactFlowInstance) {
      let flow = JSON.parse(JSON.stringify(reactFlowInstance.toObject()))
      console.log("The current React Flow instance is : ")
      console.log(flow)

      flow.nodes.forEach((node) => {
        const nodeID = node.id

        // If the node is a features node
        if (node.type === "featuresNode") {
          // If the node is a featuresNode, it has a subflowId and its module name is extraction-subFlowId
          let moduleName = "extraction-" + node.data.internal.subflowId
          // If the subFlowId structure is not already created, create it
          if (!(moduleName in modifiedFlow.drawflow)) {
            modifiedFlow.drawflow[moduleName] = {
              data: {}
            }
          }

          // Add the node data to the subFlowId structure
          modifiedFlow.drawflow[moduleName].data[nodeID] = {
            id: nodeID,
            name: node.data.setupParam.possibleSettings.defaultSettings.MEDimageName,
            data: node.data.internal.settings,
            class: node.className,
            inputs: {},
            outputs: {}
          }
        } else {
          modifiedFlow.drawflow.Home.data[nodeID] = {
            id: nodeID,
            name: node.data.internal.type.replaceAll(/ |-/g, "_"),
            data: node.data.internal.settings ? node.data.internal.settings : {},
            class: node.className,
            inputs: {},
            outputs: {}
          }
        }
      })

      // Note : only the nodes in home module can be connected, therefore it is not necessary to check
      // if the edges to be in the structure other than Home in the dictionnary
      flow.edges.forEach((edge) => {
        const sourceNode = flow.nodes.find((node) => node.id === edge.source)
        const targetNode = flow.nodes.find((node) => node.id === edge.target)

        const sourceNodeID = sourceNode.id
        const targetNodeID = targetNode.id

        const outputKey = "output_1"
        const inputKey = "input_1"

        if (!modifiedFlow.drawflow.Home.data[sourceNodeID].outputs[outputKey]) {
          modifiedFlow.drawflow.Home.data[sourceNodeID].outputs[outputKey] = {
            connections: [{ node: targetNodeID, input: inputKey }]
          }
        } else {
          modifiedFlow.drawflow.Home.data[sourceNodeID].outputs[outputKey].connections.push({ node: targetNodeID, input: inputKey })
        }

        if (!modifiedFlow.drawflow.Home.data[targetNodeID].inputs[inputKey]) {
          modifiedFlow.drawflow.Home.data[targetNodeID].inputs[inputKey] = {
            connections: [{ node: sourceNodeID, output: outputKey }]
          }
        } else {
          modifiedFlow.drawflow.Home.data[targetNodeID].inputs[inputKey].connections.push({ node: sourceNodeID, output: outputKey })
        }
      })

      // Return the modified flow instance that can be sent to the backend
      return modifiedFlow
    }

    return null
  }, [reactFlowInstance])

  /**
   * @param {Object} oldNodeData data of the node before the backend call
   * @param {Object} response response from the backend
   * @returns {Object} new node data
   *
   * @description
   * Handles merge between the already existing data of an extraction node and the response dictionnary from the backend
   * TODO : Should not have to be used after refactoring of backend
   */
  const handleExtractionResults = (oldNodeData, response) => {
    // Get the results that were in the node
    let oldResults = oldNodeData
    let newResults = oldResults
    if (Object.keys(oldResults).length === 0) {
      // If there is no results yet in this node (first run), create a new dictionnary
      for (let file in response) {
        newResults[file] = { RUN_1: {} }
        let pipelineNumber = 1
        for (let pip in response[file]) {
          let newPipelineName = "pipeline " + pipelineNumber
          newResults[file]["RUN_1"][newPipelineName] = response[file][pip]
          newResults[file]["RUN_1"][newPipelineName]["settings"]["fullPipelineName"] = { pip }
          pipelineNumber++
        }
      }
    } else {
      for (let file in response) {
        // Check if the file is alreay in the results
        if (file in oldResults) {
          // Add the new results to the dictionnary
          let runNumber = Object.keys(oldResults[file]).length + 1
          newResults[file]["RUN_" + runNumber] = {}
          let pipelineNumber = 1
          for (let pip in response[file]) {
            let newPipelineName = "pipeline " + pipelineNumber
            newResults[file]["RUN_" + runNumber][newPipelineName] = response[file][pip]
            newResults[file]["RUN_" + runNumber][newPipelineName]["settings"]["fullPipelineName"] = { pip }
            pipelineNumber++
          }
        } else {
          // Create a new dictionnary for the file
          newResults[file] = { RUN_1: {} }
          let pipelineNumber = 1
          for (let pip in response[file]) {
            let newPipelineName = "pipeline " + pipelineNumber
            newResults[file]["RUN_1"][newPipelineName] = response[file][pip]
            newResults[file]["RUN_1"][newPipelineName]["settings"]["fullPipelineName"] = { pip }
            pipelineNumber++
          }
        }
      }
    }
    return newResults
  }

  /**
   * @param {String} id id of the node to execute
   *
   * @description
   * This function is called when the user clicks on the run button of a node
   * It executes the pipelines finishing with this node
   */
  const runNode = useCallback(
    (id) => {
      if (id) {
        toast.warning("Running a single node is not possible")
      }
    },
    [nodes, edges, reactFlowInstance]
  )

  const fs = require('fs');

  /**
   * Count the number of .npy files in a folder.
   * @param {string} folderPath - The path of the folder to search for .npy files.
   * @returns {number} - The number of .npy files found.
   */
  function countLearningFiles(folderPath) {
    try {
      let resultFiles = 0;
      const folders = fs.readdirSync(folderPath);
      for (const folder of folders) {
        let files = [];
        try {
          files = fs.readdirSync(folderPath + "/" + folder);
        }
        catch (error) {
          continue;
        }
        console.log("files", files);
        // check if folder is empty
        if (files.length !== 0) {
          let includesFDA = false;
          let includesPickle = false;
          for (const file of files){
            if (file.includes('fda_logging_dict.json')) {
              includesFDA = true;
              resultFiles += 0.5;
            }
            if (file.includes('.pickle')) {
              resultFiles += 0.25;
              includesPickle = true;
            }
          }
          for (const file of files){
            if (file.includes('run_results.json')) {
              if (includesFDA){
                resultFiles -= 0.5;
              }
              if (includesPickle) {
                resultFiles -= 0.25;
              }
              resultFiles++;
            } 
          }
      }
    }
    return resultFiles;
    } catch (error) {
      console.warn('Error counting split folders:', error);
      return 0;
    }
  }

  /**
   * Count the number of .npy files in a folder.
   * @param {string} folderPath - The path of the folder to search for .npy files.
   * @returns {number} - The number of .npy files found.
   */
  function isFolderExists(folderPath) {
    try {
      let resultFiles = 0;
      const folders = fs.readdirSync(folderPath);
      console.log("isFolderExists found files", folders);
      return true;
    } catch (error) {
      console.warn('isFolderExists Error counting split folders:', error);
      return false;
    }
  }

  /**
   * @description functions thats sums array
   */
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  // Function to fetch and update data (your front-end function)
  const fetchProgress = () => {
    let resultsFolderTemp = resultsFolder;
    let experimentsTemp = experiments;
    let nSplitsTemp = nSplits;
    let newProgress = 0;
    let indexExp = 0;
    let processedFolder = Array(resultsFolderTemp.length).fill(0);
    for (const folder of resultsFolderTemp) {
      // Find first folder processed
      if (isFolderExists(folder)){
        // Call your front-end function to fetch data
        var resultsFiles = countLearningFiles(resultsFolderTemp[indexExp]);

        // Calculate the progress
        newProgress = Math.round((resultsFiles / nSplitsTemp[indexExp]) * 100);

        // Update the component's state with the new data
        setProgress({
          now: newProgress,
          currentLabel: "Split N°" + parseInt(resultsFiles+1) + " | Experiment: " + experimentsTemp[indexExp]
        });

        // If the progress is 100%, stop updating
        if (newProgress === 100) {
          // Check if all experiments are done
          if (sum(processedFolder) === resultsFolderTemp.length){
            setIsProgressUpdating(false)
            setProgress({
              now: 100,
              currentLabel: "Done!"
            })
          } else {
            // Mark current experiment as done
            processedFolder[indexExp] = 1;
            // Delete current experiment from the list after it is done
            resultsFolderTemp.splice(indexExp, 1);
            experimentsTemp.splice(indexExp, 1);
            nSplitsTemp.splice(indexExp, 1);
          }
        }
        break;
      }
      indexExp++;
    }
  }

  /*useEffect(() => {
    if (isProgressUpdating) {
      // Call fetchData immediately when the component mounts
      fetchProgress();

      // Set up an interval to refresh the data every second (1000 milliseconds)
      const intervalId = setInterval(() => {
        fetchProgress();
      }, 1000);

      // Clean up the interval when the component unmounts
      return () => {
        clearInterval(intervalId);
      };
    } 
  }, [isProgressUpdating]); // The empty dependency array ensures this effect runs only once when the component mounts*/

  /**
   * @description
   * Runs all the pipelines in the workflow
   */
  const onRun = useCallback(() => {
    let experimentsTemp = []
    let resultsFolders = []
    let nSplitsTemp = []

    // Transform the flow instance to a dictionnary compatible with the backend
    let newFlow = transformFlowInstance()
    console.log("Flow dictionnary sent to back end is : ", newFlow)

    // Fill data needed to track progress using newFlow
    let folderNames = []
    for (const [key, value] of Object.entries(newFlow.drawflow.Home.data)) {
      let nodeData = value.data
      let nodeName = value.name
      if (nodeName === "design") {
        let methodDesing = nodeData.testSets[0]
        if (!experimentsTemp.includes(nodeData.expName)){
          experimentsTemp.push(nodeData.expName)
        }
        folderNames.push("learn__" + nodeData.expName)
        nSplitsTemp.push(nodeData[methodDesing].nSplits);
        //setNSplits(nodeData[methodDesing].nSplits);
      }
    }
    if (folderNames.length === 0){
      toast.error("Please add a design node to the workflow")
    }
    for (const [key, value] of Object.entries(newFlow.drawflow.Home.data)) {
      let nodeData = value.data
      let nodeName = value.name
      let pathSave = ""
      if (nodeName === "split") {
        // loop over folderNames
        for (const folder of folderNames) {
          if (folder !== "") {
            let method = nodeData.method
            pathSave = nodeData.path_save_experiments + "/" + nodeData.outcome_name.toUpperCase()
            if (nodeData.path_save_experiments !== "" && nodeData.outcome_name) {
              if (fs.existsSync(pathSave)) {
                // If path already exists, check if there is already a split folder
                let allFolders = fs.readdirSync(pathSave)
                let nExist = 0
                let splitExist = false
                
                allFolders.map((folder, index) => {
                  if (folder.includes('holdOut__' + method + '__')){
                    nExist = nExist + 1
                    splitExist = true
                  }
                })
                if (!splitExist){
                  if (!resultsFolders.includes(pathSave + '/holdOut__' + method + '__001/' + folder)){
                    resultsFolders.push(pathSave + '/holdOut__' + method + '__001/' + folder)
                  }
                } else {
                  if (!resultsFolders.includes(pathSave + '/holdOut__' + method + '__' + String(nExist+1).padStart(3, '0') + "/" + folder)){
                    resultsFolders.push(pathSave + '/holdOut__' + method + '__' + String(nExist+1).padStart(3, '0') + "/" + folder)
                  }
                }
              } else {
                if (!resultsFolders.includes(pathSave + '/holdOut__' + method + '__001/' + folder)){
                  resultsFolders.push(pathSave + '/holdOut__' + method + '__001/' + folder)
                }
              }
            }
          }
        }
      }
    }
    setExperiments(experimentsTemp)
    setResultsFolder(resultsFolders)
    setNSplits(nSplitsTemp)

    // Start progress bar
    setProgress({now: 0, currentLabel: progress.currentLabel})
    setIsProgressUpdating(true)
    
    requestBackend(
      port,
      "/learning_MEDimage/run_all/" + pageId,
      newFlow,
      (response) => {
        console.log("received results:", response)
        if (response.warning){
          toast.warn(response.warning)
        }
        if (!response.error) {
          console.log("Success response", response)
          toast.success("Experiment executed successfully")
          setShowError(false)
          //updateFlowResults(response)
          setIsProgressUpdating(false)
          setProgress({
            now: 100,
            currentLabel: "Done!"
          })
          setIsResults(true)
          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              // If the type of the node is extractionNode, update the results according
              // to the response from the backend
              if (node.type === "Analyze") {
                // Get the results that were in the node
                //let oldResults = node.data.internal.results
                //let newResults = handleExtractionResults(oldResults, response)

                return {
                  ...node,
                  data: {
                    ...node.data,
                    internal: {
                      ...node.data.internal,
                      results: response // Update the results data with the response
                    }
                  }
                }
              }

              // Enable the view button of the node
              node.data.internal.enableView = true
              updateNode({
                id: node.id,
                updatedData: node.data.internal
              })

              return node
            })
          )
        } else {
          setIsProgressUpdating(false)
          setProgress({
            now: 0,
            currentLabel: ""
          })
          toast.error(response.error)
          console.log("error", response.error)
          // check if error has message or not
          if (response.error.message){
            console.log("error message", response.error.message)
            setError(response.error)
          } else {
            console.log("error no message", response.error)
            setError({
              "message": response.error
            })
          }
          setShowError(true)
        }
        },
        (error) => {
          setIsProgressUpdating(false)
          setProgress({
            now: 0,
            currentLabel: ""
          })
          toast.error("Error detected while running the experiment", error)
          console.log("error detected", error)
          setError(error)
      }
    )
  }, [nodes, edges, reactFlowInstance])

  /**
   * @description
   * Clear the canvas if the user confirms
   */
  const onClear = useCallback(() => {
    console.log("reactFlowInstance.toObject():", reactFlowInstance.toObject())
    if (reactFlowInstance && nodes.length > 0) {
      let confirmation = confirm("Are you sure you want to clear the canvas?\nEvery data will be lost.")
      if (confirmation) {
        setNodes([])
        setEdges([])
        toast.success("Canvas has been cleared successfully")
      }
    } else {
      toast.warn("No workflow to clear")
    }
  }, [reactFlowInstance, nodes])

  const onClesar = useCallback(() => {
      // Check if the workflow exists and there are nodes in the workflow
      if (reactFlowInstance && nodes.length > 0) {
        let confirmation = confirm("Are you sure you want to clear the canvas?\nEvery data will be lost.")
        if (confirmation) {
          setNodes([])
          setEdges([])
        }
      } else {
        toast.warn("No workflow to clear")
      }
    }, [reactFlowInstance, nodes])

  /**
   * @description
   * Save the workflow as a json file
   */
  const onSave = useCallback(async () => {
    if (reactFlowInstance && metadataFileID) {
      const flow = deepCopy(reactFlowInstance.toObject())
      flow.nodes.forEach((node) => {
        // Set enableView to false because only the scene is saved
        // and importing it back would not reload the volumes that
        // were loaded in the viewer
        node.data.enableView = false
      })
      console.log("flow", flow)
      let success = await overwriteMEDDataObjectContent(metadataFileID, [flow])
      if (success) {
        toast.success("Scene has been saved successfully")
      } else {
        toast.error("Error while saving scene")
      }
    }
  }, [reactFlowInstance, nodes])

  /**
   * @description
   * Load a workflow from a json file
   */
  const onLoad = useCallback(() => {
    // Ask confirmation from the user if the canvas is not empty,
    // since the workflow will be replaced
    let confirmation = true
    if (nodes.length > 0) {
      confirmation = confirm("Are you sure you want to import a new experiment?\nEvery data will be lost.")
    }
    if (confirmation) {
      // If the user confirms, load the json file
      const restoreFlow = async () => {
        try {
          // Ask user for the json file to open
          const flow = await loadJsonSync() // wait for the json file to be loaded (see /utilities/fileManagementUtils.js)
          console.log("loaded flow", flow)

          // TODO : should have conditions regarding json file used for import!
          // For each nodes in the json file, add the specific parameters
          Object.values(flow.nodes).forEach((node) => {
            // the line below is important because functions are not serializable
            // set workflow type
            let subworkflowType = node.data.internal.subflowId != "MAIN" ? "learningMEDimage" : "learningMEDimage"
            // set node type
            let setupParams = deepCopy(nodesParams[subworkflowType][node.name.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_")])
            console.log("setupParams", setupParams)
            node.data.setupParam = setupParams
          })

          if (flow) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport
            setNodes(flow.nodes || [])
            setEdges(flow.edges || [])
            setViewport({ x, y, zoom })
          }
        } catch (error) {
          toast.warn("Error loading file : ", error)
        }
      }

      // Call the async function
      restoreFlow()
    }
  }, [setNodes, setViewport, nodes])

  /**
   * @description
   * Load a workflow from a json file
   */
  const onLoadDeafult = useCallback(() => {
    // Ask confirmation from the user if the canvas is not empty,
    // since the workflow will be replaced
    let confirmation = true
    if (nodes.length > 0) {
      confirmation = confirm("Are you sure you want to import the default experiment?\nEvery data will be lost.")
    }
    if (confirmation) {
      // If the user confirms, load the json file
      const restoreFlow = async () => {
        try {
          const flow = require("../../public/setupVariables/possibleSettings/learningMEDimage/learningMEDimageDefaultWorkflow.json")
          console.log("loaded flow", flow)

          // TODO : should have conditions regarding json file used for import!
          // For each nodes in the json file, add the specific parameters
          Object.values(flow.nodes).forEach((node) => {
            // the line below is important because functions are not serializable
            // set workflow type
            let subworkflowType = node.data.internal.subflowId != "MAIN" ? "learningMEDimage" : "learningMEDimage"
            // set node type
            let setupParams = deepCopy(nodesParams[subworkflowType][node.name.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_")])
            console.log("setupParams", setupParams)
            node.data.setupParam = setupParams
          })

          if (flow) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport
            setNodes(flow.nodes || [])
            setEdges(flow.edges || [])
            setViewport({ x, y, zoom })
          }
        } catch (error) {
          toast.warn("Error loading file : ", error)
        }
      }

      // Call the async function
      restoreFlow()
    }
  }, [setNodes, setViewport, nodes])

  /**
   *
   * @param {Object} newScene new scene to update the workflow
   *
   * This function updates the workflow with the new scene
   */
  const updateScene = (newScene) => {
    if (newScene) {
      // For each nodes in the json file, add the specific parameters
      Object.values(newScene.nodes).forEach((node) => {
        // the line below is important because functions are not serializable
        // set workflow type and get default parameters
        let subworkflowType = node.data.internal.subflowId != "MAIN" ? "learningMEDimage" : "learningMEDimage"
        let setupParams = deepCopy(nodesParams[subworkflowType][node.name.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_")])
        node.data.setupParam = setupParams
        updateHasWarning(node.data)
      })
      const { x = 0, y = 0, zoom = 1 } = newScene.viewport
      setNodes(newScene.nodes || [])
      setEdges(newScene.edges || [])
      setViewport({ x, y, zoom })
    }
  }

  /**
   * @description
   * Export the settings of the workflow as a json file for batch extraction
  */
 const onExport = useCallback(() => {
  if (reactFlowInstance && nodes.length > 0) {
    const flow = JSON.parse(JSON.stringify(reactFlowInstance.toObject()))
    flow.nodes.forEach((node) => {
      node.data.setupParam = null
      // Set enableView to false because only the scene is saved
      // and importing it back would not reload the volumes that
      // were loaded in the viewer
      node.data.enableView = false
    })
    console.log("flow", flow)
    processBatchSettings(flow, selectedModalities, "extraction_settings.json")
    //downloadFile(flow, "experiment.json")
  } else {
    // Warn the user if there is no workflow to save
    toast.warn("No workflow to export!")
  }}, [reactFlowInstance, nodes])

  /**
   * @description
   * Set the subflow id to null to go back to the main workflow
   */
  const onBack = useCallback(() => {
    changeSubFlow("MAIN")
  }, [])

  // TODO : take out of mandatory in flow/workflowBase.js
  const onNodeDrag = useCallback(
    (event, node) => {
      // TODO
    },
    [nodes]
  )
  /**
   * @param {object} params
   * @param {string} params.source
   * @param {string} params.target
   * @param {string} params.sourceHandle
   * @param {string} params.targetHandle
   *
   * @description
   * This function is called when the user connects two nodes
   * It verifies if a connection is valid for the current workflow
   */
  const isGoodConnection = (connection) => {
    // Getting the source and target nodes
    let sourceNode = nodes.find((node) => node.id == connection.source)
    let targetNode = nodes.find((node) => node.id == connection.target)
    let sourceNodeType = sourceNode.data.internal.type
    let targetNodeType = targetNode.data.internal.type

    console.log("sourceNodeType", sourceNodeType)
    console.log("targetNodeType", targetNodeType)

    // If the connection is between an input and a segmentation node
    if ((sourceNodeType == "input" && targetNodeType == "segmentation") || (sourceNodeType == "segmentation" && targetNodeType == "input")) {
      // If the segmentation node already has an input, a connection to a new input is not allowed
      if (edges.find((edge) => edge.target == targetNode.id)) {
        return false
      }
    }

    return true
  }

  return (
    <>
      <WorkflowBase
        // mandatory props
        mandatoryProps={{
          reactFlowInstance: reactFlowInstance,
          setReactFlowInstance: setReactFlowInstance,
          addSpecificToNode: addSpecificToNode,
          nodeTypes: nodeTypes,
          nodes: nodes,
          setNodes: setNodes,
          onNodesChange: onNodesChange,
          edges: edges,
          setEdges: setEdges,
          onEdgesChange: onEdgesChange,
          onNodeDrag: onNodeDrag,
          runNode: runNode,
          nodeUpdate: nodeUpdate,
          setNodeUpdate: setNodeUpdate
        }}
        // optional props
        onDeleteNode={deleteNode}
        isGoodConnection={isGoodConnection}
        // represents the visual of the workflow

        uiTopRight={
          <>
            {workflowType == "learningMEDimage" ? (
              <>
                <BtnDiv
                  buttonsList={[
                    { type: "run", onClick: onRun },
                    { type: "clear", onClick: onClear },
                    { type: "save", onClick: onSave },
                  ]}
                  op={op}
                />
              </>
            ) : (
              <BtnDiv buttonsList={[{ type: "back", onClick: onBack }]} />
            )}
          </>
        }
        ui={
          <>
            {/* bottom center - progress bar */}
            <div className="panel-bottom-center">{isProgressUpdating && <ProgressBarRequests progressBarProps={{ animated: true, variant: "success" }} isUpdating={isProgressUpdating} setIsUpdating={setIsProgressUpdating} progress={progress} setProgress={setProgress} requestTopic={"learning_MEDimage/progress/" + pageId} />}</div>
          </>
        }
      />
    </>
  )
}

export default FlowCanvas
