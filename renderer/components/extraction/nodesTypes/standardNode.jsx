import React, { useState, useEffect, useCallback } from "react"
import Node from "../../flow/node"
import ViewButton from "../buttonsTypes/viewButton"
// Importing the different forms for each node type
import InterpolationForm from "./standardNodeForms/interpolationForm.jsx"
import ReSegmentationForm from "./standardNodeForms/reSegmentationForm.jsx"
import DiscretizationForm from "./standardNodeForms/discretizationForm.jsx"
import InputForm from "./standardNodeForms/inputForm"

// Creating a dictionary of the different node names and their corresponding form
const nodeTypes = {
  input: InputForm,
  interpolation: InterpolationForm,
  re_segmentation: ReSegmentationForm,
  discretization: DiscretizationForm
}

/**
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @returns {JSX.Element} A StandardNode node
 *
 * @description
 * This component is used to display a StandardNode node.
 * it handles the display of the node and the modal
 */
const StandardNode = ({ id, data }) => {
  const [nodeForm, setNodeForm] = useState(data.internal.settings) // Hook to keep track of the form of the node

  // Hook called when the nodeForm is changed, updates the node data
  useEffect(() => {
    data.internal.settings = nodeForm
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [nodeForm])

  /**
   * @param {Event} event event given upon form change
   *
   * @description
   * This function is used to change the node form when the user changes the form
   */
  const changeNodeForm = useCallback(
    (event) => {
      const { name, value } = event.target
      const updatedValue = value // TODO : Check terniary on updatedValue

      setNodeForm((prevNodeForm) => ({
        ...prevNodeForm,
        [name]: updatedValue
      }))
    },
    [nodeForm]
  )

  /**
   * @description
   * This function is used to enable the view button of the node
   */
  const enableView = useCallback(() => {
    // Enable view button
    data.internal.enableView = true
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [nodeForm])

  // Get the node type by replacing "-" by "_" to access the nodeTypes dictionary
  const nodeSpecificType = data.internal.type.replace(/-/g, "_")
  // Get the form component corresponding to the node type
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
