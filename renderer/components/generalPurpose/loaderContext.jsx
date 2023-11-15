import React, { createContext, useState } from "react"

// This context is used to store the flowResults (id and type of the workflow)
/**
 * @typedef {React.Context} LoaderContext
 * @description
 * @summary
 * @see
 */
const LoaderContext = createContext()

function LoaderProvider({ children }) {
  const [loader, setLoader] = useState(false) // Initial style

  return (
    <LoaderContext.Provider
      value={{
        loader,
        setLoader
      }}
    >
      {children}
    </LoaderContext.Provider>
  )
}

export { LoaderProvider, LoaderContext }
