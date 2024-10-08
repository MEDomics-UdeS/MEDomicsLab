import { Panel } from "primereact/panel"
import BasicToolsDB from "./inputToolsDB/basicToolsDB"
import TransformColumnToolsDB from "./inputToolsDB/transformColumnToolsDB"
import MergeToolsDB from "./inputToolsDB/mergeToolsDB"
import SimpleCleaningToolsDB from "./inputToolsDB/simpleCleaningToolsDB"
import HoldoutSetCreationToolsDB from "./inputToolsDB/holdoutSetCreationToolsDB"
import SubsetCreationToolsDB from "./inputToolsDB/subsetCreationToolsDB"
import FeatureReductionToolsDB from "./inputToolsDB/featureReductionToolsDB/featureReductionToolsDB"
import GroupingTaggingToolsDB from "./inputToolsDB/groupingTaggingToolsDB"
import MEDprofilesPrepareData from "../input/MEDprofiles/MEDprofilesPrepareData"
import ModulePage from "../mainPages/moduleBasics/modulePage"

/**
 * @description
 * This component provides calls all the other components to build the input tools.
 * @param {Object} props
 * @param {Object} props.data - Data object
 * @param {Object[]} props.exportOptions - Export options
 * @param {Function} props.refreshData - Function to refresh the data
 * @param {Object[]} props.columns - Columns
 * @param {Function} props.transformData - Function to transform the data
 * @param {Object[]} props.innerData - Inner data
 * @param {Object} props.lastEdit - Last edit
 */
const InputToolsComponent = ({ data, exportOptions, refreshData, columns, transformData, innerData, lastEdit }) => {
  const panelContainerStyle = {
    height: "100%",
    overflow: "auto"
  }

  return (
    <div style={panelContainerStyle}>
      <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
        <h1>Database Input Tools</h1>
      </div>
      <Panel header="Basic Tools" toggleable collapsed={true}>
        <BasicToolsDB exportOptions={exportOptions} refreshData={refreshData} currentCollection={data.id} />
      </Panel>
      <Panel header="Transform Column Tools" toggleable collapsed={true}>
        <TransformColumnToolsDB columns={columns} transformData={transformData} currentCollection={data.id} refreshData={refreshData} />
      </Panel>
      <Panel header="Merge Tools" toggleable collapsed={true}>
        <MergeToolsDB refreshData={refreshData} currentCollection={data.id} />
      </Panel>
      <Panel header="Simple Cleaning Tools" toggleable collapsed={true}>
        <SimpleCleaningToolsDB refreshData={refreshData} lastEdit={lastEdit} data={innerData} columns={columns} currentCollection={data.id} />
      </Panel>
      <Panel header="Holdout Set Creation Tools" toggleable collapsed={true}>
        <HoldoutSetCreationToolsDB refreshData={refreshData} data={innerData} currentCollection={data.id} />
      </Panel>
      <Panel header="Subset Creation Tools" toggleable collapsed={true}>
        <SubsetCreationToolsDB currentCollection={data.id} data={innerData} refreshData={refreshData} />
      </Panel>
      <Panel header="Feature Reduction Tools" toggleable collapsed={true}>
        <FeatureReductionToolsDB data={data} refreshData={refreshData} />
      </Panel>
      <Panel header="Grouping/Tagging Tools" toggleable collapsed={true}>
        <GroupingTaggingToolsDB refreshData={refreshData} />
      </Panel>
      <Panel header="MEDprofiles" toggleable collapsed={true}>
        <ModulePage>
            <MEDprofilesPrepareData />
        </ModulePage>

      </Panel>
    </div>
  )
}

export default InputToolsComponent
