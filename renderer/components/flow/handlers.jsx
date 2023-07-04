import React from "react";
import { Handle } from "reactflow";
import { Tooltip } from "react-tooltip";

/**
 *
 * @param {Array} arr array of possibles connections
 * @param {Int} i index of the connection
 * @returns % of the position of the connection according to the number of connections
 */
const getConnPositionStyle = (arr, i) => {
	let length = arr.length;
	return {
		top: `${((i + 1) * 100) / (length + 1)}%`,
	};
};


/**
 * 
 * @param {String} id id of the node
 * @param {Object} setupParam setupParam of the node. found in the config file of the node in /public
 * @description This component is used to display the handlers of the node (connection points)
 * Each handler has a tooltip that displays the possible connections
 */
const Handlers = ({ id, setupParam }) => {

	return (
		<>
			{/* We create a handler for each input of the node. */}
			{[...Array(setupParam["nbInput"])].map((x, i) => (
				<div key={`left-${i}_${id}`}>
					<Handle
						id={`${i}_${id}`}
						type="target"
						position="left"
						style={getConnPositionStyle(setupParam["input"], i)}
						isConnectable
					/>
					<Tooltip
						className="tooltip"
						anchorSelect={`[data-handlepos='left'][data-handleid='${i}_${id}']`}
						delayShow={1000}
						place="left"
					>
						{setupParam["input"].join(", ")}
					</Tooltip>
				</div>
			))}
			{/* We create a handler for each output of the node. */}
			{[...Array(setupParam["nbOutput"])].map((x, i) => (
				<div key={`right-${i}_${id}`}>
					<Handle
						id={`${i}_${id}`}
						type="source"
						position="right"
						style={getConnPositionStyle(setupParam["output"], i)}
						isConnectable
					/>
					<Tooltip
						className="tooltip"
						anchorSelect={`[data-handlepos='right'][data-handleid='${i}_${id}']`}
						delayShow={1000}
						place="right"
					>
						{setupParam["output"].join(", ")}
					</Tooltip>
				</div>
			))}
		</>
	);
};

export default Handlers;
