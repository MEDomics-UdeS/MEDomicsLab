import React, { useState } from "react"
import ModulePage from "./moduleBasics/modulePage"
import { Accordion } from "react-bootstrap"
import MEDprofilesPrepareData from "../input/MEDprofiles/MEDprofilesPrepareData"
import MergeTool from "../input/mergeTool"
import GroupingTool from "../input/groupingTool"
import SimpleCleaningTool from "../input/simpleCleaningTool"
import HoldOutSetCreationTool from "../input/holdOutSetCreationTool"
import SubsetCreationTool from "../input/subsetCreationTool"
import FeatureReductionTool from "../input/featuresReduction/featuresReductionTool"
import AddDeleteColumnsTool from "../input/addDeleteColumnsTool"
/**
 * @description - This component is the input page of the application
 * @returns the input page component
 */
const InputPage = ({ pageId = "42", configPath = null }) => {
  // eslint-disable-next-line no-unused-vars
  const [activeIndex, setActiveIndex] = useState([0, 2])

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} shadow>
        <h1>INPUT MODULE</h1>
        <div className="input-page">
          <Accordion className="card-accordion" defaultActiveKey={["1"]} alwaysOpen>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Merge tool</Accordion.Header>
              <Accordion.Body>
                <MergeTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Grouping/Tagging tool</Accordion.Header>
              <Accordion.Body>
                <GroupingTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>Simple Cleaning tool</Accordion.Header>
              <Accordion.Body>
                <SimpleCleaningTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
              <Accordion.Header>Holdout Set Creation tool</Accordion.Header>
              <Accordion.Body>
                <HoldOutSetCreationTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="5">
              <Accordion.Header>Subset Creation tool</Accordion.Header>
              <Accordion.Body>
                <SubsetCreationTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="6">
              <Accordion.Header>Add/Delete Columns</Accordion.Header>
              <Accordion.Body>
                <AddDeleteColumnsTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="7">
              <Accordion.Header>Feature Reduction tool</Accordion.Header>
              <Accordion.Body>
                <FeatureReductionTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="8">
              <Accordion.Header>MEDprofiles</Accordion.Header>
              <Accordion.Body>
                <MEDprofilesPrepareData />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </ModulePage>
    </>
  )
}

export default InputPage
