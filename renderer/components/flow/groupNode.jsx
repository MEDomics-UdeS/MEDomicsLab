import React, { useContext } from "react"
import { Button } from "react-bootstrap"
import Card from "react-bootstrap/Card"
import CloseButton from "react-bootstrap/CloseButton"
import Handlers from "./handlers"
import { FlowInfosContext } from "./context/flowInfosContext"
import { FlowFunctionsContext } from "./context/flowFunctionsContext"

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
  const { flowInfos } = useContext(FlowInfosContext) // used to get the flow infos
  const { changeSubFlow, runNode, onDeleteNode } =
    useContext(FlowFunctionsContext) // used to get the functions to change the subflow, run the node and delete the node

  return (
    <>
      <div>
        <div>
          <Handlers
            id={id}
            setupParam={data.setupParam}
            tooltipBy={data.tooltipBy}
          />
          <Card key={`${id}`} id={`${id}`} className="text-left node">
            <Card.Header onClick={() => changeSubFlow(id)}>
              <img
                src={
                  "/icon/" +
                  flowInfos.type +
                  "/" +
                  `${data.internal.img.replaceAll(" ", "_")}`
                }
                alt={data.internal.img}
                className="icon-nodes"
              />
              {data.internal.name}
            </Card.Header>
          </Card>
        </div>

        <CloseButton onClick={() => onDeleteNode(id)} />
        {data.setupParam.classes.split(" ").includes("run") && (
          <Button
            variant="success"
            className="btn-runNode"
            onClick={() => runNode(id)}
          >
            <img src={"/icon/run.svg"} alt="run" className="img-fluid" />
          </Button>
        )}
      </div>
    </>
  )
}

export default GroupNode
