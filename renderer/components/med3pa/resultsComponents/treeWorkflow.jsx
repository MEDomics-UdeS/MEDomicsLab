import React, { useState, useEffect } from "react"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import { Typography } from "@mui/material"
import fs from "fs"
import path from "path"

const TreeWorkflow = ({ filePath }) => {
  const [treeData, setTreeData] = useState({})

  useEffect(() => {
    const loadJsonFiles = () => {
      if (!filePath) return

      try {
        const filenames = fs.readdirSync(filePath)
        const jsonFiles = filenames.filter((filename) => filename.endsWith(".json"))

        const loadedFiles = jsonFiles.reduce((acc, filename) => {
          const jsonPath = path.join(filePath, filename)
          const fileContent = loadJsonPath(jsonPath)
          if (fileContent) {
            acc[filename.replace(".json", "")] = fileContent
          }
          return acc
        }, {})

        setTreeData(loadedFiles)
      } catch (error) {
        console.error("Error loading JSON files:", error)
      }
    }

    loadJsonFiles()
  }, [filePath])

  return (
    <div className="card">
      <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem" }}>
        Profiles Tree
        <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />
      </Typography>
      <ul>
        {Object.keys(treeData).map((fileName) => (
          <li key={fileName}>{fileName}</li>
        ))}
      </ul>
    </div>
  )
}

export default TreeWorkflow
