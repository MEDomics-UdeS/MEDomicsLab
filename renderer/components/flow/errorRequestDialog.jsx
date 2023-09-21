import React, { useContext } from "react"
import { ErrorRequestContext } from "./context/errorRequestContext"
import { Dialog } from "primereact/dialog"
import { Button } from "primereact/button"

/**
 * 
 * @returns {JSX.Element} 
 * This component is used to display the error dialog when an error occurs during the execution of the flow
 * 
 * To use: 
 * 1. Import the ErrorRequestContext in the component
 * 2. Use the context member setError to set the error
 */
const ErrorRequestDialog = () => {
  const { error, showError, setShowError } = useContext(ErrorRequestContext) // used to get the flow infos

  return (
    <>
      <Dialog
        header="Error occured during execution"
        visible={showError}
        style={{ width: "70vw" }}
        onHide={() => setShowError(false)}
        footer={
          <div>
            <Button
              label="Ok"
              icon="pi pi-check"
              onClick={() => setShowError(false)}
              autoFocus
            />
          </div>
        }
      >
        <h5>{error.message && error.message}</h5>
        <pre>{error.stack_trace && error.stack_trace}</pre>
      </Dialog>
    </>
  )
}

export default ErrorRequestDialog
