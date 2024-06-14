import React, { useState } from "react"
import { MultiSelect } from "primereact/multiselect"
import { SplitButton } from "primereact/splitbutton"
import { Button } from "primereact/button"
import { Message } from "primereact/message"
import { toast } from "react-toastify"

const TransformColumnToolsDB = ({ fileName, setFileName, selectedColumns, setSelectedColumns, columns, transformData, handleFileUpload, handleExportColumns, handleDeleteColumns }) => {
  const [isHovered, setIsHovered] = useState(false)
  const customFileUpload = {
    padding: "6px 12px",
    cursor: "pointer",
    backgroundColor: isHovered ? "grey" : "darkgrey",
    color: "white",
    border: "none",
    borderRadius: "4px"
  }

  const handleFileUploadUpdated = (event) => {
    handleFileUpload(event)

    if (event.target.files.length > 0) {
      setFileName(event.target.files[0].name)
    }
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <Message
          severity="info"
          text="The Transform Columns Tools provide functionalities to alter dataset columns. This includes converting selected columns to binary, replacing empty cells with zeros, and facilitating the import and export of column lists."
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "2px",
          flexWrap: "wrap"
        }}
      >
        <MultiSelect
          value={selectedColumns}
          options={columns
            .filter((column) => column.header !== null)
            .map((column) => ({
              label: column.header,
              value: column.field
            }))}
          onChange={(e) => setSelectedColumns(e.value)}
          placeholder="Select Columns"
          style={{ marginRight: "5px", width: "200px" }}
        />
        <SplitButton
          label="Transform"
          model={[
            {
              label: "Binary",
              command: () => {
                if (selectedColumns.length > 0) {
                  transformData("Binary")
                } else {
                  toast.warn("No columns selected for transformation")
                }
              }
            },
            {
              label: "Non-empty",
              command: () => {
                if (selectedColumns.length > 0) {
                  transformData("Non-empty")
                } else {
                  toast.warn("No columns selected for transformation")
                }
              }
            }
          ]}
          className="p-button-success"
          style={{
            width: "auto",
            marginRight: "5px"
          }}
          tooltip="Transform selected columns"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-file-export"
          onClick={handleExportColumns}
          className="p-button-success"
          style={{
            width: "50px",
            marginRight: "2px"
          }}
          tooltip="Export selected columns"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          onClick={handleDeleteColumns}
          className="p-button-danger"
          style={{
            width: "50px",
            marginRight: "2px"
          }}
          tooltip="Delete selected columns"
          tooltipOptions={{ position: "top" }}
        />
        <label htmlFor="fileUpload" style={customFileUpload} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {fileName}
        </label>
        <input id="fileUpload" type="file" accept=".csv" onChange={handleFileUploadUpdated} style={{ display: "none" }} />
      </div>
    </>
  )
}

export default TransformColumnToolsDB
