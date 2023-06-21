/* eslint-disable react/prop-types */
import React, { useRef, useCallback } from "react";
import { toast } from "react-toastify";
import ReactFlow, {
	Controls,
	Background,
	MiniMap,
	updateEdge,
} from "reactflow";

import { getId } from "../../utilities/staticFunctions";

/**
 *
 * @param { JSX.Element } ui jsx element to display on the workflow
 * @param { function } createNode function to create a node
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
	onConnect,
}) => {
	const edgeUpdateSuccessful = useRef(true);

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
				{/* https://reactflow.dev/docs/api/background/ */}
				<MiniMap className="minimapStyle" zoomable pannable />{" "}
				{/* https://reactflow.dev/docs/api/minimap/ */}
				<Controls /> {/* https://reactflow.dev/docs/api/controls/ */}
				{ui}
			</ReactFlow>
		</div>
	);
};

export default WorkflowBase;
