import React, { useState } from "react"
import DropzoneComponent from "../mainPages/dataComponents/dropzoneComponent2"
import DataTableWrapper from "../dataTypeVisualisation/dataTableWrapper"
import { Button } from "react-bootstrap"

const ExtractionTSCanvas = () => {
  const [displayData, setDisplayData] = useState([])

  const onUpload = (data) => {
    console.log("onUpload", data)
    setDisplayData(data)
  }

  return (
    <div>
      <h1>Extraction - Time Series</h1>

      <DropzoneComponent whenUploaded={onUpload}>
        <Button style={{ alignItems: "flex-end", marginInline: "2%" }}>
          Import a CSV file
        </Button>
      </DropzoneComponent>

      {/* Display imported data */}
      {displayData.length > 0 && (
        <div>
          <h2>Imported data</h2>
          {/* DataTableWrapper is used to display the data */}
          <DataTableWrapper
            data={displayData}
            tablePropsData={{
              paginator: true,
              rows: 10,
              scrollable: true,
              scrollHeight: "400px"
            }}
            tablePropsColumn={{
              sortable: true
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ExtractionTSCanvas
