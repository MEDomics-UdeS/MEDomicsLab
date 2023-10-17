import React, { useEffect, useContext, useState, use } from "react"
import DatasetSelector from "./dataComponents/datasetSelector"
import ModulePage from "./moduleBasics/modulePage"
import { Accordion, AccordionTab } from "primereact/accordion"
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
          <Accordion multiple activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            <AccordionTab header="Dataset Selector">
              <DatasetSelector multiSelect={true} />
            </AccordionTab>
            <AccordionTab header="Merge Tool">
              <MergeTool pageId={pageId} />
            </AccordionTab>
            <AccordionTab header="Grouping Tool">
              <GroupingTool pageId={pageId} />
            </AccordionTab>
          </Accordion>
        </div>
      </ModulePage>
    </>
  )
}

export default InputPage
