import React, { useCallback, useState, useContext } from "react"
import { useDropzone } from "react-dropzone"
import fs from "fs"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import MedDataObject from "../../workspace/medDataObject"
import { toast } from "react-toastify"
import { getDroppedOrSelectedFiles } from "html5-file-selector"

/**
 * @typedef {React.FunctionComponent} DropzoneComponent
 * @description This component is the dropzone component that will be used to upload files to the workspace.
 * @params {Object} children - The children of the component
 * @summary This component is used to upload files to the workspace. It is used in the InputSidebar.
 * @todo Add the functionality to upload more file types than just CSV files
 */
export default function DropzoneComponent({ children, item = undefined, ...props }) {
  const [style, setStyle] = useState({
    display: "block",
    position: "relative",
    width: "100%",
    height: "100%",
    borderWidth: "0px"
  })

  const { workspace } = useContext(WorkspaceContext)

  let directoryPath = `${workspace.workingDirectory.path}/DATA`
  if (item !== undefined) {
    if (item.path !== undefined) {
      directoryPath = item.path
    }
  }

  let acceptedFiles = undefined
  if (item !== undefined) {
    if (item.acceptedFiles !== undefined) {
      acceptedFiles = item.acceptedFiles
    }
  }

  /**
   * Splits the provided `string` at the last occurrence of the provided `separator`.
   * @param {string} string - The string to split.
   * @param {string} separator - The separator to split the string at.
   * @returns {Array} - An array containing the first elements of the split string and the last element of the split string.
   */
  function splitStringAtTheLastSeparator(string, separator) {
    let splitString = string.split(separator)
    let lastElement = splitString.pop()
    let firstElements = splitString.join(separator)
    return [firstElements, lastElement]
  }

  /**
   * @description This function is used to get the fullPath of the dragged files, in order to know if we drag only file(s) or a folder
   * @param {Event} event
   * @returns A list of File Objects with fullPath property
   */
  async function myCustomFileGetter(event) {
    const fileObjects = []
    let files = await getDroppedOrSelectedFiles(event)
    files.forEach((file) => {
      let fileObject = file.fileObject
      Object.defineProperty(fileObject, "fullPath", { value: file.fullPath })
      fileObjects.push(fileObject)
    })
    return fileObjects
  }

  /**
   * @description The function to be executed when a file is dropped in the dropzone
   */
  const onDrop = useCallback((acceptedFiles) => {
    console.log("accepted files", acceptedFiles)

    if (acceptedFiles && acceptedFiles.length > 0) {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onabort = () => console.log("file reading was aborted")
        reader.onerror = () => console.log("file reading failed")
        let firstElements = splitStringAtTheLastSeparator(file.fullPath, "/")[0]
        MedDataObject.createFolderFromPath(`${directoryPath}/${firstElements}`)
        fs.copyFile(file.path, `${directoryPath}/${file.fullPath}`, (err) => {
          if (err) {
            console.error("Error copying file:", err)
          } else {
            console.log("File copied successfully")
          }
        })
      })
      MedDataObject.updateWorkspaceDataObject()
    }
    setStyle({ ...style, ...baseStyle })
  }, [])

  /**
   * @description The function to be executed when a file is dropped in the dropzone but is rejected
   */
  const onDropRejected = useCallback((fileRejections) => {
    console.log("fileRejections", fileRejections)
    fileRejections.forEach((rejection) => {
      if (rejection.file && rejection.file.name) {
        if (rejection.errors && rejection.errors.length > 0 && rejection.errors[0].message) {
          toast.error(rejection.file.name + " rejected: " + rejection.errors[0].message)
        } else {
          toast.error(rejection.file.name + " rejected: File type not accepted in this folder")
        }
      } else {
        toast.error("File type not accepted in this folder")
      }
    })
  }, [])

  /**
   * @description - This is the useDropzone hook that is used to create the dropzone component
   * @param {Object} onDrop - The function to be executed when a file is dropped in the dropzone
   * @param {Object} onDropRejected - The function to be executed when a file is dropped in the dropzone but is rejected
   * @param {Object} noClick - A boolean that indicates if the dropzone should not be clickable
   * @param {Object} accept - The file types that are accepted by the dropzone
   * @returns {JSX.Element}
   * @see SidebarDirectoryTreeControlled - "../../layout/sidebarTools/sidebarDirectoryTreeControlled.jsx" This component is used in the SidebarDirectoryTreeControlled component
   */
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDropRejected,
    getFilesFromEvent: (event) => myCustomFileGetter(event),
    noClick: props.noClick || false,
    accept: acceptedFiles ? acceptedFiles : undefined,
    noDragEventsBubbling: true
  })

  // The style changes if the dropzone is focused
  const baseStyle = {
    display: "block",
    position: "relative",
    width: "100%",
    height: "100%",
    borderWidth: "0px"
  }

  const focusStyle = {
    borderWidth: "2px",
    borderColor: "#FFFFFF"
  }

  // Event handler for dropzone hover
  const onDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setStyle({ ...style, ...focusStyle })
  }

  // Event handler for dropzone hover leave
  const onDragLeave = () => {
    setStyle({ ...style, ...baseStyle })
  }

  return (
    <div style={{ display: "block" }}>
      <div className="directory-tree-dropzone" {...getRootProps({ style })} onDragOver={onDragOver} onDragLeave={onDragLeave}>
        <input {...getInputProps()} />
        {children}
      </div>
    </div>
  )
}
