import React, { createContext, useEffect, useState } from "react"
import { toast } from "react-toastify"

// This context is used to store the flowResults (id and type of the workflow)
/**
 * @typedef {React.Context} ErrorRequestContext
 * @description
 * @summary
 * @see
 */
const ErrorRequestContext = createContext()

/**
 * @typedef {React.FunctionComponent} ErrorRequestProvider
 * @param {*} children components that will use the context
 * @description This component is used to provide the ErrorRequestContext to the components that need it.
 * It is used to display errors that can occur during the execution of the workflow.
 * From python side, the errors are sent in the form of a dictionary with the following keys:
 * - toast: message to display in a toast
 * - message, stack_trace: message and stack trace to display in the error modal
 */
function ErrorRequestProvider({ children }) {
  const [error, setError] = useState({}) // Initial style
  const [showError, setShowError] = useState(false) // Initial state

  useEffect(() => {
    if (Object.keys(error).length !== 0) {
      if (error.toast) {
        toast.error(error.toast)
      } else {
        setShowError(true)
      }
    }
  }, [error])

  return (
    <ErrorRequestContext.Provider
      value={{
        error,
        setError,
        showError,
        setShowError
      }}
    >
      {children}
    </ErrorRequestContext.Provider>
  )
}

export { ErrorRequestContext, ErrorRequestProvider }
