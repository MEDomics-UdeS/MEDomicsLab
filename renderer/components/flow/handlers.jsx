import React, { useState, useEffect } from "react";
import { Handle } from "reactflow";
import { Tooltip } from "react-tooltip";

/**
 *
 * @param {string} id used to identify the node
 * @param {object} data contains the data of the node. refer to renderer\components\flow\learning\workflow.jsx at function createNode for more information
 * @returns {JSX.Element} handlers of the node (connections points)
 */
const Handlers = ({ id, setupParam }) => {
  /**
   *
   * @param {*} arr array of possibles connections
   * @param {*} i index of the connection
   * @returns % of the position of the connection according to the number of connections
   */
  const getConnPositionStyle = (arr, i) => {
    let length = arr.length;
    return {
      top: `${((i + 1) * 100) / (length + 1)}%`,
    };
  };

  return (
    <>
      {setupParam["input"].map((input, i) => (
        <div key={`left-${i}_${id}`}>
          <Handle
            id={`${i}_${id}`}
            type="target"
            position="left"
            className={input}
            style={getConnPositionStyle(setupParam["input"], i)}
            isConnectable
          />
          <Tooltip
            className="tooltip"
            anchorSelect={`[data-handlepos='left'][data-handleid='${i}_${id}']`}
            delayShow={1000}
            place="left"
          >
            {input}
          </Tooltip>
        </div>
      ))}
      {setupParam["output"].map((output, i) => (
        <div key={`right-${i}_${id}`}>
          <Handle
            id={`${i}_${id}`}
            type="source"
            position="right"
            className={output}
            style={getConnPositionStyle(setupParam["output"], i)}
            isConnectable
          />
          <Tooltip
            className="tooltip"
            anchorSelect={`[data-handlepos='right'][data-handleid='${i}_${id}']`}
            delayShow={1000}
            place="right"
          >
            {output}
          </Tooltip>
        </div>
      ))}
    </>
  );
};

export default Handlers;
