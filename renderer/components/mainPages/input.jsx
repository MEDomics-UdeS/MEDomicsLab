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
import { PlusSquare, PlusSquareFill } from "react-bootstrap-icons"
import { PiPlusSquareFill } from "react-icons/pi"
import { auto } from "@popperjs/core"

/**
 * @description - This component is the input page of the application
 * @returns the input page component
 */
const InputPage = ({ pageId = "42", configPath = null }) => {
  // eslint-disable-next-line no-unused-vars
  const [data, setData] = useState([])
  const [activeIndex, setActiveIndex] = useState([0, 2])
  const [listOfDatasets, setListOfDatasets] = useState([])
  const [dictOfDatasets, setDictOfDatasets] = useState({})
  const { globalData } = useContext(DataContext)
  const [datasetSelector, setDatasetSelector] = useState(null)
  const [firstSelectedDataset, setFirstSelectedDataset] = useState(null)

  const updateListOfDatasets = () => {
    let newDatasetList = []
    Object.keys(globalData).forEach((key) => {
      if (globalData[key].extension === "csv") {
        newDatasetList.push({ name: globalData[key].name, object: globalData[key], key: key })
      }
    })
    setListOfDatasets(newDatasetList)
  }

  const selectorElementWithoutSpecificDataset = (index) => {
    let alreadySelectedDatasets = Object.entries(dictOfDatasets).map((arr, i) => {
      if (i !== index) return arr[1]["_UUID"]
    })
    let options = listOfDatasets.filter((dataset) => !alreadySelectedDatasets.includes(dataset.key))
    let dropdown = (
      <Dropdown
        style={{ width: "100%" }}
        options={options}
        optionLabel="name"
        optionValue="key"
        placeholder="Select a dataset"
        value={dictOfDatasets[index] ? dictOfDatasets[index].getUUID() : null}
        onChange={(e) => {
          let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
          console.log("e", e.target.value, index)
          newDictOfDatasets[index] = globalData[e.target.value]
          console.log("newDictOfDatasets", newDictOfDatasets)
          setDictOfDatasets(newDictOfDatasets)
        }}
      />
    )
    return (
      <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center" }} md={4}>
        {dropdown}
      </Col>
    )
  }

  const updateDatasetSelectorElement = (exceptedDatasets) => {
    let newDatasetSelector = <></>
    // setDatasetSelector(newDatasetSelector)
  }

  useEffect(() => {
    console.log("firstSelectedDataset", firstSelectedDataset)
  }, [firstSelectedDataset])

  useEffect(() => {
    console.log("listOfDatasets", listOfDatasets)
  }, [listOfDatasets])

  useEffect(() => {
    if (globalData !== null) {
      updateListOfDatasets()
      updateDatasetSelectorElement()
    }
  }, [globalData])

  useEffect(() => {
    console.log("dictOfDatasets", dictOfDatasets)
  }, [dictOfDatasets])

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1>INPUT MODULE</h1>
        <Accordion multiple activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <AccordionTab header="Dataset Selector">
            <DatasetSelector multiSelect={true} />
          </AccordionTab>
          <AccordionTab header="Merge Tool">
            {/* <Stack className="justify-content-center" direction="horizontal" gap={3}>
              <h4>1</h4> */}
            <Row className="justify-content-center">
              <Col md={4} style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "center", justifyContent: "center" }}>
                <h6 style={{ padding: ".25rem", margin: "0rem" }}>Main dataset</h6>
                <Dropdown
                  label="Select the first dataset"
                  placeholder="First dataset"
                  value={firstSelectedDataset ? firstSelectedDataset.getUUID() : null}
                  options={listOfDatasets}
                  optionLabel="name"
                  optionValue="key"
                  style={{ width: "100%" }}
                  onChange={(e) => {
                    // console.log("e", e.target.value)
                    setFirstSelectedDataset(globalData[e.target.value])
                    let newDictOfDatasets = dictOfDatasets ? dictOfDatasets : {}
                    newDictOfDatasets[0] = globalData[e.target.value]
                  }}
                />
              </Col>
              {firstSelectedDataset !== null && (
                <>
                  {selectorElementWithoutSpecificDataset(1)} {datasetSelector}
                </>
              )}

              <Col style={{ display: "flex", justifyContent: "center", flexGrow: 0, alignItems: "center" }} xs>
                <a
                  onClick={(e) => {
                    let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                    let length = Object.keys(newDictOfDatasets).length
                    let newDatasetSelector = (
                      <>
                        {datasetSelector}
                        {selectorElementWithoutSpecificDataset(length)}
                      </>
                    )
                    setDatasetSelector(newDatasetSelector)
                  }}
                  style={{ marginLeft: "1rem", display: "flex", flexDirection: "row", flexGrow: "-moz-initial" }}
                >
                  <PlusSquare size={35} />
                </a>
              </Col>
            </Row>
            {/* </Stack> */}
          </AccordionTab>
        </Accordion>
      </ModulePage>
    </>
  )
}

export default InputPage
