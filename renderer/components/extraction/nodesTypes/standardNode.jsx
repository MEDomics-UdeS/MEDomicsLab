import React, { useState, useEffect, useCallback, useRef, use } from "react"
import Node from "../../flow/node"
import ViewButton from "../buttonsTypes/viewButton"
import InterpolationForm from "./standardNodeForms/interpolationForm.jsx"
import ReSegmentationForm from "./standardNodeForms/reSegmentationForm.jsx"
import DiscretizationForm from "./standardNodeForms/discretizationForm.jsx"
import InputForm from "./standardNodeForms/inputForm"

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
const nodeTypes = {
  input: InputForm,
  interpolation: InterpolationForm,
  re_segmentation: ReSegmentationForm,
  discretization: DiscretizationForm
}

const StandardNode = ({ id, data, type }) => {
  const [nodeForm, setNodeForm] = useState(data.internal.settings)

  useEffect(() => {
    console.log(nodeForm)
    console.log(data.setupParam.possibleSettings.defaultSettings)
  }, [nodeForm])

  const changeNodeForm = useCallback(
    (event) => {
      const { name, value } = event.target
      const updatedValue = value // TODO : Check terniary on updatedValue

      // TODO : Should cast types for value depending on the name
      setNodeForm((prevNodeForm) => ({
        ...prevNodeForm,
        [name]: updatedValue
      }))
    },
    [nodeForm]
  )
  const enableView = useCallback(() => {
    // Enable view button
    data.internal.enableView = true
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [nodeForm])

  // Called when the form is changed, updates the node data
  useEffect(() => {
    data.internal.settings = nodeForm
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [nodeForm])

  const nodeSpecificType = data.internal.type.replace(/-/g, "_")
  const SpecificNodeComponent = nodeTypes[nodeSpecificType]

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        type={nodeSpecificType}
        setupParam={data.setupParam}
        defaultSettings={
          <ViewButton id={id} data={data} type={nodeSpecificType} />
        }
        nodeSpecific={
          SpecificNodeComponent ? (
            <SpecificNodeComponent
              nodeForm={nodeForm}
              changeNodeForm={changeNodeForm}
              data={data}
              enableView={enableView}
            />
          ) : null
        }
      />
    </>
  )
}

export default StandardNode
