import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "react-bootstrap";
import { Handle } from "reactflow";
import Card from "react-bootstrap/Card";
import CloseButton from "react-bootstrap/CloseButton";
import { Tooltip } from "react-tooltip";
import Handlers from "../../flow/handlers";

/**
 *
 * @param {*} id id of the node
 * @param {*} data data of the node
 * @param {*} type type of the node
 * @returns {JSX.Element} A GroupNode
 *
 * @description
 * This component is used to display a GroupNode.
 * A GroupNode is a node that contains a subflow, so it handles a click that change the active display subflow.
 * It does not implement a Node because it does not need to have access to an offcanvas
 */
const GroupNode = ({ id, data }) => {
  return (
    <>
      <div>
        <div>
          <Handlers id={id} setupParam={data.setupParam} />
          <Card key={`${id}`} id={`${id}`} className="text-left node">
            <Card.Header onClick={() => data.parentFct.changeSubFlow(id)}>
              <img
                src={
                  "/icon/extraction/" +
                  `${data.internal.img.replaceAll(" ", "_")}`
                }
                alt={data.internal.img}
                className="icon-nodes"
              />
              {data.internal.name}
            </Card.Header>
          </Card>
        </div>

        <CloseButton onClick={() => data.parentFct.deleteNode(id)} />
        {data.setupParam.classes.split(" ").includes("run") && (
          <Button
            variant="success"
            className="btn-runNode"
            onClick={() => data.parentFct.runNode(id)}
          >
            <img src={"/icon/run.svg"} alt="run" className="img-fluid" />
          </Button>
        )}
      </div>
    </>
  );
};

export default GroupNode;
