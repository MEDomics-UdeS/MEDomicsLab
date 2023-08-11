import React from "react"
import Button from "react-bootstrap/Button"
import { toast } from "react-toastify"
import { axiosPostJson } from "../../../utilities/requests"

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
  // Function to send a POST request to /extraction/view
  const viewImage = () => {
    console.log("Viewing image for node " + id)

    // Construction of form data to send to /extraction/view. If the node is input, the name of the file is needed
    let formData
    if (type === "input") {
      formData = JSON.stringify({
        id: id,
        name: type,
        file_loaded: data.internal.settings.filepath
      })
    } else {
      formData = JSON.stringify({
        id: id,
        name: type
      })
    }

    // POST request to /extraction/view for current node by sending form_data
    axiosPostJson(formData, "extraction/view")
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.error("Error:", error)
        toast.warn("Could not view image.")
      })
  }

  return (
    <div className="test">
      <Button
        type="button"
        className="viewButton"
        onClick={viewImage}
        disabled={!data.internal.enableView}
      >
        <img
          src="../icon/extraction/eye.svg"
          className="viewImage"
          alt="View button"
        />
        View image
      </Button>
    </div>
  )
}

export default ViewButton
