import React, { useState, useEffect, useRef } from "react"
import { Accordion, AccordionTab } from "primereact/accordion"
import { ScrollPanel } from "primereact/scrollpanel"
import { Col, Row } from "react-bootstrap"
import Parameters from "./parameters"
import DataTable from "../../../dataTypeVisualisation/dataTableWrapper"
import { Column } from "primereact/column"
import { getId } from "../../../../utilities/staticFunctions"
import { OverlayPanel } from "primereact/overlaypanel"
import { Button } from "primereact/button"
import { Tooltip } from "primereact/tooltip"
import { InputText } from "primereact/inputtext"

const ModelsResults = ({ selectedResults }) => {
  const [models, setModels] = useState([])
  const [allModelsData, setAllModelsData] = useState([])
  const op = useRef(null)

  useEffect(() => {
    let models = []
    if (selectedResults.logs.models) {
      Object.keys(selectedResults.logs.models).forEach((key) => {
        models.push(
          Object.assign(selectedResults.logs.models[key], {
            name: key.substring(key.indexOf("-") + 1)
          })
        )
      })
    }
    console.log("models", models)
    setModels(models)
  }, [selectedResults])

  useEffect(() => {
    let allModelsData = []
    if (models.length > 0) {
      models.forEach((model) => {
        let modifiedRow = model.metrics[0]
        modifiedRow["Parameters"] = model.params[0]
        modifiedRow["Name"] = model.name
        allModelsData.push(modifiedRow)
      })
    }
    console.log("allModelsData", allModelsData)
    setAllModelsData(allModelsData)
  }, [models])

  const paramsBodyTemplate = (rowData) => {
    return (
      <>
        {/* <OverlayPanel ref={op}>
          <Parameters
            params={rowData.Parameters}
            tableProps={{
              size: "small"
            }}
            columnNames={["Parameter", "Value"]}
          />
        </OverlayPanel> */}
        <Tooltip
          target={".parameterstarget" + rowData.Name.replaceAll(" ", "")}
        >
          <Parameters
            params={rowData.Parameters}
            tableProps={{
              size: "small"
            }}
            columnNames={["Parameter", "Value"]}
          />
        </Tooltip>
        <Button
          type="button"
          icon="pi pi-image"
          className={"parameterstarget" + rowData.Name.replaceAll(" ", "")}
          tooltipOptions={{ position: "left" }}
          label="Image"
          onClick={(e) => op.current.toggle(e)}
        />
        {/* <InputText
          type="text"
          placeholder="Top"
          tooltip="Enter your username"
          tooltipOptions={{ position: "top" }}
        /> */}
        {/* <Tooltip target=".logo" />
        <img
          className="logo"
          alt="logo"
          src="/images/logo.png"
          data-pr-tooltip="PrimeReact-Logo"
          height="80px"
        /> */}
      </>
    )
  }

  /**
   * @param {Object} data data to display in the table
   * @returns {JSX.Element} A JSX element containing the columns of the data table according to primereact specifications
   */
  const getColumnsFromData = (data) => {
    if (data.length > 0) {
      let toReturn = []
      Object.keys(data[0]).map((key) => {
        if (key != "Parameters") {
          toReturn.push(<Column key={key} field={key} header={key} />)
        } else {
          toReturn.push(
            <Column
              key={key}
              field={key}
              header={key}
              body={paramsBodyTemplate}
            />
          )
        }
      })
      return toReturn
    }
    return <></>
  }

  return (
    <>
      {/* <ScrollPanel style={{ width: "100%", height: "50vh" }}>
        <Accordion multiple activeIndex={0}>
          {models.map((model) => {
            return (
              <AccordionTab
                key={model.name}
                header={
                  <div className="flex align-items-center">
                    <span className="vertical-align-middle">{model.name}</span>
                  </div>
                }
              >
                <Row>
                  <Col lg={6}>
                    <Parameters
                      params={model.params[0]}
                      tableProps={{
                        size: "small"
                      }}
                      columnNames={["Parameter", "Value"]}
                    />
                  </Col>
                  <Col lg={6}>
                    <Parameters
                      params={model.metrics[0]}
                      tableProps={{
                        size: "small"
                      }}
                      columnNames={["Metrics", "Value"]}
                    />
                  </Col>
                </Row>
              </AccordionTab>
            )
          })}
        </Accordion>
      </ScrollPanel> */}
      <DataTable
        data={allModelsData}
        customGetColumnsFromData={getColumnsFromData}
        tablePropsData={{
          scrollable: true,
          scrollHeight: "400px"
        }}
      />
    </>
  )
}

export default ModelsResults
