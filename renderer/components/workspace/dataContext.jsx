import { React, createContext, useState } from "react"

/**
 * @typedef {React.Context} DataContext
 * @description A context object that provides global data and data request state to its children components.
 * @see https://reactjs.org/docs/context.html
 */
const DataContext = createContext(null)

/**
 * @typedef {React.FunctionComponent} DataContextProvider
 * @description A provider component that wraps its children components with the DataContext context object.
 * @param {Object} props - The props for the DataContextProvider component.
 * @param {Object} props.children - The children components to wrap with the DataContext context object.
 * @param {Object} props.globalData - The global data object to provide to the children components.
 * @param {Function} props.setGlobalData - The function to update the global data object.
 * @returns {JSX.Element} - The DataContextProvider component.
 */
function DataContextProvider({ children, globalData, setGlobalData }) {
  const [dataRequest, setDataRequest] = useState({})

  return (
    <>
      <DataContext.Provider
        value={{
          globalData,
          setGlobalData,
          dataRequest,
          setDataRequest
        }}
      >
        {children}
      </DataContext.Provider>
    </>
  )
}

export { DataContextProvider, DataContext }
