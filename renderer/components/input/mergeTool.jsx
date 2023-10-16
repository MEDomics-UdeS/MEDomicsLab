import React, { useState, useEffect, useContext, use } from "react"
import { AccordionTab } from "primereact/accordion"
import { DataContext } from "../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { PlusSquare, XSquare } from "react-bootstrap-icons"
import { Button } from "primereact/button"
import { MultiSelect } from "primereact/multiselect"

const MergeTool = ({ pageId = "42", configPath = null }) => {
  const [data, setData] = useState([])
  const [listOfDatasets, setListOfDatasets] = useState([])
  const [dictOfDatasets, setDictOfDatasets] = useState({})
  const { globalData } = useContext(DataContext)
  const [datasetSelector, setDatasetSelector] = useState(null)
  const [firstSelectedDataset, setFirstSelectedDataset] = useState(null)
  const [numberOfDatasets, setNumberOfDatasets] = useState(1)
  const [mergeOn, setMergeOn] = useState(null)

  const mergeOptions = [
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
    { label: "Inner", value: "inner" },
    { label: "Outer", value: "outer" },
    { label: "Cross", value: "cross" }
  ]
  const updateListOfDatasets = () => {
    let newDatasetList = []
    Object.keys(globalData).forEach((key) => {
      if (globalData[key].extension === "csv") {
        newDatasetList.push({ name: globalData[key].name, object: globalData[key], key: key })
      }
    })
    setListOfDatasets(newDatasetList)
  }

  useEffect(() => {
    Object.keys(dictOfDatasets).forEach((key) => {
      if (dictOfDatasets[key] !== null && dictOfDatasets !== undefined) {
        if (dictOfDatasets[key].options === null || dictOfDatasets[key].options === undefined) {
          ;(async () => {
            let newDictOfDatasets = { ...dictOfDatasets }
            let columnsOriginal = await globalData[dictOfDatasets[key].data].getColumnsOfTheDataObjectIfItIsATable()
            console.log("Columns", columnsOriginal)
            // newDictOfDatasets[key].options =
            let columnsOptions = generateColumnsOptionsFromColumns(columnsOriginal)
            console.log("newDictOfDatasets", newDictOfDatasets, key)
            // if (key !== "0") {
            //   let mergeOn = dictOfDatasets[0].mergeOn
            //   if (mergeOn) {
            //     newDictOfDatasets[key].options = columnsOptions.filter((option) => option.value !== mergeOn)
            //     console.log("newDictOfDatasets[key].options", newDictOfDatasets[key].options)
            //   }
            // } else {
            newDictOfDatasets[key].options = columnsOptions
            if (dictOfDatasets[0].mergeOn) {
              // Check if the mergeOn column is present in the dataset
              if (!columnsOriginal.includes(dictOfDatasets[0].mergeOn)) {
                console.log("MERGE ON NOT PRESENT")
                newDictOfDatasets[key].isValid = false
              } else {
                console.log("MERGE ON PRESENT")
                newDictOfDatasets[key].isValid = true
              }
            }
            // }
            setDictOfDatasets(newDictOfDatasets)
          })()
        }
      }
    })
  }, [dictOfDatasets])

  const returnListWithoutDatasetAlreadyUsed = (index) => {
    // Object.keys(dictOfDatasets).forEach((key) => {

    console.log("DictOfDatasets", dictOfDatasets)
    let alreadySelectedDatasets = Object.entries(dictOfDatasets).map((arr, i) => {
      console.log("arr", arr, i, index)
      if (arr[1] && arr[1].data) {
        if (arr[0] !== index) {
          return arr[1].data
        }
      }
    })
    console.log("alreadySelectedDatasets", alreadySelectedDatasets)
    let options = listOfDatasets.filter((dataset) => !alreadySelectedDatasets.includes(dataset.key))
    console.log("options", options)
    return options
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
        value={dictOfDatasets[index] ? dictOfDatasets[index] : null}
        onChange={(e) => {
          let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
          console.log("e", e.target.value, index)
          // newDictOfDatasets[index] = { data: globalData[e.target.value], columns: globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable() }
          // console.log("newDictOfDatasets", newDictOfDatasets)
          // setDictOfDatasets(newDictOfDatasets)
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

  const cleanString = (string) => {
    // if String has spaces or "", erase them
    if (string.includes(" ") || string.includes('"')) {
      string = string.replaceAll(" ", "")
      string = string.replaceAll('"', "")
    }
    return string
  }

  const generateColumnsOptionsFromColumns = (columns) => {
    console.log("columns", columns)
    let options = []
    if (columns === null || columns === undefined) {
      return options
    } else {
      columns.forEach((column) => {
        column = cleanString(column)
        options.push({ label: column, value: column })
      })
      return options
    }
  }

  const getColumnsAsOptionsFromDataset = (dataset) => {
    let options = []
    if (dataset) {
      if (typeof dataset === "string") {
        dataset = globalData[dataset]
      }
      dataset.getColumnsOfTheDataObjectIfItIsATable().then((columns) => {
        options = generateColumnsOptionsFromColumns(columns)
        return options
      })
    }
  }

  /**
   * return the options for the columns of a dataset
   * @param {MedDataObject} dataset - the dataset to get the columns from
   * @returns {Array<Object>} options - the options for the columns of a dataset
   */
  const returnColumnsOptions = async (dataset) => {
    let options = []
    if (dataset) {
      if (typeof dataset === "string") {
        dataset = globalData[dataset]
      }

      let columns = await dataset.getColumnsOfTheDataObjectIfItIsATable()
      let options2 = await columns.map((column) => {
        column = cleanString(column)
        return { label: column, value: column }
      })
      return options
    }
  }

  const verifyIfMergeOnColumnIsPresent = async (dataset) => {
    // let columns = dataset.getColumnsOfTheDataObjectIfItIsATable()
    console.log("VERIFY dataset", dataset)
    console.log("VERIFY COLUMNS", dictOfDatasets[0].mergeOn)
    if (dataset && dictOfDatasets[0].mergeOn) {
      let columns = await dataset.getColumnsOfTheDataObjectIfItIsATable()
      console.log("VERIFY COLUMNS 2", columns)
      console.log("VERIFY COLUMNS 3", columns.includes(dictOfDatasets[0].mergeOn))
      return columns.includes(dictOfDatasets[0].mergeOn)
    } else {
      return false
    }
  }

  const getColumnsFromDict = (index) => {
    let columns = []
    if (dictOfDatasets[index]) {
      columns = dictOfDatasets[index].columns
    }
    return columns
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
      // updateDatasetSelectorElement()
    }
  }, [globalData])

  useEffect(() => {
    console.log("dictOfDatasets", dictOfDatasets)
  }, [dictOfDatasets])
  return (
    <>
      <div className="mergeToolMultiSelect">
        <Row className="justify-content-center ">
          <Col md={6} style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "center", justifyContent: "center" }}>
            <h6 style={{ padding: ".25rem", margin: "0rem" }}>Main dataset</h6>
            <Dropdown
              className="w-full md:w-14rem padding8px"
              filter
              label="Select the first dataset"
              placeholder="First dataset"
              value={firstSelectedDataset ? firstSelectedDataset.getUUID() : null}
              options={listOfDatasets}
              optionLabel="name"
              optionValue="key"
              style={{ width: "100%" }}
              onChange={(e) => {
                setFirstSelectedDataset(globalData[e.target.value])
                let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                newDictOfDatasets[0] = { data: e.target.value, columns: globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable(), mergeOn: null }
                newDictOfDatasets[1] = null
                setDictOfDatasets(newDictOfDatasets)
                console.log("OPTIONS", returnColumnsOptions(globalData[e.target.value]))
              }}
            />
          </Col>
          <Col md={6} style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "center", justifyContent: "center" }}>
            <h6 style={{ padding: ".25rem", margin: "0rem", marginLeft: "1rem" }}>Column to merge on :</h6>
            {/* {const columns = dataset ? globalData[dictOfDatasets[key].data].metadata.columns : null} */}
            <Dropdown
              filter
              className="w-full md:w-14rem padding8px"
              optionLabel="label"
              value={dictOfDatasets[0] ? dictOfDatasets[0].mergeOn : null}
              optionValue="value"
              options={dictOfDatasets[0] && dictOfDatasets[0].options ? dictOfDatasets[0].options : []}
              label="Select the column to merge on"
              placeholder="Merge on..."
              style={{ width: "100%" }}
              onChange={(e) => {
                let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                newDictOfDatasets[0].mergeOn = e.target.value
                setDictOfDatasets(newDictOfDatasets)
                setMergeOn(e.target.value)
              }}
            />
          </Col>
        </Row>
        <Row className="justify-content-center">
          {Object.keys(dictOfDatasets).map((key) => {
            if (key === "0") return <></>

            console.log("key", key)

            let dataset
            if (dictOfDatasets[key] && dictOfDatasets[key].data) {
              console.log("dictOfDatasets[key].data", dictOfDatasets[key].data)
              // console.log("globalData", globalData)
              dataset = globalData[dictOfDatasets[key].data]
            }
            console.log("dataset", dataset)
            console.log("LocalDataset", dictOfDatasets[key])
            // globalData[dictOfDatasets[key].data]
            const columns = dataset ? globalData[dictOfDatasets[key].data].metadata.columns : null
            // const isValid = verifyIfMergeOnColumnIsPresent(dataset) ? true : false
            let isValid = true
            if (dictOfDatasets[key] && dictOfDatasets[0].mergeOn) {
              if (dictOfDatasets[key].isValid !== undefined && dictOfDatasets[key].isValid !== null) {
                isValid = dictOfDatasets[key].isValid
                console.log("isValid", isValid)
              }
            }

            return (
              <Col md={6} key={key} style={{ display: "flex", flexDirection: "row", flexGrow: "1", alignItems: "center", justifyContent: "center" }}>
                <Col md={3} style={{ display: "flex", flexDirection: "row", flexGrow: "0", alignItems: "center", justifyContent: "center" }}>
                  <h6 style={{ padding: ".25rem", margin: "0rem" }}>Dataset #{parseInt(key)}</h6>
                  <a
                    onClick={() => {
                      const newDictOfDatasets = { ...dictOfDatasets }
                      delete newDictOfDatasets[key]
                      setDictOfDatasets(newDictOfDatasets)
                    }}
                  >
                    <XSquare size={25} style={{ marginRight: "1rem" }} />
                  </a>
                </Col>
                <Col md={6} key={key} style={{ display: "flex", flexDirection: "column", flexGrow: "1", alignItems: "center", justifyContent: "center", marginTop: "1rem" }}>
                  {!isValid && (
                    <span style={{ color: "red" }}>
                      The column to merge on <b>({dictOfDatasets[0].mergeOn})</b> is not present in this dataset
                    </span>
                  )}
                  <Dropdown
                    className={`w-full md:w-14rem padding8px ${isValid ? "" : "p-invalid"}`}
                    filter
                    label={`Select dataset #${parseInt(key)}`}
                    placeholder={`Dataset #${parseInt(key)}`}
                    value={dataset && dataset.getUUID() ? dataset.getUUID() : null}
                    options={returnListWithoutDatasetAlreadyUsed(key)}
                    optionLabel="name"
                    optionValue="key"
                    style={{ width: "100%" }}
                    onChange={(e) => {
                      const newDictOfDatasets = { ...dictOfDatasets }
                      newDictOfDatasets[key] = { data: e.target.value, columns: globalData[e.target.value].getColumnsOfTheDataObjectIfItIsATable(), selectedColumns: null, mergeType: null, isValid: false }

                      setDictOfDatasets(newDictOfDatasets)
                      console.log(e)
                    }}
                  />
                  <div className="divider" />
                  <Dropdown
                    disabled={dataset ? false : true}
                    className="w-full md:w-14rem padding8px"
                    filter
                    value={dictOfDatasets[key] ? dictOfDatasets[key].mergeType : null}
                    options={mergeOptions}
                    label="Select the merge type"
                    placeholder="Merge type"
                    style={{ width: "100%" }}
                    onChange={(e) => {
                      let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                      newDictOfDatasets[key].mergeType = e.target.value
                      setDictOfDatasets(newDictOfDatasets)
                    }}
                  />
                  <div className="divider" />
                  <MultiSelect
                    optionDisabled={(option) => {
                      return option.value === mergeOn
                    }}
                    panelClassName="mergeToolMultiSelect"
                    disabled={dataset ? false : true}
                    className="w-full md:w-14rem  margintop8px "
                    filter
                    value={dictOfDatasets[key] ? dictOfDatasets[key].selectedColumns : null}
                    display="chip"
                    style={{ width: "100%" }}
                    placeholder="Select columns to merge"
                    options={dictOfDatasets[key] && dictOfDatasets[key].options ? dictOfDatasets[key].options : []}
                    panelFooterTemplate={() => {
                      const length = dictOfDatasets[key] && dictOfDatasets[key].selectedColumns ? dictOfDatasets[key].selectedColumns.length : 0
                      return (
                        <div className="p-d-flex p-ai-center p-jc-between" style={{ marginLeft: "8px" }}>
                          <b>{length}</b> item{length > 1 ? "s" : ""} selected
                        </div>
                      )
                    }}
                    onChange={(e) => {
                      let newDictOfDatasets = dictOfDatasets ? { ...dictOfDatasets } : {}
                      newDictOfDatasets[key].selectedColumns = e.target.value
                      setDictOfDatasets(newDictOfDatasets)
                    }}
                  />
                </Col>
              </Col>
            )
          })}
        </Row>
        <Col style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: 0, alignItems: "center", marginTop: "1rem" }} xs>
          <a
            onClick={() => {
              const newDictOfDatasets = { ...dictOfDatasets }
              newDictOfDatasets[Object.keys(dictOfDatasets).length] = null
              setDictOfDatasets(newDictOfDatasets)
            }}
            style={{ marginLeft: "1rem", display: "flex", flexDirection: "row", flexGrow: "-moz-initial" }}
          >
            <PlusSquare size={35} />
          </a>
        </Col>
        <Button
          label="Merge"
          style={{ position: "relative", display: "flex", alignSelf: "end", alignItems: "flex-end", justifyContent: "flex-end", justifySelf: "flex-end" }}
          onClick={(e) => {
            console.log("MERGE SENT")
          }}
        />
      </div>
    </>
  )
}

export default MergeTool
// export { MergeTool }
