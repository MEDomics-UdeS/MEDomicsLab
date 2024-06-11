import React from "react"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { SplitButton } from "primereact/splitbutton"

const BasicTools = ({ numRows, setNumRows, handleAddRow, newColumnName, setNewColumnName, handleAddColumn, exportOptions, refreshData }) => {
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
        <InputText id="numRows" value={numRows} onChange={(e) => setNumRows(e.target.value)} style={{ marginRight: "10px", width: "100px" }} placeholder="# of Rows" />
        <Button
          label="Add"
          onClick={handleAddRow}
          style={{
            width: "100px",
            marginRight: "40px"
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", margin: "5px" }}>
        <InputText id="newColumnName" value={newColumnName} style={{ marginRight: "10px", width: "130px" }} onChange={(e) => setNewColumnName(e.target.value)} placeholder="Column Name" />
        <Button
          label="Add"
          onClick={handleAddColumn}
          style={{
            width: "100px",
            marginRight: "40px"
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", margin: "5px" }}>
        <SplitButton label="Export DB" model={exportOptions} className="p-button-success" />
        <Button
          icon="pi pi-refresh"
          onClick={() => refreshData()}
          style={{
            width: "50px",
            padding: "5px",
            marginLeft: "50px",
            backgroundColor: "green",
            borderColor: "green"
          }}
        />
      </div>
    </div>
  )
}

export default BasicTools
