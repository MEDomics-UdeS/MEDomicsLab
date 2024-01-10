import React, { useContext, useEffect, useState } from "react"
import Button from "react-bootstrap/Button"
import { DataContext } from "../../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import { ErrorRequestContext } from "../../generalPurpose/errorRequestContext"
import { MultiSelect } from "primereact/multiselect"
import { requestBackend } from "../../../utilities/requests"
import { PageInfosContext } from "../../mainPages/moduleBasics/pageInfosContext"
import { toast } from "react-toastify"
import { WorkspaceContext } from "../../workspace/workspaceContext"

const PCA = () => {
  const [selectedColumns, setSelectedColumns] = useState([]) // columns to apply PCA on
  const [dataframe, setDataframe] = useState([]) // djanfo dataframe of data to apply PCA on
  const [datasetList, setDatasetList] = useState([]) // list of available datasets in DATA folder
  const [selectedDataset, setSelectedDataset] = useState(null) // dataset in which we want to apply PCA

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
          console.log(jsonResponse)
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
      getDatasetListFromDataContext()
    }
  }, [globalData])

  return (
    <>
      <div className="margin-top-bottom-15 center">
        {/* Select CSV data */}
        <p>Select the data you want to apply PCA on</p>
        {datasetList.length > 0 ? <Dropdown value={selectedDataset} options={datasetList} optionLabel="name" onChange={(event) => datasetSelected(event.value)} placeholder="Select a dataset" /> : <Dropdown placeholder="No dataset to show" disabled />}
      </div>
      <hr></hr>
      <div className="margin-top-bottom-15 center">
        {/* Select columns */}
        <p>Select the columns you want to apply PCA on</p>
        {dataframe && dataframe.$columns && dataframe.$columns.length > 0 ? <MultiSelect value={selectedColumns} onChange={(e) => setSelectedColumns(e.value)} options={dataframe.$columns} placeholder="Select columns" /> : <MultiSelect placeholder="No columns to show" disabled />}
      </div>
      <hr></hr>
      <div className="margin-top-bottom-15 center">
        <Button disabled={selectedColumns.length < 1} onClick={computeEigenvalues}>
          Compute eigenvalues
        </Button>
      </div>
      <hr></hr>
    </>
  )
}

export default PCA
