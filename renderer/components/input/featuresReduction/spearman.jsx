import React, { useContext, useEffect, useState } from "react"
import Button from "react-bootstrap/Button"
import { Checkbox } from "primereact/checkbox"
import { Column } from "primereact/column"
import { DataContext } from "../../workspace/dataContext"
import { DataTable } from "primereact/datatable"
import { Dropdown } from "primereact/dropdown"
import { ErrorRequestContext } from "../../generalPurpose/errorRequestContext"
import { Message } from "primereact/message"
import { MultiSelect } from "primereact/multiselect"
import { requestBackend } from "../../../utilities/requests"
import { PageInfosContext } from "../../mainPages/moduleBasics/pageInfosContext"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../../workspace/workspaceContext"
import MedDataObject from "../../workspace/medDataObject"
import SaveDataset from "../../generalPurpose/saveDataset"

/**
 * Component that renders the Spearman feature reduction creation tool
 */
const Spearman = () => {
  const [dataframe, setDataframe] = useState([]) // djanfo dataframe of data to apply Spearman on
  const [datasetList, setDatasetList] = useState([]) // list of available datasets in DATA folder
  const [correlations, setCorrelations] = useState([]) // ordered list of dict of the computed correlations
  const correlationsColumns = [
    { field: "index", header: "Column Name" },
    { field: "value", header: "Correlation with target" }
  ]
  const [dataFolderPath, setDataFolderPath] = useState("") // DATA folder
  const [fileExtension, setFileExtension] = useState("csv") // on which extension to save the file
  const [keepUnselectedColumns, setKeepUnselectedColumns] = useState(false) // wether to merge unselected pca columns in the result dataset
  const [keepTarget, setKeepTarget] = useState(false) // wether to merge target in the result dataset
  const [spearmanFilename, setSpearmanFilename] = useState("") // name under which to save the computed PCA dataset
  const [selectedColumns, setSelectedColumns] = useState([]) // columns to apply PCA on
  const [selectedDataset, setSelectedDataset] = useState(null) // dataset in which we want to apply Spearman
  const [selectedSpearmanRows, setSelectedSpearmanRows] = useState([]) // rows selected in the datatable for the columns to keep
  const [selectedTarget, setSelectedTarget] = useState(null) // target column for Spearman

  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files
  const { pageId } = useContext(PageInfosContext) // used to get the pageId
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { setError } = useContext(ErrorRequestContext) // used to diplay the errors

  /**
   *
   * @description
   * This functions get all csv files from the DataContext and update datasetList.
   *
   */
  function getDatasetListFromDataContext() {
    let keys = Object.keys(globalData)
    let datasetListToShow = []
    let isSelectedDatasetInList = false
    keys.forEach((key) => {
      if (globalData[key].type !== "folder" && globalData[key].extension == "csv") {
        datasetListToShow.push(globalData[key])
        if (selectedDataset && selectedDataset.name == globalData[key].name) {
          isSelectedDatasetInList = true
        }
      }
    })
    setDatasetList(datasetListToShow)
    if (!isSelectedDatasetInList) {
      setSelectedDataset(null)
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
   * @description
   * Call the server to compute eigenvalues from the selected columns on
   * the selected dataset
   */
  const computeCorrelations = () => {
    requestBackend(
      port,
      "/input/compute_correlations/" + pageId,
      {
        csvPath: selectedDataset.path,
        columns: selectedColumns,
        target: selectedTarget,
        pageId: pageId
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          let data = jsonResponse["correlations"]
          setCorrelations(
            Object.keys(data).map((key) => ({
              index: key,
              value: data[key]
            }))
          )
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

  /**
   * @description
   * Call the server to compute Spearman
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const computeSpearman = (overwrite = false) => {
    requestBackend(
      port,
      "/input/compute_spearman/" + pageId,
      {
        csvPath: selectedDataset.path,
        selectedColumns: selectedColumns,
        selectedSpearmanRows: selectedSpearmanRows,
        selectedTarget: selectedTarget,
        dataFolderPath: dataFolderPath,
        keepUnselectedColumns: keepUnselectedColumns,
        keepTarget: keepTarget,
        resultsFilename: spearmanFilename,
        fileExtension: fileExtension,
        overwrite: overwrite,
        pageId: pageId
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

  // Called when selectedDataset is updated, in order to update filename
  useEffect(() => {
    if (selectedDataset) {
      setSpearmanFilename(selectedDataset.nameWithoutExtension + "_reduced_spearman")
    } else {
      setSpearmanFilename("")
      setSelectedColumns([])
      setSelectedTarget(null)
      setDataframe([])
    }
  }, [selectedDataset])

  // Called when selected columns is updated, in order to update explained var
  useEffect(() => {
    setCorrelations([])
  }, [selectedColumns])

  // Called when explained var is updated, in order to update selected Spearman row
  useEffect(() => {
    setSelectedSpearmanRows([])
  }, [correlations])

  // Called when data in DataContext is updated, in order to update datasetList
  useEffect(() => {
    if (globalData !== undefined) {
      getDatasetListFromDataContext()
      getDataFolderPath()
    }
  }, [globalData])

  return (
    <>
      <div className="margin-top-15 center">
        {/* Select CSV data */}
        <b>Select the data you want to apply Spearman on</b>
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
        <div>
          <b>Select the columns you want to apply Spearman on (without target)</b>
          <div className="margin-top-15">
            {dataframe && dataframe.$columns && dataframe.$columns.length > 0 ? (
              <MultiSelect className="maxwidth-80" display="chip" value={selectedColumns} onChange={(e) => setSelectedColumns(e.value)} options={dataframe.$columns} placeholder="Select columns" />
            ) : (
              <MultiSelect placeholder="No columns to show" disabled />
            )}
          </div>
        </div>
        <div className="margin-top-15">
          <b>Select the target column</b>
          <div className="margin-top-15">
            {dataframe && dataframe.$columns && dataframe.$columns.length > 0 ? (
              <Dropdown value={selectedTarget} options={dataframe.$columns} onChange={(event) => setSelectedTarget(event.value)} placeholder="Select column" />
            ) : (
              <Dropdown placeholder="No columns to show" disabled />
            )}
          </div>
        </div>
      </div>
      <div className="margin-top-15 center">
        {/* Compute eigenvalues */}
        <Button disabled={selectedColumns.length < 1 || !selectedTarget} onClick={computeCorrelations}>
          Compute correlations
        </Button>
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        {/* Display explained variance and select number of principal components */}
        <b>Select columns to keep</b>
        <div className="margin-top-15 maxwidth-80 mx-auto">
          <DataTable value={correlations} size={"small"} selectionMode="checkbox" selection={selectedSpearmanRows} onSelectionChange={(e) => setSelectedSpearmanRows(e.value)} paginator rows={3}>
            <Column selectionMode="multiple"></Column>
            {correlationsColumns.map((col) => (
              <Column key={col.field} field={col.field} header={col.header} />
            ))}
          </DataTable>
        </div>
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
        <div>
          Keep target in dataset &nbsp;
          <Checkbox onChange={(e) => setKeepTarget(e.checked)} checked={keepTarget}></Checkbox>
        </div>
      </div>
      <hr></hr>
      <div className="flex-container">
        <Message text="The Create option will save your dataset under DATA/reduced_features folder" />
      </div>
      <SaveDataset
        newDatasetName={spearmanFilename}
        newDatasetExtension={fileExtension}
        selectedDataset={selectedDataset}
        setNewDatasetName={setSpearmanFilename}
        setNewDatasetExtension={setFileExtension}
        functionToExecute={computeSpearman}
        enabled={selectedSpearmanRows.length > 0 ? true : false}
        pathToCheckInto={dataFolderPath + MedDataObject.getPathSeparator() + "reduced_features"}
      />
      <hr></hr>
    </>
  )
}

export default Spearman
