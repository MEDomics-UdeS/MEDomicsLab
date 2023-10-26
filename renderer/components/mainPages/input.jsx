import React, { useEffect, useContext, useState, use } from "react"
import DatasetSelector from "./dataComponents/datasetSelector"
import ModulePage from "./moduleBasics/modulePage"
// import { Accordion, AccordionTab } from "primereact/accordion"
import { Accordion } from "react-bootstrap"
import { DataContext } from "../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import { Stack } from "react-bootstrap"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { PlusSquare, PlusSquareFill, XSquare } from "react-bootstrap-icons"
import { PiPlusSquareFill } from "react-icons/pi"
import { auto } from "@popperjs/core"
import { MultiSelect } from "primereact/multiselect"
import MedDataObject from "../workspace/medDataObject"
import { Button } from "primereact/button"
import MergeTool from "../input/mergeTool"
import GroupingTool from "../input/groupingTool"
import HoldOutSetCreationTool from "../input/holdOutSetCreationTool"

/**
 * @description - This component is the input page of the application
 * @returns the input page component
 */
const InputPage = ({ pageId = "42", configPath = null }) => {
  // eslint-disable-next-line no-unused-vars
  const [activeIndex, setActiveIndex] = useState([0, 2])

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1>INPUT MODULE</h1>
        <div className="input-page">
          <Accordion className="card-accordion" defaultActiveKey={["0"]} alwaysOpen>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Dataset selector</Accordion.Header>
              <Accordion.Body>
                <DatasetSelector multiSelect={true} />
              </Accordion.Body>
            </Accordion.Item>
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
              <Accordion.Header>Holdout set creation tool</Accordion.Header>
              <Accordion.Body>
                <HoldOutSetCreationTool pageId={pageId} />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </ModulePage>
    </>
  )
}

export default InputPage
