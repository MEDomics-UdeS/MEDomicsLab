import React from "react"
import { Button } from "primereact/button"

const FileCreationBtn = ({ label = "Create Scene", piIcon = "pi-plus", handleClickCreateScene }) => {
  return (
    <>
      <Button onClick={handleClickCreateScene} className={`btn-sidebar`} label={label} icon={"pi " + piIcon} iconPos="right" />
    </>
  )
}

export default FileCreationBtn
