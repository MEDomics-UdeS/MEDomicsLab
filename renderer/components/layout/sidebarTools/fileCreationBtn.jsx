import React, { useRef, useState, useEffect } from "react"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { OverlayPanel } from "primereact/overlaypanel"
import { Stack } from "react-bootstrap"
import { Controller, useForm } from "react-hook-form"
import classNames from "classnames"

const FileCreationBtn = ({ createEmptyFile, label = "Create Scene", piIcon = "pi-plus", handleClickCreateScene, checkIsNameValid }) => {
  const createSceneRef = useRef(null)
  const [btnCreateSceneState, setBtnCreateSceneState] = useState(false)
  const [sceneName, setSceneName] = useState("") // We initialize the experiment name state to an empty string
  const [showErrorMessage, setShowErrorMessage] = useState(false) // We initialize the create experiment error message state to an empty string

  // We use the useEffect hook to update the create experiment error message state when the experiment name changes
  useEffect(() => {
    checkIsNameValid
      ? checkIsNameValid(sceneName)
      : (sceneName) => {
          return sceneName != "" && !sceneName.includes(" ")
        }
    let isNameValid = checkIsNameValid(sceneName)
    setBtnCreateSceneState(isNameValid)
    setShowErrorMessage(!isNameValid)
  }, [sceneName]) // We set the button state to true if the experiment name is empty, otherwise we set it to false

  /**
   *
   * @param {Event} e - The event passed on by the create scene button
   * @description - This function is used to open the create scene overlay panel when the create scene button is clicked
   */
  const defaultHandleClickCreateScene = (e) => {
    console.log("Create Scene")
    createSceneRef.current.toggle(e)
  }

  /**
   *
   * @param {Event} e - The event passed on by the create button
   * @description - This function is used to create an experiment when the create button is clicked
   */
  const handleFileCreation = (e) => {
    console.log("Create Scene")
    console.log(`Scene Name: ${sceneName}`) // We log the experiment name when the create button is clicked
    createSceneRef.current.toggle(e)
    createEmptyFile(sceneName)
  }

  const defaultValues = {
    value: ""
  }

  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    reset
  } = useForm({ defaultValues })

  const onSubmit = (data) => {
    console.log("data", data)
    handleFileCreation(data)
    reset()
  }

  const getFormErrorMessage = (name) => {
    return errors[name] ? <small className="p-error">{errors[name].message}</small> : <small className="p-error">&nbsp;</small>
  }

  return (
    <>
      <Button onClick={handleClickCreateScene ? handleClickCreateScene : defaultHandleClickCreateScene} className={`btn-sidebar`} label={label} icon={"pi " + piIcon} iconPos="right" />
      <OverlayPanel className="create-scene-overlayPanel" ref={createSceneRef}>
        <Stack direction="vertical" gap={4}>
          <div className="header">
            <Stack direction="vertical" gap={1}>
              <h5>Create Scene</h5>
              <hr className="solid" />
            </Stack>
          </div>
          <div className="create-scene-overlayPanel-body">
            {/* <div>
              <span className="p-float-label">
                <InputText id="expName" value={sceneName} onChange={(e) => setSceneName(e.target.value)} aria-describedby="name-msg" className={`${showErrorMessage ? "p-invalid" : ""}`} />
                <label htmlFor="expName">Enter scene name</label>
              </span>
              <small id="name-msg" className="text-red">
                {showErrorMessage ? "Scene name is empty, contains spaces or already exists" : ""}
              </small>
            </div>

            <hr className="solid" />
            <Button variant="secondary" onClick={(e) => createSceneRef.current.toggle(e)} style={{ marginRight: "1rem" }}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!btnCreateSceneState} onClick={handleFileCreation}>
              Create
            </Button> */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-2">
              <Controller
                name="value"
                control={control}
                rules={{ required: "Name - Surname is required." }}
                render={({ field, fieldState }) => (
                  <>
                    <label htmlFor={field.name} className={classNames({ "p-error": errors.value })}></label>
                    <span className="p-float-label">
                      <InputText id={field.name} value={field.value} className={classNames({ "p-invalid": fieldState.error })} onChange={(e) => field.onChange(e.target.value)} />
                      <label htmlFor={field.name}>Name - Surname</label>
                    </span>
                    {getFormErrorMessage(field.name)}
                  </>
                )}
              />
              {/* <Button label="Submit" type="submit" icon="pi pi-check" /> */}
              <Button label="Cancel" icon="pi pi-close" onClick={(e) => createSceneRef.current.toggle(e)} style={{ marginRight: "1rem" }} />
              <Button label="Create" type="submit" icon="pi pi-plus" disabled={!btnCreateSceneState} onClick={handleFileCreation} />
            </form>
          </div>
        </Stack>
      </OverlayPanel>
    </>
  )
}

export default FileCreationBtn
