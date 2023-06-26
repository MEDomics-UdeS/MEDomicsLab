/* eslint-disable react/prop-types */
import React, { useRef, useCallback } from "react";
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
	ui,
	createNode,
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
	isGoodConnection,
}) => {
	const edgeUpdateSuccessful = useRef(true);


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
				// creation of the node according to the function definition passed as props
				const newNode = createNode(position, node, getId());
				setNodes((nds) => nds.concat(newNode));
				console.log("new node created: ", node);
			} else {
				console.log("node type not found: ", nodeType);
			}
		},
		[reactFlowInstance, createNode]
	);

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
