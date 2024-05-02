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
import SaveDataset from "../../generalPurpose/saveDataset"

/**
 * Component that renders the CreatePCA feature reduction tool
 */
const CreatePCA = () => {
  const [columnPrefix, setColumnPrefix] = useState("pca") // column prefix to set in the generated dataframe from PCA
  const [dataframe, setDataframe] = useState([]) // djanfo dataframe of data to apply PCA on
  const [datasetList, setDatasetList] = useState([]) // list of available datasets
  const [explainedVar, setExplainedVar] = useState([]) // ordered list of the computed explainedVar from the eigenvalues with their index
  const explainedVarColumns = [
    { field: "index", header: "Number of Principal Components" },
    { field: "value", header: "Explained Variance" }
  ]
  const [dataFolderPath, setDataFolderPath] = useState("") // DATA folder
  const [exportTransformation, setExportTransformation] = useState(false) // Wether to export the transformation or not
  const [fileExtension, setFileExtension] = useState("csv") // on which extension to save the file
  const [keepUnselectedColumns, setKeepUnselectedColumns] = useState(false) // wether to merge unselected pca columns in the result dataset
  const [PCAfilename, setPCAfilename] = useState("") // name under which to save the computed PCA dataset
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
          if (data.length > 0) {
            if (typeof data[0] != "number") {
              setExplainedVar(data.map((value, index) => ({ index: index + 1, value: value.real + "i + " + value.imaginary + "j" })))
            } else {
              setExplainedVar(data.map((value, index) => ({ index: index + 1, value })))
            }
          }
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
   * @param {Boolean} overwrite - True if the dataset should be overwritten, false otherwise
   */
  const applyPCA = (overwrite = false) => {
    requestBackend(
      port,
      "/input/apply_pca/" + pageId,
      {
        csvPath: selectedDataset.path,
        columns: selectedColumns,
        nComponents: selectedPCRow.index,
        dataFolderPath: dataFolderPath,
        columnPrefix: columnPrefix,
        keepUnselectedColumns: keepUnselectedColumns,
        resultsFilename: PCAfilename,
        fileExtension: fileExtension,
        overwrite: overwrite,
        pageId: pageId,
        exportTransformation: exportTransformation,
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
          if (jsonResponse["pca_path"]) {
            toast.success("Transformation saved under " + jsonResponse["pca_path"])
          }
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
      setPCAfilename(selectedDataset.nameWithoutExtension + "_reduced_pca")
    } else {
      setPCAfilename("")
      setSelectedColumns([])
      setDataframe([])
    }
  }, [selectedDataset])

  // Called when selected columns is updated, in order to update explained var
  useEffect(() => {
    setExplainedVar([])
  }, [selectedColumns])

  // Called when explained var is updated, in order to update selected PC row
  useEffect(() => {
    setSelectedPCRow(null)
  }, [explainedVar])

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
          Export transformation &nbsp;
          <Checkbox onChange={(e) => setExportTransformation(e.checked)} checked={exportTransformation}></Checkbox>
        </div>
        <div>
          {/* Text input for column names */}
          Column name prefix : &nbsp;
          <InputText value={columnPrefix} onChange={(e) => handleColumnPrefixChange(e.target.value)} />
        </div>
      </div>
      {exportTransformation && selectedPCRow && selectedDataset && (
        <div className="flex-container">
          <Message
            text={`The transformation will be saved under DATA/reduced_features/pca_tranformations/pca_transformation_${selectedDataset.nameWithoutExtension}_${selectedPCRow.index}.${fileExtension}`}
          />
        </div>
      )}
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
        functionToExecute={applyPCA}
        enabled={selectedPCRow ? true : false}
        pathToCheckInto={dataFolderPath + MedDataObject.getPathSeparator() + "reduced_features"}
      />
      <hr></hr>
    </>
  )
}

export default CreatePCA
