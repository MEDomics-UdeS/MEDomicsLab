import React from "react"
import { Panel, useReactFlow } from "reactflow"
import { toPng } from "html-to-image"
import { GoDownload } from "react-icons/go"
import Tooltip from "@mui/material/Tooltip"
import { IconButton } from "@mui/material"

function DownloadButton() {
  const { getNodes, fitView } = useReactFlow()

  const onClick = () => {
    const imageWidth = fitView ? fitView.width + 500 : 2048
    const imageHeight = fitView ? fitView.height + 500 : 1536

    const nodes = getNodes()
    if (!nodes || nodes.length === 0) {
      console.error("No nodes found.")
      return
    }

    // Example width and height

    // Adjust scale factor to make nodes bigger

    // Convert .react-flow__viewport to PNG image
    toPng(document.querySelector(".react-flow__viewport"), {
      backgroundColor: "white",
      imageHeight: imageHeight,
      imageWidth: imageWidth,
      style: {
        imageSmoothingEnabled: true
      }
    })
      .then((dataUrl) => {
        // Create a link element to trigger the download
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = "reactflow.png"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
      .catch((error) => {
        console.error("Error generating PNG:", error)
      })
  }

  return (
    <Panel position="top-right">
      <Tooltip title="Save as image">
        <IconButton>
          <GoDownload
            onClick={onClick}
            style={{ cursor: "pointer", fontSize: "2rem" }} // Larger size for the icon
          />
        </IconButton>
      </Tooltip>
    </Panel>
  )
}

export default DownloadButton
