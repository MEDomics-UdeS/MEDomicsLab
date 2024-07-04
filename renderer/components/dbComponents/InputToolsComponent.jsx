import React, { useContext, useEffect } from "react"
import { Panel } from "primereact/panel"
import BasicToolsDB from "./inputToolsDB/basicToolsDB"
import TransformColumnToolsDB from "./inputToolsDB/transformColumnToolsDB"
import MergeToolsDB from "./inputToolsDB/mergeToolsDB"
import SimpleCleaningToolsDB from "./inputToolsDB/simpleCleaningToolsDB"
import HoldoutSetCreationToolsDB from "./inputToolsDB/holdoutSetCreationToolsDB"
import SubsetCreationToolsDB from "./inputToolsDB/subsetCreationToolsDB"
import FeatureReductionToolsDB from "./inputToolsDB/featureReductionToolsDB/featureReductionToolsDB"

const InputToolsComponent = ({
  DBData,
  data,
  exportOptions,
  refreshData,
  selectedColumns,
  setSelectedColumns,
  columns,
  transformData,
  handleFileUpload,
  fileName,
  setFileName,
  handleCsvData,
  handleExportColumns,
  handleDeleteColumns,
  innerData,
  DB,
  lastEdit
}) => {
  const panelContainerStyle = {
    height: "100%",
    overflow: "auto"
  }
  return (
    <div style={panelContainerStyle}>
      <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
        <h1>Database Input Tools</h1> {/* Title now wrapped for additional styling */}
      </div>
      <Panel header="Basic Tools" toggleable collapsed={true}>
        <BasicToolsDB exportOptions={exportOptions} refreshData={refreshData} DB={DB} DBData={DBData} currentCollection={data.uuid} />
      </Panel>
      <Panel header="Transform Column Tools" toggleable collapsed={true}>
        <TransformColumnToolsDB
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          columns={columns}
          transformData={transformData}
          handleFileUpload={handleFileUpload}
          fileName={fileName}
          setFileName={setFileName}
          handleCsvData={handleCsvData}
          handleExportColumns={handleExportColumns}
          handleDeleteColumns={handleDeleteColumns}
        />
      </Panel>
      <Panel header="Merge Tools" toggleable collapsed={true}>
        <MergeToolsDB data={innerData} columns={Array.from(columns)} DB={DB} collections={DBData} currentCollection={data.uuid} />
      </Panel>
      <Panel header="Simple Cleaning Tools" toggleable collapsed={true}>
        <SimpleCleaningToolsDB refreshData={refreshData} lastEdit={lastEdit} data={innerData} columns={columns} DB={DB} collections={DBData} currentCollection={data.uuid} />
      </Panel>
      <Panel header="Holdout Set Creation Tools" toggleable collapsed={true}>
        <HoldoutSetCreationToolsDB refreshData={refreshData} DB={DB} data={innerData} collections={DBData} currentCollection={data.uuid} />
      </Panel>
      <Panel header="Subset Creation Tools" toggleable collapsed={true}>
        <SubsetCreationToolsDB DB={DB} currentCollection={data.uuid} data={innerData} refreshData={refreshData} />
      </Panel>
      <Panel header="Feature Reduction Tools" toggleable collapsed={true}>
        <FeatureReductionToolsDB currentCollection={data.uuid} DB={DB} refreshData={refreshData} DBData={DBData} />
      </Panel>
    </div>
  )
}

export default InputToolsComponent
