import React from "react"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { SplitButton } from "primereact/splitbutton"
import { Message } from "primereact/message"

const BasicToolsDB = ({ numRows, setNumRows, handleAddRow, newColumnName, setNewColumnName, handleAddColumn, exportOptions, refreshData }) => {
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <Message severity="info" text={"The Basic Tools enable you to add rows and columns to a dataset, export the dataset, and refresh the data."} />
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
        <div style={{ display: "flex", marginLeft: "100px" }}>
          <InputText id="numRows" value={numRows} onChange={(e) => setNumRows(e.target.value)} style={{ width: "100px" }} placeholder="# of Rows" />
          <Button
            icon="pi pi-plus"
            onClick={handleAddRow}
            style={{
              width: "50px"
            }}
          />
        </div>
        <div style={{ display: "flex" }}>
          <InputText id="newColumnName" value={newColumnName} style={{ width: "130px" }} onChange={(e) => setNewColumnName(e.target.value)} placeholder="Column Name" />
          <Button
            icon="pi pi-plus"
            onClick={()=>handleAddColumn()}
            style={{
              width: "50px"
            }}
          />
        </div>
        <Button
          icon="pi pi-refresh"
          onClick={() => refreshData()}
          style={{
            width: "50px",
            padding: "5px"
          }}
          tooltip="Refresh the dataset"
          tooltipOptions={{ position: "top" }}
        />
        <SplitButton icon="pi pi-file-export" model={exportOptions} className="p-button-success" style={{ marginRight: "100px" }} tooltip="Export the dataset" tooltipOptions={{ position: "top" }} />
      </div>
    </>
  )
}

export default BasicToolsDB
