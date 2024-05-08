import React, { useState, useContext, useEffect } from "react"
import { Dropdown } from "primereact/dropdown"
import { DataContext } from "../../workspace/dataContext"
import { MultiSelect } from "primereact/multiselect"
import { Message } from "primereact/message"
import { Checkbox } from "primereact/checkbox"
import { toast } from "react-toastify"
import { requestBackend } from "../../../utilities/requests"
import { PageInfosContext } from "../../mainPages/moduleBasics/pageInfosContext"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import { ErrorRequestContext } from "../../generalPurpose/errorRequestContext"
import SaveDataset from "../../generalPurpose/saveDataset"
import MedDataObject from "../../workspace/medDataObject"

/**
 * Component that renders the ApplyPCA feature reduction tool
 */
const ApplyPCA = () => {
  const [dataFolderPath, setDataFolderPath] = useState("") // DATA folder
  const [dataframe, setDataframe] = useState(null) // djanfo dataframe of data to apply PCA on
  const [datasetList, setDatasetList] = useState([]) // list of available datasets
  const [dfTransformation, setDfTransformation] = useState(null) // djanfo dataframe of the PCA transformation
  const [fileExtension, setFileExtension] = useState("csv") // on which extension to save the file
  const [keepUnselectedColumns, setKeepUnselectedColumns] = useState(false) // wether to merge unselected pca columns in the result dataset
  const [PCAfilename, setPCAfilename] = useState("") // name under which to save the computed PCA dataset
  const [selectedColumns, setSelectedColumns] = useState([]) // columns to apply PCA on
  const [selectedDataset, setSelectedDataset] = useState(null) // dataset in which we want to apply PCA
  const [selectedTransformation, setSelectedTransformation] = useState(null) // PCA transformation we want to apply
  const [transformationList, setTransformationList] = useState([]) // list of available transformations in pca_transformations folder

  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { pageId } = useContext(PageInfosContext) // used to get the pageId
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { setError } = useContext(ErrorRequestContext) // used to diplay the errors

  /**
   *
   * @description
   * This functions get all csv files from the DataContext and update datasetList and transformationList.
   *
   */
  function getListsFromDataContext() {
    let keys = Object.keys(globalData)
    let datasetListToShow = []
    let transformationListToShow = []
    let isSelectedDatasetInList = false
    let isSelectedTransformationInList = false
    keys.forEach((key) => {
      if (globalData[key].type !== "folder" && globalData[key].extension == "csv") {
        // datasetList
        datasetListToShow.push(globalData[key])
        if (selectedDataset && selectedDataset.name == globalData[key].name) {
          isSelectedDatasetInList = true
        }
        // transformationList
        if (globalData[key].path.includes("pca_transformations")) {
          transformationListToShow.push(globalData[key])
          if (selectedTransformation && selectedTransformation.name == globalData[key].name) {
            isSelectedTransformationInList = true
          }
        }
      }
    })
    setDatasetList(datasetListToShow)
    setTransformationList(transformationListToShow)
    if (!isSelectedDatasetInList) {
      setSelectedDataset(null)
    }
    if (!isSelectedTransformationInList) {
      setSelectedTransformation(null)
    }
  }

  /**
   * @description
   * This functions returns the DATA folder path
   */
  function getDataFolderPath() {
    let keys = Object.keys(globalData)
    keys.forEach((key) => {
      if (globalData[key].type == "folder" && globalData[key].name == "DATA" && globalData[key].parentID == "UUID_ROOT") {
        setDataFolderPath(globalData[key].path)
      }
    })
  }

  /**
   *
   * @param {CSV File} dataset
   *
   * @description
   * Called when the user select a dataset.
   *
   */
  async function datasetSelected(dataset) {
    setSelectedColumns([])
    let data = await dataset.loadDataFromDisk()
    setSelectedDataset(dataset)
    setDataframe(data)
  }

  /**
   *
   * @param {CSV File} dataset
   *
   * @description
   * Called when the user select a dataset.
   *
   */
  async function transformationSelected(dataset) {
    let data = await dataset.loadDataFromDisk()
    setSelectedTransformation(dataset)
    setDfTransformation(data)
  }

  /**
   * @description
   * Call the server to compute pca
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const computePCA = (overwrite = false) => {
    requestBackend(
      port,
      "/input/apply_pca/" + pageId,
      {
        selectedDatasetPath: selectedDataset.path,
        transformationPath: selectedTransformation.path,
        columns: selectedColumns,
        dataFolderPath: dataFolderPath,
        keepUnselectedColumns: keepUnselectedColumns,
        resultsFilename: PCAfilename,
        fileExtension: fileExtension,
        overwrite: overwrite,
        pageId: pageId,
        selectedDatasetName: selectedDataset.nameWithoutExtension
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          MedDataObject.updateWorkspaceDataObject()
          if (overwrite) {
            setSelectedDataset(null)
          }
          toast.success("Data saved under " + jsonResponse["results_path"])
        } else {
          toast.error(`Computation failed: ${jsonResponse.error.message}`)
          setError(jsonResponse.error)
        }
      },
      function (err) {
        console.error(err)
        toast.error(`Computation failed: ${err}`)
      }
    )
  }

  // Called when data in DataContext is updated, in order to update datasetList
  useEffect(() => {
    if (globalData !== undefined) {
      getListsFromDataContext()
      getDataFolderPath()
    }
  }, [globalData])

  // Called when selectedDataset is updated, in order to update filename
  useEffect(() => {
    if (selectedDataset) {
      setPCAfilename(selectedDataset.nameWithoutExtension + "_reduced_pca")
    } else {
      setPCAfilename("")
      setSelectedColumns([])
      setDataframe(null)
    }
  }, [selectedDataset])

  return (
    <>
      <div className="margin-top-15 center">
        <Message text="This tool enables you to perform Principal Component Analysis (PCA) on your selected data using an existing PCA transformation (which you can create using the Create PCA tool)." />
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        {/* Select CSV data */}
        <b>Select the transformation you want to apply</b>
        <div className="margin-top-15">
          {transformationList.length > 0 ? (
            <Dropdown
              value={selectedTransformation}
              options={transformationList}
              optionLabel="nameWithoutExtension"
              onChange={(event) => transformationSelected(event.value)}
              placeholder="Select a transformation"
            />
          ) : (
            <Dropdown placeholder="No transformation to show" disabled />
          )}
        </div>
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        {/* Select CSV data */}
        <b>Select the data you want to transform</b>
        <div className="margin-top-15">
          {datasetList.length > 0 ? (
            <Dropdown value={selectedDataset} options={datasetList} optionLabel="nameWithoutExtension" onChange={(event) => datasetSelected(event.value)} placeholder="Select a dataset" />
          ) : (
            <Dropdown placeholder="No dataset to show" disabled />
          )}
        </div>
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        {/* Select columns */}
        <b>Select the columns you want to apply PCA on</b>
        <div className="margin-top-15">
          {dataframe && dataframe.$columns && dataframe.$columns.length > 0 ? (
            <MultiSelect className="maxwidth-80" display="chip" value={selectedColumns} onChange={(e) => setSelectedColumns(e.value)} options={dataframe.$columns} placeholder="Select columns" />
          ) : (
            <MultiSelect placeholder="No columns to show" disabled />
          )}
        </div>
        {selectedColumns.length > 0 && dfTransformation?.$dataIncolumnFormat && selectedColumns.length != dfTransformation.$dataIncolumnFormat[0].length && (
          <div className="margin-top-15 center">
            <Message severity="warn" text="The number of selected columns doesn't match the number of coefficients in the transformation" />
          </div>
        )}
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        <b>Set your dataset options</b>
      </div>
      <div className="margin-top-15 flex-container-wrap">
        {/* Save data */}
        <div>
          Merge unselected columns in the result dataset &nbsp;
          <Checkbox onChange={(e) => setKeepUnselectedColumns(e.checked)} checked={keepUnselectedColumns}></Checkbox>
        </div>
      </div>
      <hr></hr>
      <div className="flex-container">
        <Message text="The Create option will save your dataset under DATA/reduced_features folder" />
      </div>
      <SaveDataset
        newDatasetName={PCAfilename}
        newDatasetExtension={fileExtension}
        selectedDataset={selectedDataset}
        setNewDatasetName={setPCAfilename}
        setNewDatasetExtension={setFileExtension}
        functionToExecute={computePCA}
        enabled={selectedColumns.length > 0 && dfTransformation?.$dataIncolumnFormat && selectedColumns.length == dfTransformation.$dataIncolumnFormat[0].length ? true : false}
        pathToCheckInto={dataFolderPath + MedDataObject.getPathSeparator() + "reduced_features"}
      />
      <hr></hr>
    </>
  )
}

export default ApplyPCA
