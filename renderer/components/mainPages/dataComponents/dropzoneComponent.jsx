import React, { useCallback, useState, useContext } from "react"
import { useDropzone } from "react-dropzone"
import { parse } from "csv"
import fs from "fs"
import { WorkspaceContext } from "../../workspace/workspaceContext"

/**
 * @typedef {React.FunctionComponent} DropzoneComponent
 * @description This component is the dropzone component that will be used to upload files to the workspace.
 * @params {Object} children - The children of the component
 * @summary This component is used to upload files to the workspace. It is used in the InputSidebar.
 *
 * @todo Add the functionality to upload more file types than just CSV files
 */
export default function DropzoneComponent({ children }) {
  // eslint-disable-next-line no-unused-vars
  const [uploadedFile, setUploadedFile] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [uploadProgress, setUploadProgress] = useState(0)

  // Retrieve the Workspace context from the WorkspaceProvider
  const { workspace } = useContext(WorkspaceContext)
  const onDrop = useCallback((acceptedFiles) => {
    const reader = new FileReader()

    reader.onabort = () => console.log("file reading was aborted")
    reader.onerror = () => console.log("file reading failed")
    reader.onload = () => {
      // Parse CSV file
      acceptedFiles.forEach((file) => {
        console.log("file", file)
        if (file.name.includes(".csv")) {
          parse(reader.result, (err, data) => {
            console.log("Parsed CSV data: ", data)

            fs.writeFile(
              `${workspace.workingDirectory.path}/DATA/${file["name"]}`,
              data.join("\n"),
              "utf8",
              (err) => {
                if (err) {
                  console.error("Error writing file:", err)
                } else {
                  console.log("File written successfully")
                }
              }
            )
          })
        } else if (file.name.includes(".xlsx")) {
          console.log("xlsx file")
        }
      })
    }

    // read file contents
    acceptedFiles.forEach((file) => reader.readAsBinaryString(file))
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  /**
   * @description - This function handles the download of the file
   * @todo Implement this function
   */
  const handleDownload = () => {}

  return (
    <div style={{ display: "block" }}>
      <div {...getRootProps()} style={{ display: "grid" }}>
        <input {...getInputProps()} />
        {children}
      </div>
      {uploadedFile && (
        <div>
          <p>File uploaded: {uploadedFile}</p>
          <button onClick={handleDownload}>Download File</button>
        </div>
      )}
      {uploadProgress > 0 && (
        <div>
          <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>
          <progress max="100" value={uploadProgress}></progress>
        </div>
      )}
    </div>
  )
}
