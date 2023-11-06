import React, { useRef, useState, useEffect } from "react"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { OverlayPanel } from "primereact/overlaypanel"

/**
 *
 * @param {Function} createEmptyFile - Function to create an empty file
 * @param {String} label - Label of the create button
 * @param {String} piIcon - Icon of the create button
 * @param {Function} handleClickCreateScene - Function to call when the create button is clicked
 * @param {Function} checkIsNameValid - Function to check if the name is valid
 *
 * @description - This component is used to create a file in the sidebar
 * @returns - A button to create a file
 */
const FileCreationBtn = ({ createEmptyFile, label = "Create Page", piIcon = "pi-plus", handleClickCreateScene, checkIsNameValid }) => {
  const createSceneRef = useRef(null)
  const [btnCreateSceneState, setBtnCreateSceneState] = useState(false)
  const [sceneName, setSceneName] = useState("") // We initialize the experiment name state to an empty string
  const [showErrorMessage, setShowErrorMessage] = useState(false) // We initialize the create experiment error message state to an empty string

  // We use the useEffect hook to update the create experiment error message state when the experiment name changes
  useEffect(() => {
    defaultCheckIsNameValid(sceneName)
  }, [sceneName]) // We set the button state to true if the experiment name is empty, otherwise we set it to false

  /**
   *
   * @param {String} sceneName - Name of the scene
   * @returns - True if the name is valid, false otherwise
   */
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
    defaultCheckIsNameValid(sceneName)
    handleClickCreateScene && handleClickCreateScene(e)
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
      <Button onClick={defaultHandleClickCreateScene} className={`btn-sidebar`} label={label} icon={"pi " + piIcon} iconPos="right" />
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
