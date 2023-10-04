import React, { useState, useEffect, useContext } from "react"
import { DataContext } from "../workspace/dataContext"
import DataTableFromContext from "../mainPages/dataComponents/dataTableFromContext"
import { Dropdown } from "primereact/dropdown"
import { DataFrame } from "danfojs"
import Button from "react-bootstrap/Button"
import { InputText } from "primereact/inputtext";
import { ProgressBar } from 'primereact/progressbar';
import ExtractionTSfresh from "./extractionTypes/extractionTSfresh"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { requestJson } from "../../utilities/requests"
import MedDataObject from "../workspace/medDataObject"

const ExtractionTabularData = () => {
  const [isDatasetLoaded, setIsDatasetLoaded] = useState(false)
  const [csvPath, setCsvPath] = useState("")
  const [csvResultPath, setCsvResultPath] = useState("")
  const [dataframe, setDataframe] = useState([])
  const [datasetList, setDatasetList] = useState([])
  const [extractionFunction, setExtractionFunction] = useState("TSfresh_extraction")
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [extractionStep, setExtractionStep] = useState("")
  const [extractionJsonData, setExtractionJsonData] = useState({})
  const [extractionType, setExtractionType] = useState("TSfresh")
  const [extractionTypeList] = useState(["TSfresh"])
  const [filename, setFilename] = useState("tmp_extracted_features.csv")
  const [mayProceed, setMayProceed] = useState(false)
  const [resultDataset, setResultDataset] = useState(null)
  const [selectedDataset, setSelectedDataset] = useState(null)

  const { globalData } = useContext(DataContext) // We get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { port } = useContext(WorkspaceContext)

  function getDatasetListFromDataContext(dataContext) {
    let keys = Object.keys(dataContext)
    let datasetListToShow = []
    keys.forEach((key) => {
      if (dataContext[key].type !== "folder") {
        datasetListToShow.push(dataContext[key])
      }
    })
    setDatasetList(datasetListToShow)
  }

  const datasetSelected = (dataset) => {
    setSelectedDataset(dataset)
    setIsDatasetLoaded(false)    
  }

  const handleFilenameChange = (name) => {
    if (name.match("\\w+.csv") != null) {
      setFilename(name)
    }     
  }

  const onChangeExtractionType = (value) => {
    setExtractionType(value)
    setExtractionFunction(value + "_extraction")
  }
  
  
  const runExtraction = () => {
    const progressInterval = setInterval(() => {
      requestJson(
        port,
        "/extraction_ts/progress",
        {},
        (jsonResponse) => {
          if (jsonResponse["progress"] >= 100) {
            clearInterval(progressInterval)
          } else {
            setExtractionProgress(jsonResponse["progress"])
            setExtractionStep(jsonResponse["step"])
          }
        },
        function (err) {
          console.error(err)
          clearInterval(progressInterval)
        }
      )
    }, 1000)
    requestJson(
      port,
      "/extraction_ts/" + extractionFunction,
      {
        relativeToExtractionType: extractionJsonData,
        csvPath: csvPath,
        filename: filename
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        setCsvResultPath(jsonResponse['csv_result_path'])
        clearInterval(progressInterval)
        setExtractionProgress(100)
        setExtractionStep("Extracted Features Saved")
        MedDataObject.updateWorkspaceDataObject()
      },
      function (err) {
        console.error(err)
      }
    )
  }

  useEffect(() => {
    if (datasetList.length > 0) {
      datasetList.forEach((dataset) => {
        if (dataset.path == csvResultPath) {
          setResultDataset(dataset)
        }
      })
    }
  }, [datasetList])

  useEffect(() => {
    if (globalData !== undefined) {
      getDatasetListFromDataContext(globalData)
    }
  }, [globalData])

  useEffect(() => {
    if (selectedDataset && selectedDataset.data && selectedDataset.path) {
      setCsvPath(selectedDataset.path)
      setDataframe(new DataFrame(selectedDataset.data))
    }
  }, [isDatasetLoaded])

  
  return (
    <div className="overflow-y-auto">
      <h1 className="center">Extraction - Time Series</h1>

      <hr></hr>
      <div className="margin-top-bottom-15">
        <div className="center">
          {/* Select CSV data */}
          <h2>Select CSV data</h2>
          {datasetList.length > 0 ? (
              <Dropdown
                value={selectedDataset}
                options={datasetList.filter(
                (value) =>
                  value.extension == "csv"
                )}
                optionLabel="name"
                onChange={(event) =>
                  datasetSelected(event.value)
                }
                placeholder="Select a dataset"
              />
            ) : (
              <Dropdown placeholder="No dataset to show" disabled />
          )}
        </div>
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15">
        {/* Display selected data */}
        <div className="center">
          <h2>Selected data</h2>
          {!selectedDataset && (
            <p>Nothing to show, select a CSV file first.</p>
          )}
        </div>
        {selectedDataset && (
          <div>
            <DataTableFromContext
              MedDataObject={selectedDataset}
              tablePropsData={{ size: "small", paginator:true, rows: 5 }}
              tablePropsColumn={{
                sortable: true
              }}
              setIsDatasetLoaded = {setIsDatasetLoaded}
            />
          </div>
        )}
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15">
        <div className="center">
          {/* Extraction Type Selection */}
          <h2>Select an extraction type</h2>
          <div className="margin-top-15">
          <Dropdown
            value={extractionType}
            options={extractionTypeList}
            onChange={(event) =>
              onChangeExtractionType(event.value)
            }
          />
          </div>
          <div className="margin-top-15">
            {extractionType == "TSfresh" && (
              <ExtractionTSfresh dataframe={dataframe} setExtractionJsonData={setExtractionJsonData} setMayProceed={setMayProceed}/>
            )}
          </div>
        </div>
      </div>

      <hr></hr>
      <div className="margin-top-bottom-15">
        <div className="center">
          {/* Time Series Extraction */}
          <h2>Extract time series</h2>
          <div className="margin-top-30">
            Save extracted features as : &nbsp;
            <InputText value={filename} onChange={(e) => handleFilenameChange(e.target.value)} />
          </div>
          {/* Button activated only if all necessary columns have been selected */}
          <div className="margin-top-15">
            <Button disabled={!mayProceed} onClick={runExtraction}>
              Extract Data
            </Button>
          </div>
          <div className="margin-top-30">
            {extractionStep}
            <ProgressBar value={extractionProgress}/>
          </div>
        </div>
      </div>


      <hr></hr>
      <div className="margin-top-bottom-15">
        {/* Display extracted data */}
        <div className="center">
          <h2>Extracted data</h2>
          {!resultDataset && (
            <p>Nothing to show, proceed to extraction first.</p>
          )}
        </div>
        {resultDataset && (
          <div>
            <DataTableFromContext
              MedDataObject={resultDataset}
              tablePropsData={{ size: "small", paginator:true, rows: 5 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ExtractionTabularData
