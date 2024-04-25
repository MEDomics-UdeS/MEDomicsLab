import React, { useContext, useState } from "react"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import ProgressBarRequests from "../generalPurpose/progressBarRequests"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { requestBackend } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import { toast } from "react-toastify"
/**
 * @returns the MED3paHelloWorldPanel 
 */
const MED3paHelloWorldPanel = () => {
  const { pageId } = useContext(PageInfosContext) // we get the pageId to send to the server
  const [progressValue, setProgressValue] = useState({now:0, currentLabel:""}) // we use this to store the progress value 
  const [isUpdating, setIsUpdating] = useState(false) // we use this to store the progress value 
  const { port } = useContext(WorkspaceContext) // The port 
  const { setError } = useContext(ErrorRequestContext) // We get the setError function from the context

  const [stringToSend, setStringToSend] = useState("Hello World from MED3pa frontend") // The string to send to the backend
  const [stringReceived, setStringReceived] = useState("") // The string received from the backend

  /**
   * @description This function sends the string to the backend
   * @returns {void}
   */
  const sendString = () => {
    let JSONToSend = {
      stringFromFrontend: stringToSend
    }
    setIsUpdating(true)

    requestBackend(
      // Send the request
      port,
      "/med3pa/hello_world/" + pageId,
      JSONToSend,
      (jsonResponse) => {
        if (jsonResponse.error) {
          if (typeof jsonResponse.error == "string") {
            jsonResponse.error = JSON.parse(jsonResponse.error)
          }
          setError(jsonResponse.error)
        } else {
          setIsUpdating(false) // Set the isUpdating to false
          console.log("jsonResponse", jsonResponse)
          setProgressValue({ now: 100, currentLabel: jsonResponse["data"] }) // Set the progress value to 100 and show the message that the backend received from the frontend
          setStringReceived(jsonResponse["stringFromBackend"]) // Set the string received from the backend
        }
      },
      function (error) {
        setIsUpdating(false)
        setProgressValue({ now: 0, currentLabel: "Message sending failed ❌" })
        toast.error("Sending failed", error)
      }
    )
  }


  return (
    <div>
      <h5>This is the MED3pa Hello World Panel</h5>
      <div className="p-inputgroup flex-1 w-100" style={{ display: "flex", justifyContent: "center", alignItems: "center", maxWidth: "500px", marginTop:"1.25rem"}}>
      <span className="p-float-label">
        <InputText id="MED3pa-input" value={stringToSend} onChange={(e) => setStringToSend(e.target.value)} />
        <label htmlFor="MED3pa-input">Enter a string to send to the backend</label>
      </span>
        <Button icon="pi pi-send" onClick={sendString} />
      </div>

      

      {!isUpdating && progressValue.now != 100 ? (
        <></>
      ) : (
        <>
          <h5>Received response from backend: </h5>
          <div>
            {stringReceived}
          </div>
        <ProgressBarRequests isUpdating={isUpdating} setIsUpdating={setIsUpdating} progress={progressValue} setProgress={setProgressValue} requestTopic={"med3pa/progress/" + pageId} delayMS={100}  />
        </>
      )}
    </div>
  )
}

export default MED3paHelloWorldPanel
