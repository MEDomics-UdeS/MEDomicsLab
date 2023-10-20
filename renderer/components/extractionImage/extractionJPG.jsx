import { DataContext } from "../workspace/dataContext"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { Message } from "primereact/message"
import React, { useContext, useEffect, useState } from "react"

const ExtractionJPG = () => {
  const [dataFolderList, setDataFolderList] = useState([])
  const [folderDepth, setFolderDepth] = useState(1)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const { globalData } = useContext(DataContext) // we get the global data from the context to retrieve the directory tree of the workspace, thus retrieving the data files

  /**
   *
   * @param {DataContext} dataContext
   * @param {number} depth
   *
   * @description
   * This functions get folder containing JGP files at depth.
   *
   */
  function findFoldersWithJPGFilesAtDepth(dataContext, depth) {
    function findFoldersRecursively(item, currentDepth) {
      const foldersWithMatchingFiles = []

      if (item.type === "folder") {
        if (currentDepth === depth) {
          // Look for matching files in this folder
          const containsMatchingFile = item.childrenIDs.some((childId) => dataContext[childId].type === "file" && dataContext[childId].extension === "jpg")
          if (containsMatchingFile) {
            foldersWithMatchingFiles.push(item)
          }
        } else {
          // Look in subfolders
          for (const childId of item.childrenIDs) {
            const childFolder = dataContext[childId]
            const childFolders = findFoldersRecursively(childFolder, currentDepth + 1)
            if (childFolders.length > 0) {
              // The subfolder contains matching files
              foldersWithMatchingFiles.push(item)
              break
            }
          }
        }
      }
      return foldersWithMatchingFiles
    }
    const topLevelFolders = Object.keys(dataContext).map((key) => dataContext[key])
    const foldersWithMatchingFiles = topLevelFolders.flatMap((item) => findFoldersRecursively(item, 0))
    setDataFolderList(foldersWithMatchingFiles)
  }

  // Called when data in DataContext is updated, in order to updated dataFolderList
  useEffect(() => {
    if (globalData !== undefined) {
      findFoldersWithJPGFilesAtDepth(globalData, folderDepth)
    }
  }, [globalData, folderDepth])

  return (
    <>
      <div className="margin-top-bottom-15 center">
        <div>
          {/* Select JPG data */}
          <h2>Select JPG data</h2>
          <Message severity="info" text="Your JPG data must be a folder containing one folder by patient" />
          <div className="flex-container margin-top-15">
            <div>
              Folder Depth : &nbsp;
              <InputNumber value={folderDepth} onValueChange={(e) => setFolderDepth(e.value)} size={1} showButtons min={1} />
            </div>
            <div>
              Folder for extraction : &nbsp;
              {dataFolderList.length > 0 ? <Dropdown value={selectedFolder} options={dataFolderList} optionLabel="name" onChange={(event) => setSelectedFolder(event.value)} placeholder="Select a Folder" /> : <Dropdown placeholder="No folder to show" disabled />}
            </div>
          </div>
        </div>
        <hr></hr>
      </div>
    </>
  )
}

export default ExtractionJPG
