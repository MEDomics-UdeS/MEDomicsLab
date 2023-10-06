import React, { use, useContext, useEffect, useState } from "react"

import { Button, Popover, Menu, MenuItem, InputGroup } from "@blueprintjs/core"
import { Select } from "@blueprintjs/select"
import { Tag } from "react-bootstrap-icons"
import { Stack } from "react-bootstrap"
import { DataContext } from "../workspace/dataContext"
var dfd = require("danfojs-node")
import { Utils as danfoUtils } from "danfojs-node"
const dfUtils = new danfoUtils()

const DataTablePopoverBP = (props) => {
  const selectedIcon = {
    Numerical: "array-floating-point",
    Categorical: "array-numeric",
    Time: "array-timestamp",
    String: "array-string"
  }
  const getTypeFromInferedDtype = (dtype) => {
    switch (dtype) {
      case "float32":
        return "Numerical"
      case "int32":
        return "Categorical"
      case "datetime64[ns]":
        return "Time"
      case "string":
        return "String"
      default:
        return "Numerical"
    }
  }
  const { globalData, setGlobalData } = useContext(DataContext)
  const [selectedType, setSelectedType] = useState("Numerical")
  const [content, setContent] = useState(null)
  const menuItemOptions = { shouldDismissPopover: false, onClick: (e) => handleDataTypeChange(e), roleStructure: "listoption" }
  const handleDataTypeChange = (e) => {
    console.log("Data type changed", e.target.innerText)
    setSelectedType(e.target.innerText)
    changeTypeInGlobalData(e.target.innerText)
  }

  /**
   * To change the data type of the column in the global data object
   * @param {String} type
   * @returns {Void}
   */
  const changeTypeInGlobalData = (type) => {
    let globalDataCopy = { ...globalData }
    if (globalDataCopy[props.config.uuid]) {
      if (globalDataCopy[props.config.uuid].metadata.columns) {
        if (globalDataCopy[props.config.uuid].metadata.columns[props.columnName]) {
          globalDataCopy[props.config.uuid].metadata.columns[props.columnName].dataType = type
        } else {
          globalDataCopy[props.config.uuid].metadata.columns[props.columnName] = {
            dataType: type
          }
        }
      } else {
        globalDataCopy[props.config.uuid].metadata.columns = {
          [props.columnName]: {
            dataType: type
          }
        }
      }
      setGlobalData(globalDataCopy)
    }
  }

  function getUniqueValues() {
    let medObject = globalData[props.config.uuid]
    if (medObject) {
      let df = medObject.data
      let colName = props.columnName
      console.log("DF", df.$getColumnData(colName), df, colName)
      let colData = df.$getColumnData(colName).$data
      console.log("Col data", colData)
      let uniqueValues = dfUtils.unique(colData)
      return uniqueValues
    }
    return []
  }

  function describeColumn() {
    let medObject = globalData[props.config.uuid]
    if (medObject) {
      if (medObject.metadata.columns) {
        if (medObject.metadata.columns[props.columnName]) {
          if (medObject.metadata.columns[props.columnName].description) {
            return medObject.metadata.columns[props.columnName].description
          }
        }
      }
      return
    }

    return "No description found"
  }
  /**
   * To set the selected type to the type of the column if it is already present in the global data object
   * @returns {Void}
   */
  useEffect(() => {
    let medObject = globalData[props.config.uuid]
    let globalDataCopy = { ...globalData }
    if (medObject) {
      if (medObject.metadata.columns) {
        if (medObject.metadata.columns[props.columnName]) {
          if (medObject.metadata.columns[props.columnName].dataType) {
            let type = medObject.metadata.columns[props.columnName].dataType
            if (Object.keys(selectedIcon).includes(type)) {
              setSelectedType(medObject.metadata.columns[props.columnName].dataType)
            } else {
              globalDataCopy[props.config.uuid].metadata.columns[props.columnName].dataType = getTypeFromInferedDtype(
                props.category[0]
              )
              setSelectedType(getTypeFromInferedDtype(props.category[0]))
              setGlobalData(globalDataCopy)
            }
          }
        }
      } else {
        globalDataCopy[props.config.uuid].metadata.columns = {
          [props.columnName]: {
            dataType: getTypeFromInferedDtype(props.category[0])
          }
        }
        setGlobalData(globalDataCopy)
      }
    } else {
      console.log("MedObject not found")
    }
    console.log("MedObject", globalData, props.config.uuid)
  }, [])

  useEffect(() => {
    if (globalData[props.config.uuid]) {
      console.log("Selected type", selectedType, globalData[props.config.uuid].metadata)
    }
    if (selectedType == "Numerical") {
      setContent(
        <InputGroup
          asyncControl={true}
          disabled={false}
          large={false}
          leftIcon="filter"
          placeholder="Filter..."
          readOnly={false}
          // rightElement={}
          small={true}
          style={{ width: "100%" }}

          // value={filterValue}
        />
      )
    } else if (selectedType == "Categorical") {
      let uniqueValues = getUniqueValues()
      console.log("Unique values", uniqueValues)
      let uniques = uniqueValues.map((value) => {})

      setContent(
        <>
          <Select
            items={uniqueValues}
            itemRenderer={(item, { handleClick, modifiers, query }) => {
              return (
                <MenuItem
                  active={modifiers.active}
                  disabled={modifiers.disabled}
                  key={item}
                  onClick={handleClick}
                  text={item}
                  roleStructure="listoption"
                />
              )
            }}
            onItemSelect={(item) => console.log(item)}
            popoverProps={{ minimal: true, usePortal: true }}
            filterable={false}
            style={{ maxHeight: "200px", width: "100%" }}
          >
            <Button rightIcon="caret-down" text="Select value" style={{ width: "auto", height: "1.5rem" }} small={true} />
          </Select>
        </>
      )
    } else if (selectedType == "Time") {
      setContent()
    } else {
      setContent(
        <>
          <InputGroup
            asyncControl={true}
            disabled={false}
            large={false}
            // leftIcon="filter"
            placeholder="Filter..."
            readOnly={false}
            // rightElement={}
            small={true}
            style={{ width: "100%" }}
            // value={filterValue}
          />
        </>
      )
    }
  }, [selectedType])

  // console.log("Config seen from popover JSX const", props.category[0], getTypeFromInderedDtype(props.category[0]))
  return (
    <>
      <Stack direction="horizontal" gap={1} style={{ marginInline: "5px" }}>
        <Popover
          content={
            <Menu>
              <MenuItem
                icon="array-floating-point"
                text="Numerical"
                {...menuItemOptions}
                selected={selectedType == "Numerical"}
              />
              <MenuItem icon="array-numeric" text="Categorical" {...menuItemOptions} selected={selectedType == "Categorical"} />
              <MenuItem icon="array-timestamp" text="Time" {...menuItemOptions} selected={selectedType == "Time"} />
              <MenuItem icon="array-string" text="String" {...menuItemOptions} selected={selectedType == "String"} />
            </Menu>
          }
          placement="bottom-end"
        >
          <Button
            active={false}
            icon={selectedIcon[selectedType]}
            style={{ padding: "0.25rem", boxSizing: "content-box", minWidth: "1rem", minHeight: "1rem" }}
          />
        </Popover>
        {content}
      </Stack>
    </>
  )
}

export { DataTablePopoverBP }
