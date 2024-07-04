import React, { useState, useEffect, useContext } from "react"
import CreatableSelect from "react-select/creatable" // https://react-select.com/creatable
import FloatingLabel from "react-bootstrap/FloatingLabel"
import Form from "react-bootstrap/Form"
import { toast } from "react-toastify" // https://www.npmjs.com/package/react-toastify
import { Tooltip } from "react-tooltip"
import { Markup } from "interweave"
import WsSelect from "../mainPages/dataComponents/wsSelect"
import WsSelectMultiple from "../mainPages/dataComponents/wsSelectMultiple"
import TagsSelectMultiple from "../mainPages/dataComponents/tagsSelectMultiple"
import { customZipFile2Object } from "../../utilities/customZipFile"
import { DataContext } from "../workspace/dataContext"
import MedDataObject from "../workspace/medDataObject"
import { Dropdown } from "primereact/dropdown"
import { MultiSelect } from "primereact/multiselect"
import VarsSelectMultiple from "../mainPages/dataComponents/varsSelectMultiple"
import { Message } from "primereact/message"

/**
 *
 * @param {*} label new option label
 * @returns {object} a new option
 *
 * @description
 * This function is used to create a new option for the select
 */
const createOption = (label) => ({
  label,
  value: label
})

/**
 *
 * @param {string} name name of the setting
 * @param {object} settingInfos infos of the setting ex: {type: "string", tooltip: "this is a tooltip"}
 * @returns {JSX.Element} A Input component
 *
 * @description
 * This component is used to display a Input component.
 * it handles multiple types of input and format them to be similar
 */
const FlInput = ({ name, settingInfos, currentValue, onInputChange, disabled, setHasWarning = () => {}, customProps }) => {
  const [inputUpdate, setInputUpdate] = useState({})
  const [inputValue, setInputValue] = useState("")
  const { globalData, setGlobalData } = useContext(DataContext)

  /**
   *
   * @param {Event} event keydown event
   *
   * @description
   * This function is used to handle the keydown event on the input
   * it handles the creation of a new option
   * this function is used only for the select input
   */
  const handleKeyDown = (event) => {
    if (!inputValue) return
    switch (event.key) {
      case "Enter":
      case "Tab":
        currentValue == undefined && (currentValue = [])
        setInputUpdate({
          name: name,
          value: [...currentValue, createOption(inputValue)],
          type: settingInfos.type
        })
        setInputValue("")
        event.preventDefault()
    }
  }

  const createTooltip = (tooltip, tooltipId) => {
    return (
      <Tooltip className="tooltip" anchorSelect={`#${tooltipId}`} delayShow={1000} place="left">
        <Markup content={tooltip} />
      </Tooltip>
    )
  }

  // execute this when an input is updated
  // it also verify if the input is correct
  useEffect(() => {
    if (inputUpdate.name != undefined) {
      if (inputUpdate.type == "int") {
        let regexPattern = /^-?[0-9]+$/
        if (!regexPattern.test(inputUpdate.value)) {
          toast.warn("This input must be an integer", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            toastId: "customId"
          })
          inputUpdate.value = Math.round(inputUpdate.value)
        }
      }
      onInputChange(inputUpdate)
    }
  }, [inputUpdate])

  /**
   *
   * @param {Object} settingInfos contains infos about the setting
   * @returns {JSX.Element} a correct input component according to the type of the setting
   *
   * @description
   * This function is used to return a correct input component according to the type of the setting
   * it handles multiple types of input and format them to be similar
   *
   */
  const getCorrectInputType = (settingInfos) => {
    switch (settingInfos.type) {
      // for normal string input
      case "string":
        return (
          <>
            <FloatingLabel id={name} controlId={name} label={name} className=" input-hov">
              <Form.Control
                disabled={disabled}
                type="text"
                defaultValue={currentValue}
                onChange={(e) =>
                  setInputUpdate({
                    name: name,
                    value: e.target.value,
                    type: settingInfos.type
                  })
                }
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      // for integer input
      case "int":
        return (
          <>
            <FloatingLabel controlId={name} label={name} className=" input-hov">
              <Form.Control
                disabled={disabled}
                type="number"
                defaultValue={currentValue}
                onChange={(e) =>
                  setInputUpdate({
                    name: name,
                    value: parseInt(e.target.value),
                    type: settingInfos.type
                  })
                }
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      // for float input
      case "float":
        return (
          <>
            <FloatingLabel controlId={name} label={name} className=" input-hov">
              <Form.Control
                disabled={disabled}
                type="number"
                step="0.1"
                defaultValue={currentValue}
                onChange={(e) =>
                  setInputUpdate({
                    name: name,
                    value: parseFloat(e.target.value),
                    type: settingInfos.type
                  })
                }
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      // for boolean input (form select of 2 options True/False)
      case "bool":
        return (
          <>
            <FloatingLabel controlId={name} className="input-hov">
              <div className="p-2 border rounded">
                <Form.Check
                  disabled={disabled}
                  id={name}
                  label={name}
                  checked={currentValue === "True"}
                  onChange={(e) => {
                    const value = e.target.checked ? "True" : "False"
                    setInputUpdate({
                      name: name,
                      value: value,
                      type: settingInfos.type
                    })
                  }}
                />
              </div>
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )

      case "bool-int-str":
        return (
          <>
            <FloatingLabel id={name} controlId={name} label={name} className=" input-hov">
              <Form.Control
                disabled={disabled}
                type="text"
                defaultValue={currentValue}
                onChange={(e) => {
                  let value = ""
                  if (/^-?[0-9]+$/.test(e.target.value)) {
                    value = parseInt(e.target.value)
                  } else {
                    value = e.target.value
                  }
                  console.log("value", value)
                  setInputUpdate({
                    name: name,
                    value: value,
                    type: settingInfos.type
                  })
                }}
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      case "int-float-str":
        return (
          <>
            <FloatingLabel controlId={name} label={name} className=" input-hov">
              <Form.Select
                disabled={disabled}
                defaultValue={currentValue}
                onChange={(e) => {
                  // check if the value is a float or an int or a string
                  let value = ""
                  if (/^-?[0-9]+$/.test(e.target.value)) {
                    // int
                    value = parseInt(e.target.value)
                  } else if (/^-?[0-9]*[.][0-9]+$/.test(e.target.value)) {
                    // float
                    value = parseFloat(e.target.value)
                  } else {
                    // string
                    value = e.target.value
                  }

                  setInputUpdate({
                    name: name,
                    value: value,
                    type: settingInfos.type
                  })
                }}
              >
                <option value="" hidden></option>
                <option value="True">True</option>
                <option value="False">False</option>
              </Form.Select>
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      // for list input (form select of all the options)
      case "list":
        return (
          <>
            <FloatingLabel controlId={name} label={name} className="input-hov">
              <Dropdown
                className="form-select"
                {...customProps}
                disabled={disabled}
                value={{ name: currentValue }}
                onChange={(e) =>
                  setInputUpdate({
                    name: name,
                    value: e.target.value.name,
                    type: settingInfos.type
                  })
                }
                options={settingInfos.choices}
                optionLabel="name"
                appendTo="self"
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      // for list input (form select of all the options, multiple selection possible)
      case "list-multiple":
        return (
          <div className="w-100" style={{ position: "relative", zIndex: 1 }}>
            <label
              htmlFor={name}
              className="input-hov"
              style={{ color: "grey", fontSize: "13px", position: "absolute", top: "-0.8rem", left: "1rem", backgroundColor: "white", padding: "0 0.5rem", zIndex: "1" }}
            >
              {name}
            </label>
            <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ced4da", borderRadius: "0.25rem" }}>
              <MultiSelect
                maxSelectedLabels={2}
                optionLabel="name"
                display="chip"
                disabled={disabled}
                value={currentValue}
                appendTo="self"
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setInputUpdate({
                    name: name,
                    value: e.value, // Update to e.value to get the array of selected values
                    type: settingInfos.type
                  })
                }}
                onBlur={() => {}}
                options={settingInfos.choices}
                className="w-100 multi-select-dropdown"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            {createTooltip(settingInfos.tooltip, name)}
          </div>
        )

      // for range input
      case "range":
        return (
          <>
            <FloatingLabel controlId={name} label={name} className=" input-hov">
              <Form.Control
                disabled={disabled}
                type="range"
                min={settingInfos.min} // specify the minimum value
                max={settingInfos.max} // specify the maximum value
                step={settingInfos.step} // specify the step size
                defaultValue={currentValue}
                onChange={(e) =>
                  setInputUpdate({
                    name: name,
                    value: e.target.value,
                    type: settingInfos.type
                  })
                }
              />
              <div className="range-value">{currentValue}</div> {/* Display current value */}
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      // for custom list input (multiple custom string inputs)
      case "custom-list":
        return (
          <>
            <div id={name} style={{ height: "52px" }} className="custom-list">
              <label className="custom-lbl">{name}</label>
              <CreatableSelect
                disabled={disabled}
                components={{ DropdownIndicator: null }}
                inputValue={inputValue}
                isClearable
                isMulti
                menuIsOpen={false}
                onChange={(newValue) =>
                  setInputUpdate({
                    name: name,
                    value: newValue,
                    type: settingInfos.type
                  })
                }
                onInputChange={(newValue) => setInputValue(newValue)}
                onKeyDown={handleKeyDown}
                placeholder="Add"
                value={currentValue}
                className="input-hov"
              />
            </div>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      // for pandas dataframe input (basically a string input for now)
      case "pandas.DataFrame":
        return (
          <>
            <FloatingLabel controlId={name} label={name} className=" input-hov">
              <Form.Control
                disabled={disabled}
                type="text"
                defaultValue={currentValue}
                onChange={(e) =>
                  setInputUpdate({
                    name: name,
                    value: e.target.value,
                    type: settingInfos.type
                  })
                }
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )

      case "data-input":
        return (
          <>
            <FloatingLabel id={name} controlId={name} label={name} className=" input-hov">
              <WsSelect
                disabled={disabled}
                selectedPath={currentValue}
                acceptedExtensions={["csv"]}
                acceptFolder={settingInfos.acceptFolder ? settingInfos.acceptFolder : false}
                onChange={(e, path) => {
                  console.log("e", e, path)
                  if (path == "") {
                    setHasWarning({ state: true, tooltip: <p>No file selected</p> })
                  } else {
                    setHasWarning({ state: false })
                  }
                  setInputUpdate({
                    name: name,
                    value: { name: e.target.value, path: path },
                    type: settingInfos.type
                  })
                }}
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )

      case "data-input-multiple":
        console.log("currentValue", currentValue)
        console.log("settingInfos", settingInfos)
        console.log("name", name)
        return (
          <>
            <WsSelectMultiple
              key={name}
              rootDir={["learning", "holdout"]}
              placeholder={name}
              disabled={disabled}
              selectedPaths={currentValue}
              acceptedExtensions={["csv"]}
              matchRegex={new RegExp("T[0-9]*_(w+)?")}
              acceptFolder={settingInfos.acceptFolder ? settingInfos.acceptFolder : false}
              onChange={(value) => {
                console.log("e", value)
                if (value.length === 0) {
                  setHasWarning({ state: true, tooltip: <p>No file(s) selected</p> })
                } else {
                  setHasWarning({ state: false })
                }
                setInputUpdate({
                  name: name,
                  value: value,
                  type: settingInfos.type
                })
              }}
              setHasWarning={setHasWarning}
              whenEmpty={<Message severity="warn" text="No file(s) found in the workspace under '/learning' folder containing 'TX_' prefix (X is a number)" />}
            />
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      case "tags-input-multiple":
        return (
          <>
            <TagsSelectMultiple
              key={name}
              placeholder={name}
              disabled={!settingInfos.selectedDatasets}
              selectedTags={currentValue}
              selectedDatasets={settingInfos.selectedDatasets}
              onChange={(value) => {
                console.log("e", value)
                setInputUpdate({
                  name: name,
                  value: value,
                  type: settingInfos.type
                })
              }}
            />
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
      case "variables-input-multiple":
        return (
          <>
            <VarsSelectMultiple
              key={name}
              placeholder={name}
              disabled={!settingInfos.selectedDatasets}
              selectedTags={settingInfos.selectedTags}
              selectedDatasets={settingInfos.selectedDatasets}
              selectedVars={currentValue}
              onChange={(value) => {
                console.log("e", value)
                setInputUpdate({
                  name: name,
                  value: value,
                  type: settingInfos.type
                })
              }}
            />
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )

      case "models-input":
        return (
          <>
            <FloatingLabel id={name} controlId={name} label={name} className="input-hov">
              <WsSelect
                selectedPath={currentValue}
                acceptedExtensions={["medmodel"]}
                onChange={(e, path) => {
                  console.log("e", e, path)
                  setInputUpdate({
                    name: name,
                    value: { name: e.target.value, path: path },
                    type: settingInfos.type
                  })
                  if (path != "") {
                    customZipFile2Object(path)
                      .then((content) => {
                        setInputUpdate({
                          name: name,
                          value: { name: e.target.value, path: path, metadata: content.metadata },
                          type: settingInfos.type
                        })
                        console.log("content", content)
                        let modelDataObject = MedDataObject.checkIfMedDataObjectInContextbyPath(path, globalData)
                        modelDataObject.metadata.content = content.metadata
                        setGlobalData({ ...globalData })
                      })
                      .catch((error) => {
                        console.log("error", error)
                      })
                    setHasWarning({ state: false })
                  } else {
                    setHasWarning({ state: true, tooltip: <p>No model selected</p> })
                  }
                }}
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )

      // for all the other types of input (basically a string input for now)
      default:
        return (
          <>
            <FloatingLabel controlId={name} label={name} className="input-hov">
              <Form.Control
                disabled={disabled}
                type="text"
                defaultValue={currentValue}
                onChange={(e) =>
                  setInputUpdate({
                    name: name,
                    value: e.target.value,
                    type: settingInfos.type
                  })
                }
              />
            </FloatingLabel>
            {createTooltip(settingInfos.tooltip, name)}
          </>
        )
    }
  }
  return <>{getCorrectInputType(settingInfos)}</>
}

export default FlInput
