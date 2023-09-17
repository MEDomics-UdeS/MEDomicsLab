import React from "react"
import { useContext } from "react"
import { OffCanvasBackdropStyleContext } from "./context/offCanvasBackdropStyleContext"

/**
 *
 * @param {String} pageId Id of the page for multi-tabs support
 * @description This component is the backdrop (darker screen when a node is clicked)
 */
const Backdrop = ({ pageId }) => {
  // here we use the context to get the style for the backdrop. this style is updated when a node is clicked
  const { backdropStyle } = useContext(OffCanvasBackdropStyleContext)

  return (
    <div
      id={pageId}
      className="workflow-settings padding-0_5rem"
      style={backdropStyle}
    />
  )
}

export default Backdrop
