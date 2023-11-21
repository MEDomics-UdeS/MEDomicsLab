import React, { useState } from "react"
import DatasetSelector from "./dataComponents/datasetSelector"
import ModulePage from "./moduleBasics/modulePage"
import { Accordion } from "react-bootstrap"
import MEDprofilesPrepareData from "../input/MEDprofiles/MEDprofilesPrepareData"
import MergeTool from "../input/mergeTool"
import GroupingTool from "../input/groupingTool"
import SimpleCleaningTool from "../input/simpleCleaningTool"
import HoldOutSetCreationTool from "../input/holdOutSetCreationTool"
import SubsetCreationTool from "../input/subsetCreationTool"

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
              <Accordion.Header>Simple cleaning tool</Accordion.Header>
              <Accordion.Body>
                <SimpleCleaningTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
              <Accordion.Header>Holdout set creation tool</Accordion.Header>
              <Accordion.Body>
                <HoldOutSetCreationTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="5">
              <Accordion.Header>Subset creation tool</Accordion.Header>
              <Accordion.Body>
                <SubsetCreationTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="6">
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
