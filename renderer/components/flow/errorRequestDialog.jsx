import React, { useContext } from "react"
import { ErrorRequestContext } from "./context/errorRequestContext"
import { Dialog } from "primereact/dialog"
import { Button } from "primereact/button"

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
