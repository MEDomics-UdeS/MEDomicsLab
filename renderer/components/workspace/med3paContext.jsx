// MED3paContext.js
import React, { createContext, useContext, useState } from "react"

/**
 * @typedef {React.Context} MED3paContext
 * @description A context object that provides global data and data manipulation functions to its children components.
 * @see https://reactjs.org/docs/context.html
 */
const MED3paContext = createContext()

/**
 * @typedef {React.FunctionComponent} MED3paContextProvider
 * @description A provider component that wraps its children components with the MED3paContext context object.
 * @param {Object} props - The props for the MED3paContextProvider component.
 * @param {Object} props.children - The children components to wrap with the MED3paContext context object.
 * @returns {JSX.Element} - The MED3paContextProvider component.
 */
export const MED3paContextProvider = ({ children }) => {
  const [med3paData, setData] = useState({})

  /**
   * @function addPaData
   * @description Adds new data to the global data array.
   * @param {any} newData - The new data to add.
   */
  const addPaData = (newData) => {
    setData(newData)
  }

  return <MED3paContext.Provider value={{ med3paData, addPaData }}>{children}</MED3paContext.Provider>
}

/**
 * @typedef {Function} useMED3paContext
 * @description A custom hook to consume the MEDflContext within functional components.
 * @returns {Object} - An object containing the global data array and the addData function.
 */
export const useMED3paContext = () => {
  const context = useContext(MED3paContext)
  if (!context) {
    throw new Error("useMED3paContext must be used within a MED3paContextProvider")
  }
  return context
}
