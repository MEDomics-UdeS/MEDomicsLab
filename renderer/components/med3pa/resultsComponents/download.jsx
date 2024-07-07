import React from "react"
import { Panel, getNodesBounds, getViewportForBounds, useReactFlow } from "reactflow"
import { toPng } from "html-to-image"
import { GoDownload } from "react-icons/go"
import Tooltip from "@mui/material/Tooltip"
import { IconButton } from "@mui/material"

function DownloadButton() {
  const { getNodes } = useReactFlow()

  const imageWidth = 6000 // Example: Increase width for larger image
  const imageHeight = 3000 // Example: Increase height for larger image

  const onClick = () => {
    const nodesBounds = getNodesBounds(getNodes())
    const { x, y, zoom } = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.4, 2)

    function downloadImage(dataUrl) {
      const a = document.createElement("a")
      a.setAttribute("download", "reactflow.png")
      a.setAttribute("href", dataUrl)
      a.click()
    }

    toPng(document.querySelector(".react-flow__viewport"), {
      backgroundColor: "white",
      width: imageWidth,
      height: imageHeight,
      imageSmoothingEnabled: true, // Enable anti-aliasing
      style: {
        transform: `translate(${x}px, ${y}px) scale(${zoom})`
      }
    }).then(downloadImage)
  }

  return (
    <Panel position="top-right">
      <Tooltip title="Save as image">
        <IconButton onClick={onClick}>
          <GoDownload style={{ cursor: "pointer", fontSize: "2rem" }} />
        </IconButton>
      </Tooltip>
    </Panel>
  )
}

export default DownloadButton
