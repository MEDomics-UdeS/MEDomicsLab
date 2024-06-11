import React from "react"
import { MultiSelect } from "primereact/multiselect"
import { SplitButton } from "primereact/splitbutton"
import { Button } from "primereact/button"

const TransformColumnTools = ({ selectedColumns, setSelectedColumns, columns, transformData, handleFileUpload, handleCsvData, handleExportColumns, handleDeleteColumns }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", margin: "5px" }}>
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
          style={{ marginRight: "10px", width: "200px" }}
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
            width: "150px",
            marginRight: "40px"
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", margin: "5px" }}>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <Button
          label="Import Columns"
          onClick={handleCsvData}
          className="p-button-success"
          style={{
            width: "150px",
            marginRight: "10px"
          }}
        />
        <Button
          label="Export Columns"
          onClick={handleExportColumns}
          className="p-button-success"
          style={{
            width: "150px",
            marginRight: "10px"
          }}
        />
        <Button
          label="Delete Columns"
          onClick={handleDeleteColumns}
          className="p-button-danger"
          style={{
            width: "150px",
            marginRight: "10px"
          }}
        />
      </div>
    </div>
  )
}

export default TransformColumnTools
