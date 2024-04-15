import React, { useCallback, useState, useContext, useMemo } from "react"
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
  // eslint-disable-next-line no-unused-vars
  const [uploadedFile, setUploadedFile] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [uploadProgress, setUploadProgress] = useState(0)

  const { workspace } = useContext(WorkspaceContext)

  let directoryPath = `${workspace.workingDirectory.path}/DATA`
  if (item !== undefined) {
    if (item.path !== undefined) {
      directoryPath = item.path
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

  async function myCustomFileGetter(event) {
    return await getDroppedOrSelectedFiles(event)
  }

  const onDrop = useCallback((acceptedFiles, fileRejections, event) => {
    console.log("event", event, acceptedFiles)
    event.stopPropagation()
    const reader = new FileReader()

    reader.onabort = () => console.log("file reading was aborted")
    reader.onerror = () => console.log("file reading failed")
    reader.onload = () => {
      acceptedFiles.forEach((file) => {
        console.log("file", file)
        if (file.fileObject) {
          let firstElements = splitStringAtTheLastSeparator(file.fullPath, "/")[0]
          console.log("HERE", file.fullPath, firstElements)
          MedDataObject.createFolderFromPath(`${directoryPath}/${firstElements}`)
          fs.copyFile(file.fileObject.path, `${directoryPath}/${file.fullPath}`, (err) => {
            if (err) {
              console.error("Error copying file:", err)
            } else {
              console.log("File copied successfully")
            }
          })
        }
      })
    }

    // read file contents
    acceptedFiles.forEach((file) => {
      if (file.fileObject) {
        reader.readAsBinaryString(file.fileObject)
        MedDataObject.updateWorkspaceDataObject()
      }
    })
  }, [])

  let acceptedFiles = undefined
  if (item !== undefined) {
    if (item.acceptedFiles !== undefined) {
      acceptedFiles = item.acceptedFiles
    }
  }

  /**
   * @description - This is the useDropzone hook that is used to create the dropzone component
   * @param {Object} onDrop - The function to be executed when a file is dropped in the dropzone
   * @param {Object} onDropRejected - The function to be executed when a file is dropped in the dropzone but is rejected
   * @param {Object} noClick - A boolean that indicates if the dropzone should not be clickable
   * @param {Object} accept - The file types that are accepted by the dropzone
   * @returns {JSX.Element}
   * @see SidebarDirectoryTreeControlled - "../../layout/sidebarTools/sidebarDirectoryTreeControlled.jsx" This component is used in the SidebarDirectoryTreeControlled component
   */
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    //getFilesFromEvent: (event) => myCustomFileGetter(event),
    onDrop,
    onDropRejected: useCallback((fileRejections) => {
      console.log("fileRejections", fileRejections)
      toast.error("Error: File type not accepted in this folder")
    }, []),
    noClick: props.noClick || false,
    accept: acceptedFiles ? acceptedFiles : undefined
  })

  // The style changes if the dropzone is focused, if the file is accepted or if the file is rejected
  const baseStyle = {
    display: "block",
    position: "relative",
    width: "100%",
    height: "100%",
    borderWidth: "0px"
  }

  const focusedStyle = {}

  const acceptStyle = {
    borderWidth: "2px",
    borderColor: "#00e676"
  }

  const rejectStyle = {
    borderWidth: "2px",
    borderColor: "#ff1744"
  }

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }),
    [isFocused, isDragAccept, isDragReject]
  )

  return (
    <div style={{ display: "block" }}>
      <div className="directory-tree-dropzone" {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {children}
      </div>
    </div>
  )
}
