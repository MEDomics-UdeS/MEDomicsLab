import React, { useState, useEffect, useCallback, useRef } from "react";
import Node from "../../flow/node";
import ViewButton from "../buttonsTypes/viewButton";
import UploadComponent from "../buttonsTypes/uploadButton";

/**
 *
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A StandardNode node
 *
 * @description
 *
 */
const InputNode = ({ id, data, type }) => {
  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        type={type}
        setupParam={data.setupParam}
        defaultSettings={
          <>
            <UploadComponent id={id} data={data} type={type} />
            <ViewButton id={id} data={data} type={type} />
          </>
        }
        nodeSpecific={<></>}
      />
    </>
  );
};

export default InputNode;
