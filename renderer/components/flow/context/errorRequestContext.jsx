import React, { createContext, useState } from "react"

// This context is used to store the flowResults (id and type of the workflow)
const ErrorRequestContext = createContext()

/**
 *
 * @param {*} children components that will use the context
 * @description This component is used to provide the flowResults context to all the components that need it.
 */
function ErrorRequestProvider({ children }) {
  const [error, setError] = useState({}) // Initial style
  const [showError, setShowError] = useState(false) // Initial state

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
