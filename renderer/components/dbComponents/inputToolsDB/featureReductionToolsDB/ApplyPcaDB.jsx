import React from "react"
import { Message } from "primereact/message"

/**
 * Component that renders the ApplyPCA feature reduction tool
 */
const ApplyPCADB = () => {
  return (
    <div className="margin-top-15 center">
      <Message text="This tool enables you to perform Principal Component Analysis (PCA) on your selected data using an existing PCA transformation (which you can create using the Create PCA tool)." />
    </div>
  )
}
export default ApplyPCADB
