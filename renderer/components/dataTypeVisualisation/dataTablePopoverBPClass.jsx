import React, { useContext, useEffect, useState } from "react"
import { Button, Popover, Menu, MenuItem, InputGroup } from "@blueprintjs/core"
import { Select } from "@blueprintjs/select"
import { Tag } from "react-bootstrap-icons"
import { Stack } from "react-bootstrap"
import { DataContext } from "../workspace/dataContext"
import { Utils as danfoUtils } from "danfojs-node"
const dfUtils = new danfoUtils()

/**
 * Component that renders the popover for the data type selection in the data table and also the filter input
 * Present in the data table header
 * @param {Object} props
 * @param {Object} props.config - The config object of the data table
 * @param {String} props.columnName - The name of the column
 * @param {Array} props.category - The category of the column
 * @param {Function} props.filterColumn - The function to filter the column
 * @returns {JSX.Element}
 */
const DataTablePopoverBP = (props) => {
  const selectedIcon = {
    // The icon to be displayed in the popover button
    Numerical: "array-floating-point",
    Categorical: "array-numeric",
    Time: "array-timestamp",
    String: "array-string"
  }

  const getTypeFromInferedDtype = (dtype) => {
    // To get the data type from the infered data type
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

  const { globalData, setGlobalData } = useContext(DataContext) // The global data object
  const [selectedType, setSelectedType] = useState("Numerical") // The selected data type
  const [filterValue, setFilterValue] = useState("") // The filter value
  const menuItemOptions = { shouldDismissPopover: false, onClick: (e) => handleDataTypeChange(e), roleStructure: "listoption" } // The options for the menu items

  /**
   * To handle the change in the data type
   * @param {Object} e - The event object
   * @returns {Void}
   */
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

  /**
   * To get the unique values in the column
   * @returns {Array} - The array of unique values
   */
  function getUniqueValues() {
    let medObject = globalData[props.config.uuid]
    if (medObject) {
      let df = medObject.data
      let colName = props.columnName
      let colData = df.$getColumnData(colName).$data
      let uniqueValues = dfUtils.unique(colData)
      return uniqueValues
    }
    return []
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
              globalDataCopy[props.config.uuid].metadata.columns[props.columnName].dataType = getTypeFromInferedDtype(props.category[0])
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
      // console.log("MedObject not found")
    }
  }, [])

  /**
   * To filter the column when the filter value changes
   */
  useEffect(() => {
    if (props.filterColumn) {
      props.filterColumn(filterValue)
    }
  }, [filterValue])

  /**
   * To clear the filter value when the data type changes
   */
  useEffect(() => {
    setFilterValue("")
  }, [selectedType])

  useEffect(() => {
    // console.log("Rerender", filterValue)
  }, [])
  return (
    <>
      <Stack direction="horizontal" gap={1} style={{ marginInline: "5px", paddingBottom: "3px" }}>
        <Popover
          content={
            <Menu>
              <MenuItem icon="array-floating-point" text="Numerical" {...menuItemOptions} selected={selectedType == "Numerical"} />
              <MenuItem icon="array-numeric" text="Categorical" {...menuItemOptions} selected={selectedType == "Categorical"} />
              <MenuItem icon="array-timestamp" text="Time" {...menuItemOptions} selected={selectedType == "Time"} />
              <MenuItem icon="array-string" text="String" {...menuItemOptions} selected={selectedType == "String"} />
            </Menu>
          }
          placement="bottom-end"
        >
          <Button active={false} icon={selectedIcon[selectedType]} style={{ padding: "0.25rem", boxSizing: "content-box", minWidth: "1rem", minHeight: "1rem" }} />
        </Popover>
        {selectedType == "Categorical" && ( // If the data type is categorical, then show the select component
          <>
            <Select
              items={getUniqueValues()}
              itemRenderer={(item, { handleClick, modifiers }) => {
                return <MenuItem active={modifiers.active} disabled={modifiers.disabled} key={item} onClick={handleClick} text={item} roleStructure="listoption" />
              }}
              onItemSelect={(item) => {
                setFilterValue(item)
              }}
              popoverProps={{
                usePortal: true
              }}
              popoverContentProps={{
                style: { maxHeight: "200px", width: "100%", height: "200px", overflow: "auto" }
              }}
              filterable={false}
            >
              <Button rightIcon="caret-down" placeholder="Select value" text={filterValue !== "" ? filterValue : "Select value"} style={{ width: "auto", height: "1.5rem" }} small={true} />
            </Select>
          </>
        )}{" "}
        {selectedType == "Numerical" && ( // If the data type is numerical, then show this input component
          <>
            <InputGroup
              asyncControl={true}
              disabled={false}
              large={false}
              placeholder="Filter..."
              readOnly={false}
              small={true}
              style={{ width: "100%" }}
              value={filterValue}
              onValueChange={(value) => {
                setFilterValue(value)
              }}
            />
          </>
        )}
        {selectedType == "String" && ( // If the data type is string, then show this input component
          <>
            <InputGroup
              asyncControl={true}
              disabled={false}
              large={false}
              placeholder="Filter..."
              readOnly={false}
              small={true}
              style={{ width: "100%" }}
              rightElement={<Tag style={{ marginInline: "5px" }} />}
              value={filterValue}
              onChange={(e) => {
                console.log("Filter value changed", e.target.value)
                setFilterValue(e.target.value)
              }}
            />
          </>
        )}
        {selectedType == "Time" && ( // If the data type is time, then show this input component
          <>
            <InputGroup
              asyncControl={true}
              disabled={false}
              large={false}
              placeholder="Filter..."
              readOnly={false}
              small={true}
              style={{ width: "100%" }}
              value={filterValue}
              onValueChange={(value) => {
                setFilterValue(value)
              }}
            />
          </>
        )}
      </Stack>
    </>
  )
}

export { DataTablePopoverBP }
