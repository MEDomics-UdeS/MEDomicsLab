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
import { InputText } from "primereact/inputtext"
import MedDataObject from "../../workspace/medDataObject"

/**
 * Component that renders the PCA feature reduction tool
 */
const PCA = () => {
  const [columnPrefix, setColumnPrefix] = useState("pca") // column prefix to set in the generated dataframe from PCA
  const [dataframe, setDataframe] = useState([]) // djanfo dataframe of data to apply PCA on
  const [datasetList, setDatasetList] = useState([]) // list of available datasets in DATA folder
  const [explainedVar, setExplainedVar] = useState([]) // ordered list of the computed explainedVar from the eigenvalues with their index
  const explainedVarColumns = [
    { field: "index", header: "Number of Principal Components" },
    { field: "value", header: "Explained Variance" }
  ]
  const [dataFolderPath, setDataFolderPath] = useState("") // DATA folder
  const [keepUnselectedColumns, setKeepUnselectedColumns] = useState(false) // wether to merge unselected pca columns in the result dataset
  const [PCAfilename, setPCAfilename] = useState("pca_dataset.csv") // name under which to save the computed PCA dataset
  const [resultsPath, setResultsPath] = useState(null) // path of the computed PCA dataset
  const [selectedColumns, setSelectedColumns] = useState([]) // columns to apply PCA on
  const [selectedDataset, setSelectedDataset] = useState(null) // dataset in which we want to apply PCA
  const [selectedPCRow, setSelectedPCRow] = useState(null) // row selected in the datatable for the number of principal components

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
    keys.forEach((key) => {
      if (globalData[key].type !== "folder" && globalData[key].extension == "csv") {
        datasetListToShow.push(globalData[key])
      }
    })
    setDatasetList(datasetListToShow)
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
   * @param {String} name
   *
   * @description
   * Called when the user change the name under which the computed
   * PCA dataset will be saved.
   *
   */
  const handleFilenameChange = (name) => {
    if (name.match("^[a-zA-Z0-9_]+.csv$") != null) {
      setPCAfilename(name)
    }
  }

  /**
   *
   * @param {String} name
   *
   * @description
   * Called when the user change the column prefix.
   *
   */
  const handleColumnPrefixChange = (name) => {
    if (name.match("^[a-zA-Z0-9_]+$") != null) {
      setColumnPrefix(name)
    }
  }

  /**
   * @description
   * Call the server to compute eigenvalues from the selected columns on
   * the selected dataset
   */
  const computeEigenvalues = () => {
    requestBackend(
      port,
      "/input/compute_eigenvalues/" + pageId,
      {
        csvPath: selectedDataset.path,
        columns: selectedColumns,
        pageId: pageId
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          let data = jsonResponse["explained_var"]
          setExplainedVar(data.map((value, index) => ({ index: index + 1, value })))
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
   * Call the server to compute pca
   */
  const computePCA = () => {
    requestBackend(
      port,
      "/input/compute_pca/" + pageId,
      {
        csvPath: selectedDataset.path,
        columns: selectedColumns,
        nComponents: selectedPCRow.index,
        dataFolderPath: dataFolderPath,
        columnPrefix: columnPrefix,
        keepUnselectedColumns: keepUnselectedColumns,
        resultsFilename: PCAfilename,
        pageId: pageId
      },
      (jsonResponse) => {
        console.log("received results:", jsonResponse)
        if (!jsonResponse.error) {
          setResultsPath(jsonResponse["results_path"])
          MedDataObject.updateWorkspaceDataObject()
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

  // Called when selected columns is updated, in order to update explained var
  useEffect(() => {
    setExplainedVar([])
  }, [selectedColumns])

  // Called when explained var is updated, in order to update selected PC row
  useEffect(() => {
    setSelectedPCRow(null)
  }, [explainedVar])

  // Called when the PCA form is updated in order to update result path
  useEffect(() => {
    setResultsPath(null)
  }, [selectedDataset, selectedColumns, explainedVar, keepUnselectedColumns, columnPrefix, PCAfilename])

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
        <b>Select the data you want to apply PCA on</b>
        <div className="margin-top-15">{datasetList.length > 0 ? <Dropdown value={selectedDataset} options={datasetList} optionLabel="name" onChange={(event) => datasetSelected(event.value)} placeholder="Select a dataset" /> : <Dropdown placeholder="No dataset to show" disabled />}</div>
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        {/* Select columns */}
        <b>Select the columns you want to apply PCA on</b>
        <div className="margin-top-15">{dataframe && dataframe.$columns && dataframe.$columns.length > 0 ? <MultiSelect className="maxwidth-80" display="chip" value={selectedColumns} onChange={(e) => setSelectedColumns(e.value)} options={dataframe.$columns} placeholder="Select columns" /> : <MultiSelect placeholder="No columns to show" disabled />}</div>
      </div>
      <div className="margin-top-15 center">
        {/* Compute eigenvalues */}
        <Button disabled={selectedColumns.length < 1} onClick={computeEigenvalues}>
          Compute eigenvalues
        </Button>
      </div>
      <hr></hr>
      <div className="margin-top-15 center">
        {/* Display explained variance and select number of principal components */}
        <b>Select the desired number of principal components</b>
        <div className="margin-top-15 maxwidth-80 mx-auto">
          <DataTable value={explainedVar} size={"small"} selectionMode="single" selection={selectedPCRow} onSelectionChange={(e) => setSelectedPCRow(e.value)} paginator rows={3}>
            {explainedVarColumns.map((col) => (
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
          Save PCA dataset as : &nbsp;
          <InputText value={PCAfilename} onChange={(e) => handleFilenameChange(e.target.value)} />
        </div>
        <div>
          {/* Text input for column names */}
          Column name prefix : &nbsp;
          <InputText value={columnPrefix} onChange={(e) => handleColumnPrefixChange(e.target.value)} />
        </div>
        <div>
          <Button disabled={!selectedPCRow} onClick={computePCA}>
            Compute PCA dataset
          </Button>
        </div>
      </div>
      {resultsPath && (
        <div className="margin-top-15 center">
          <Message severity="success" text={"Data saved under " + resultsPath} />
        </div>
      )}
      <hr></hr>
    </>
  )
}

export default PCA
