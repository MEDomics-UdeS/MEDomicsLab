import React, { useContext } from "react"
import { ErrorRequestContext } from "../generalPurpose/errorRequestContext"
import { Dialog } from "primereact/dialog"
import { Button } from "primereact/button"
import { Row, Col } from "react-bootstrap"
import { toast } from "react-toastify"

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
            <Button label="Ok" icon="pi pi-check" onClick={() => setShowError(false)} autoFocus />
          </div>
        }
      >
        <Row className="error-dialog-header">
          <Col md="auto">
            <h5>{error.message && error.message[0].toUpperCase() + error.message.slice(1)}</h5>
          </Col>
          <Col>
            <Button
              icon="pi pi-copy"
              rounded
              text
              severity="secondary"
              onClick={() => {
                navigator.clipboard.writeText(error.message && error.message)
                toast.success("Copied to clipboard")
              }}
            />
          </Col>
        </Row>
        <pre>{error.stack_trace && error.stack_trace}</pre>
      </Dialog>
    </>
  )
}

export default ErrorRequestDialog
