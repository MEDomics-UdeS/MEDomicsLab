import React, { useRef, useState, useEffect } from "react"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { OverlayPanel } from "primereact/overlaypanel"
import { Stack } from "react-bootstrap"
import { Controller, useForm } from "react-hook-form"
import classNames from "classnames"

const FileCreationBtn = ({ createEmptyFile, label = "Create Page", piIcon = "pi-plus", handleClickCreateScene, checkIsNameValid }) => {
  const createSceneRef = useRef(null)
  const [btnCreateSceneState, setBtnCreateSceneState] = useState(false)
  const [sceneName, setSceneName] = useState("") // We initialize the experiment name state to an empty string
  const [showErrorMessage, setShowErrorMessage] = useState(false) // We initialize the create experiment error message state to an empty string

  // We use the useEffect hook to update the create experiment error message state when the experiment name changes
  useEffect(() => {
    defaultCheckIsNameValid(sceneName)
  }, [sceneName]) // We set the button state to true if the experiment name is empty, otherwise we set it to false

  const defaultCheckIsNameValid = (sceneName) => {
    checkIsNameValid
      ? checkIsNameValid(sceneName)
      : (sceneName) => {
          return sceneName != "" && !sceneName.includes(" ")
        }
    let isNameValid = checkIsNameValid(sceneName)
    setBtnCreateSceneState(isNameValid)
    setShowErrorMessage(!isNameValid)
    return isNameValid
  }

  /**
   *
   * @param {Event} e - The event passed on by the create scene button
   * @description - This function is used to open the create scene overlay panel when the create scene button is clicked
   */
  const defaultHandleClickCreateScene = (e) => {
    createSceneRef.current.toggle(e)
  }

  /**
   *
   * @param {Event} e - The event passed on by the create button
   * @description - This function is used to create an experiment when the create button is clicked
   */
  const handleFileCreation = (e) => {
    createSceneRef.current.toggle(e)
    createEmptyFile(sceneName)
  }

  /**
   *
   * @param {Event} e - The event passed on by the create scene button
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (defaultCheckIsNameValid(sceneName)) {
        createSceneRef.current.toggle(e)
        createEmptyFile(sceneName)
      }
    }
  }

  return (
    <>
      <Button onClick={handleClickCreateScene ? handleClickCreateScene : defaultHandleClickCreateScene} className={`btn-sidebar`} label={label} icon={"pi " + piIcon} iconPos="right" />
      <OverlayPanel className="create-scene-overlayPanel" ref={createSceneRef}>
        <div>
          <div className="header">
            <h5>Create Page</h5>
            <hr className="solid" />
          </div>
          <div className="create-scene-overlayPanel-body">
            <div>
              <span className="p-float-label">
                <InputText id="expName" value={sceneName} onChange={(e) => setSceneName(e.target.value)} onKeyDown={handleKeyDown} aria-describedby="name-msg" className={`${showErrorMessage ? "p-invalid" : ""}`} />
                <label htmlFor="expName">Enter Page name</label>
              </span>
              <small id="name-msg" className="text-red">
                {showErrorMessage ? "Page name is empty, contains spaces or already exists" : ""}
              </small>
            </div>

            <hr className="solid" />
            <div className="button-group">
              <Button label="Cancel" icon="pi pi-times" iconPos="right" onClick={(e) => createSceneRef.current.toggle(e)} />
              <Button label="Create" type="submit" icon="pi pi-plus" iconPos="right" disabled={!btnCreateSceneState} onClick={handleFileCreation} />
            </div>
          </div>
        </div>
      </OverlayPanel>
    </>
  )
}

export default FileCreationBtn
