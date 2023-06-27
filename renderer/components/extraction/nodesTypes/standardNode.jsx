import React, { useState, useEffect, useCallback, useRef } from "react";
import Node from "../../flow/node";
import ViewButton from "../buttonsTypes/viewButton";
/**
 *
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A StandardNode node
 *
 * @description
 * This component is used to display a StandardNode node.
 * it handles the display of the node and the modal
 *
 */
const StandardNode = ({ id, data, type }) => {
  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        type={type}
        setupParam={data.setupParam}
        defaultSettings={<ViewButton id={id} data={data} type={type} />}
        nodeSpecific={<></>}
      />
    </>
  );
};

export default StandardNode;