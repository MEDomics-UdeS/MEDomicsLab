/* eslint-disable react/prop-types */
import React, { useRef, useCallback, useEffect, useState} from "react";
import { toast } from "react-toastify";
import ReactFlow, {
	Controls,
	Background,
	MiniMap,
	updateEdge,
	addEdge,
} from "reactflow";

import { getId, deepCopy } from "../../utilities/staticFunctions";


/**
 *
 * @param { JSX.Element } ui jsx element to display on the workflow
 * @param { function } createNode function to create a node
 * @param { object } reactFlowInstance instance of the reactFlow
 * @param { function } setReactFlowInstance function to set the reactFlowInstance
 * @param { object } nodeTypes object containing the node types
 * @param { object } nodes array containing the nodes
 * @param { function } setNodes function to set the nodes
 * @param { function } onNodesChange function called when the nodes change
 * @param { object } edges array containing the edges
 * @param { function } setEdges function to set the edges
 * @param { function } onEdgesChange function called when the edges change
 * @param { function } onNodeDrag function called when a node is dragged
 * @param { function } isGoodConnection function to check if a connection is valid
 *
 * @returns {JSX.Element} A workflow
 *
 * @description
 * This component is used to display a workflow.
 * It manages base workflow functions such as node creation, node deletion, node connection, etc.
 */
const WorkflowBase = ({
	mandatoryProps,
	isGoodConnection,
	onDeleteNode,
	groupNodeHandlingDefault,
	ui,
}) => {

	const {
		reactFlowInstance,
		setReactFlowInstance,
		nodeTypes,
		nodes,
		setNodes,
		onNodesChange,
		edges,
		setEdges,
		onEdgesChange,
		onNodeDrag,
		runNode,
		addSpecificToNode,
	} = mandatoryProps;
	
	const edgeUpdateSuccessful = useRef(true);
	const [nodeUpdate, setNodeUpdate] = useState({}); // nodeUpdate is used to update a node internal data
	// execute this when a variable change or a function is called related to the callback hook in []
	// setNodeUpdate function is passed to the node component to update the internal data of the node
	useEffect(() => {
		// if the nodeUpdate object is not empty, update the node
		if (nodeUpdate.id) {
			setNodes((nds) =>
				nds.map((node) => {
					if (node.id == nodeUpdate.id) {
						// it's important that you create a new object here in order to notify react flow about the change
						node.data = {
							...node.data,
						};
						// update the internal data of the node
						node.data.internal = nodeUpdate.updatedData;
					}
					return node;
				})
			);
		}
	}, [nodeUpdate, setNodes]);
	

	/**
	 * @param {object} params
	 * @param {string} params.source
	 * @param {string} params.target
	 * @param {string} params.sourceHandle
	 * @param {string} params.targetHandle
	 *
	 * @returns {void}
	 *
	 * @description
	 * This function is called when a connection is created between two nodes.
	 * It checks if the connection is valid and if it is, it adds the connection to the edges array.
	 * If the connection is not valid, it displays an error message.
	 *
	 */
	const onConnect = useCallback(
		(params) => {
			console.log("new connection request", params);

			// check if the connection already exists
			let alreadyExists = false;
			edges.forEach((edge) => {
				if (
					edge.source === params.source &&
					edge.target === params.target
				) {
					alreadyExists = true;
				}
			});

			// get the source and target nodes
			let sourceNode = deepCopy(
				nodes.find((node) => node.id === params.source)
			);
			let targetNode = deepCopy(
				nodes.find((node) => node.id === params.target)
			);
			// check if sourceNode's outputs is compatible with targetNode's inputs
			let isValidConnection = false
			sourceNode.data.setupParam.output.map((output) =>{
				if(targetNode.data.setupParam.input.includes(output)){
					isValidConnection = true
				}
			})
			
			// if isGoodConnection is defined, check if the connection is valid again with the isGoodConnection function
			isGoodConnection && (isValidConnection = isValidConnection && isGoodConnection(params));

			if (!alreadyExists && isValidConnection) {
				setEdges((eds) => addEdge(params, eds));
			} else {
				toast.error(
					`Connection refused: ${
						alreadyExists
							? "It already exists"
							: "Not a valid connection"
					}`,
					{
						position: "bottom-right",
						autoClose: 2000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
						theme: "light",
					}
				);
			}
		},
		[nodes, edges]
	);

	/**
	 * @param {object} event
	 *
	 * @returns {void}
	 *
	 * @description
	 * This function is called when a node is dragged over the workflow.
	 * It prevents the default behavior of the event and sets the dropEffect to 'move'.
	 *
	 */
	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	/**
	 * @param {object} event
	 *
	 * @returns {void}
	 *
	 * @description
	 * This function is called when a node is dropped on the workflow.
	 */
	const onDrop = useCallback(
		(event) => {
			event.preventDefault();
			// get the node type from the dataTransfer set by the onDragStart function at sidebarAvailableNodes.jsx
			const node = JSON.parse(
				event.dataTransfer.getData("application/reactflow")
			);
			const { nodeType } = node;

			if (nodeType in nodeTypes) {
				const position = reactFlowInstance.project({
					x: event.clientX - 300,
					y: event.clientY - 75,
				});
				// create a new random id for the node
				let newId = getId();
				// if the node is a group node, call the groupNodeHandlingDefault function if it is defined
				if (nodeType === "groupNode" && groupNodeHandlingDefault) {
					groupNodeHandlingDefault(createBaseNode, newId);
				}
				// create a base node with common properties
				let newNode = createBaseNode(position, node, newId)
				// add specific properties to the node
				newNode = addSpecificToNode(newNode);
				// add the new node to the nodes array
				setNodes((nds) => nds.concat(newNode));
				console.log("new node created: ", node);
			} else {
				console.log("node type not found: ", nodeType);
			}
		},
		[reactFlowInstance, addSpecificToNode]
	);

	/**
	 * 
	 * @param {Object} position the drop position of the node ex. {x: 100, y: 100}
	 * @param {Object} node the node object containing the nodeType, name and image path
	 * @param {String} id the id of the node 
	 * @returns 
	 */
	const createBaseNode = (position, node, id) => {
		const { nodeType, name, image } = node;
		let newNode = {
			id: id,
			type: nodeType,
			name: name,
			position,
			data: {
				// here is the data accessible by children components
				internal: {
					name: name,
					img: image,
					type: name.toLowerCase(),
				},
				parentFct: {
					updateNode: setNodeUpdate,
					deleteNode: onDeleteNode || deleteNode,
					runNode: runNode,
				},
			},
		};
		return newNode
	};

	/**
	 * 
	 * @param {String} nodeId id of the node to delete
	 * @description default function to delete a node
	 */
	const deleteNode = (nodeId) => {
		setNodes((nds) => nds.filter((node) => node.id !== nodeId));
		setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
		);
	};

	/**
	 * @description
	 * This function is called when an edge is dragged.
	 */
	const onEdgeUpdateStart = useCallback(() => {
		edgeUpdateSuccessful.current = false;
	}, []);

	/**
	 *
	 * @param {Object} oldEdge
	 * @param {Object} newConnection
	 *
	 * @returns {void}
	 *
	 * @description
	 * This function is called when an edge is dragged and dropped on another node.
	 * It checks if the connection is valid and if it is, it updates the edge.
	 * If the connection is not valid, it displays an error message.
	 */
	const onEdgeUpdate = (oldEdge, newConnection) => {
		edgeUpdateSuccessful.current = true;
		let alreadyExists = false;
		edges.forEach((edge) => {
			if (
				edge.source === newConnection.source &&
				edge.target === newConnection.target
			) {
				alreadyExists = true;
			}
		});
		if (!alreadyExists) {
			console.log("connection changed");
			setEdges((els) => updateEdge(oldEdge, newConnection, els));
		} else {
			toast.error("Connection refused: it already exists", {
				position: "bottom-right",
				autoClose: 2000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
		}
	};

	/**
	 * @param {object} event
	 *
	 * @returns {void}
	 *
	 * @description
	 * This function is called when an edge is dragged.
	 * It checks if the connection is valid and if it is, it updates the edge.
	 */
	const onEdgeUpdateEnd = useCallback((_, edge) => {
		if (!edgeUpdateSuccessful.current) {
			setEdges((eds) => eds.filter((e) => e.id !== edge.id));
		}
		edgeUpdateSuccessful.current = true;
	}, []);

	return (
		<div className="height-100">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onInit={setReactFlowInstance}
				nodeTypes={nodeTypes}
				onNodeDrag={onNodeDrag}
				onConnect={onConnect}
				onDrop={onDrop}
				onDragOver={onDragOver}
				onEdgeUpdate={onEdgeUpdate}
				onEdgeUpdateStart={onEdgeUpdateStart}
				onEdgeUpdateEnd={onEdgeUpdateEnd}
				fitView
			>
				<Background />{" "}
				<MiniMap className="minimapStyle" zoomable pannable />{" "}
				<Controls /> 
				{ui}
			</ReactFlow>
		</div>
	);
};

export default WorkflowBase;
