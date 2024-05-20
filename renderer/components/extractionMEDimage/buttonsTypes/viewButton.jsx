import React, { useContext } from "react"
import Button from "react-bootstrap/Button"
import { toast } from "react-toastify"
import { requestBackend } from "../../../utilities/requests"
import { ErrorRequestContext } from "../../generalPurpose/errorRequestContext"
import { WorkspaceContext } from "../../workspace/workspaceContext"

/**
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A ViewButton node
 *
 * @description
 * This component is used to display the ViewButton.
 * The state of the button is determined by the enableView property of the node.
 */
const ViewButton = ({ id, data, type }) => {
  const { port, setShowError } = useContext(WorkspaceContext)
  const { setError } = useContext(ErrorRequestContext)

  /**
   * @description
   * This function is used to send a POST request to /extraction_MEDimage/view.
   */
  const viewImage = () => {
    console.log("Viewing image for node " + id)

    // Construction of form data to send to /extraction_MEDimage/view. If the node is input, the name of the file is needed
    let formData
    if (data.internal.settings.hasOwnProperty("filepath")) {
      formData = {
        id: id,
        name: type,
        // eslint-disable-next-line camelcase
        file_loaded: data.internal.settings.filepath
      }
    } else {
      formData = {
        id: id,
        name: type
      }
    }
    
    requestBackend(port, "/extraction_MEDimage/view/", formData, (response) => {
      if (response.error) {
        toast.error(response.error)
        console.log("error", response.error)

        // check if error has message or not
        if (response.error.message){
          console.log("error message", response.error.message)
          setError(response.error)
        } else {
          console.log("error no message", response.error)
          setError({
            "message": response.error
          })
        }
        setShowError(true)
      } else {
        console.log(response)

        // Toast success message
        toast.success("Image displayed successfully")
      }
    })
  }

  return (
    <div className="test">
      <Button type="button" className="viewButton" onClick={viewImage} disabled={!data.internal.enableView}>
        <img src="../icon/extraction/eye.svg" className="viewImage" alt="View button" />
        View image
      </Button>
    </div>
  )
}

export default ViewButton
