import { React, createContext, useState } from "react"

/**
 * @typedef {React.Context} WorkspaceContext
 * @description
 * @summary
 * @see
 */
export const WorkspaceContext = createContext(null)

/**
 * @typedef {React.FunctionComponent} WorkspaceProvider
 * @description This component provides the context for the workspace. It will provide the workspace object and the setWorkspace function to the children.
 * @params {Object} children -
 * @params {Object} workspaceObject -
 * @summary The workspace object is the object that contains the workspace information. It is an object that contains the following properties:'hasBeenSet' and 'workspaceObject'.
 *          The 'hasBeenSet' property is a boolean that indicates if the workspace has been set. The 'workspaceObject' property is the workspace containing information about all the files and folders in the workspace.
 */
export default function WorkspaceProvider({
  workspace,
  setWorkspace,
  port,
  setPort,
  children
}) {
  return (
    <>
      <WorkspaceContext.Provider
        value={{ workspace, setWorkspace, port, setPort }}
      >
        {children}
      </WorkspaceContext.Provider>
    </>
  )
}
