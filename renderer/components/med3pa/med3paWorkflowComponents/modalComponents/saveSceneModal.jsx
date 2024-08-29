import React from "react"
import { Modal, Button } from "react-bootstrap"
import FlInput from "../../baseComponents/paInput"

/**
 *
 * @param {boolean} show Determines whether the modal is visible or not.
 * @param {Function} onHide Function to handle closing the modal.
 * @param {Function} onSave Function to handle saving the scene with the specified name.
 * @param {string} sceneName The current name of the scene.
 * @param {Function} setSceneName Function to update the name of the scene.
 * @returns {JSX.Element} The rendered modal component.
 *
 * @description
 * This component renders a modal that allows users to enter a name for a scene and save it.
 */
const SaveSceneModal = ({ show, onHide, onSave, sceneName, setSceneName }) => {
  const handleSave = () => {
    if (sceneName) {
      onSave(sceneName)
      onHide() // Close the modal after save
    }
  }

  return (
    <Modal show={show} onHide={() => onHide()} centered>
      <Modal.Header>
        <Modal.Title>Save Scene</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FlInput
          name="file name"
          settingInfos={{
            type: "string",
            tooltip: "<p>Specify a name for your scene</p>"
          }}
          currentValue={sceneName}
          onInputChange={(e) => setSceneName(e.value)}
          setHasWarning={() => {}}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSave} disabled={!sceneName || sceneName.trim() === ""}>
          Save Scene
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SaveSceneModal
