import React, { useContext, useState, useEffect } from "react"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Row, Col } from "react-bootstrap"
import { Dropdown } from "primereact/dropdown"
import MedDataObject from "../workspace/medDataObject"
import { DataContext } from "../workspace/dataContext"
import { Message } from "primereact/message"

const SaveDataset = ({ newDatasetName, newDatasetExtension, selectedDataset, setNewDatasetName, setNewDatasetExtension, functionToExecute, showExtensions = true, overwriteOption = true }) => {
  const [nameAlreadyUsed, setNameAlreadyUsed] = useState(false) // True if the entered name for saving the dataset is already used
  const { globalData } = useContext(DataContext) // The global data object

  /**
   * To check if the name is already used
   * @param {String} name - The name to check
   * @returns {Boolean} - True if the name is already used, false otherwise
   */
  const checkIfNameAlreadyUsed = (name) => {
    let alreadyUsed = false
    if (newDatasetName.length > 0 && selectedDataset) {
      let newDatasetPathParent = globalData[selectedDataset.parentID].path
      let pathToCheck = newDatasetPathParent + MedDataObject.getPathSeparator() + name
      Object.entries(globalData).map((arr) => {
        if (arr[1].path === pathToCheck) {
          alreadyUsed = true
        }
      })
    }
    setNameAlreadyUsed(alreadyUsed)
  }

  /** Hook called when the global data changes */
  useEffect(() => {
    checkIfNameAlreadyUsed(`${showExtensions ? newDatasetName + "." + newDatasetExtension : newDatasetName}`)
  }, [globalData, newDatasetName])

  return (
    <>
      <Row style={{ display: "flex", justifyContent: "space-evenly", flexDirection: "row", marginTop: "1rem", alignItems: "center" }}>
        {overwriteOption && (
          <Col>
            <Button
              label="Overwrite"
              severity={"danger"}
              size="small"
              disabled={!selectedDataset}
              onClick={() => {
                functionToExecute(true) // the function must have an overwrite option
              }}
            />
          </Col>
        )}
        <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center" }} xs>
          <div className="p-input-group flex-1 dataset-name " style={{ display: "flex", flexDirection: "row" }}>
            <InputText
              className={`${nameAlreadyUsed ? "p-invalid" : ""}`}
              placeholder="Name"
              value={newDatasetName}
              keyfilter={"alphanum"}
              onChange={(e) => {
                setNewDatasetName(e.target.value)
                checkIfNameAlreadyUsed(`${showExtensions ? e.target.value + "." + newDatasetExtension : e.target.value}`)
              }}
            />
            {showExtensions && (
              <span className="p-inputgroup-addon">
                <Dropdown
                  className={`${nameAlreadyUsed ? "p-invalid" : ""}`}
                  panelClassName="dataset-name"
                  value={newDatasetExtension}
                  options={[{ label: ".csv", value: "csv" }]}
                  onChange={(e) => {
                    setNewDatasetExtension(e.target.value)
                    checkIfNameAlreadyUsed(newDatasetName + "." + e.target.value)
                  }}
                />
              </span>
            )}
          </div>
        </Col>
        <Col>
          <Button
            label="Create"
            size="small"
            disabled={nameAlreadyUsed || !selectedDataset || newDatasetName.length < 1}
            onClick={() => {
              functionToExecute()
            }}
          />
        </Col>
      </Row>
      {/* Warning display */}
      {nameAlreadyUsed && (
        <div className="flex-container">
          <Message severity="warn" text="The entered name already exists." />
        </div>
      )}
    </>
  )
}

export default SaveDataset
