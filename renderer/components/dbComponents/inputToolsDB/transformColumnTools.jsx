import React from "react"
import { MultiSelect } from "primereact/multiselect"
import { SplitButton } from "primereact/splitbutton"
import { Button } from "primereact/button"

const TransformColumnTools = ({ selectedColumns, setSelectedColumns, columns, transformData, handleFileUpload, handleCsvData, handleExportColumns, handleDeleteColumns }) => {
  return (
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
            command: () => transformData("Binary")
          },
          {
            label: "Non-empty",
            command: () => transformData("Non-empty")
          }
        ]}
        className="p-button-success"
        style={{
          width: "auto",
          marginRight: "5px"
        }}
      />
      <Button
        icon="pi pi-upload"
        onClick={handleCsvData}
        className="p-button-success"
        style={{
          width: "50px",
          marginRight: "3px"
        }}
      />
      <Button
        icon="pi pi-download"
        onClick={handleExportColumns}
        className="p-button-success"
        style={{
          width: "50px",
          marginRight: "2px"
        }}
      />
      <Button
        icon="pi pi-trash"
        onClick={handleDeleteColumns}
        className="p-button-danger"
        style={{
          width: "50px",
          marginRight: "2px"
        }}
      />
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  )
}

export default TransformColumnTools
