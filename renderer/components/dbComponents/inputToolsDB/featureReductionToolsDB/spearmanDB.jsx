import React from "react"
import { Message } from "primereact/message"

/**
 * Component that renders the Spearman feature reduction creation tool
 */
const SpearmanDB = () => {
  return (
    <div className="margin-top-15 center">
      <Message text="The Spearman tool enables you to compute correlations between columns in your data and a specified target. It also allows you to select columns to keep in your dataset based on the computed correlations." />
    </div>
  )
}

export default SpearmanDB
