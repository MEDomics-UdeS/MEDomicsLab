import React, { useState, useEffect } from "react"
import { Panel, getNodesBounds, getViewportForBounds } from "reactflow"
import { toPng, toSvg } from "html-to-image"
import { GoDownload } from "react-icons/go"
import Tooltip from "@mui/material/Tooltip"
import { IconButton } from "@mui/material"
import JSZip from "jszip"
import download from "downloadjs"

/**
 *
 * @param {Object} reactFlowInstance The instance of React Flow.
 * @param {Object} reactFlowRef A reference to the React Flow DOM element.
 * @returns {JSX.Element} The DownloadButton component.
 *
 *
 * @description
 * This component renders a button that allows users to download the current React Flow diagram and
 * corresponding legend as a ZIP file.
 */
function DownloadButton({ reactFlowInstance, reactFlowRef }) {
  const [imagesLoaded, setImagesLoaded] = useState(false)

  const imageWidth = 6000 // Increase width for larger image
  const imageHeight = 3000 // Increase height for larger image

  // Trigger the download process once the images are loaded.
  useEffect(() => {
    if (imagesLoaded) {
      handleDownload()
    }
  }, [imagesLoaded])

  /**
   *
   * @returns {void}
   *
   *
   * @description
   * This function captures images of the React Flow viewport and legend (if available),
   * adds them to a ZIP file, and triggers the download of the ZIP file.
   */
  const handleDownload = () => {
    const nodesBounds = getNodesBounds(reactFlowInstance.getNodes())
    const { x, y, zoom } = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.4, 2)

    const zip = new JSZip()

    // Function to add a file to the ZIP archive
    const addToZip = (fileName, dataUrl) => {
      if (!dataUrl) {
        console.error(`No data URL for ${fileName}`)
        return
      }

      // Handle SVG data URL directly
      if (fileName.endsWith(".svg")) {
          const svgData = decodeURIComponent(dataUrl.split(",")[1]);
          zip.file(fileName, svgData);
      } else {
        // For PNG or other formats
        const base64Data = dataUrl.split("base64,")[1]
        zip.file(fileName, base64Data, { base64: true })
      }
    }

    // Function to initiate the ZIP download
    const downloadZip = () => {
      zip.generateAsync({ type: "blob" }).then((content) => {
        download(content, "Profiles_tree.zip")
      })
    }

    // Capture React Flow viewport image
    toSvg(reactFlowRef.querySelector(".react-flow__viewport"), {
      width: imageWidth,
      height: imageHeight,
      imageSmoothingEnabled: true,
      style: {
        transform: `translate(${x}px, ${y}px) scale(${zoom})`
      }
    })
      .then((dataUrl) => {
        addToZip("Profiles_tree.svg", dataUrl)
        const legendItems = reactFlowRef.querySelector(".legend-container")

        if (legendItems) {
          return toSvg(legendItems)
        } else {
          return Promise.resolve(null) // Return a resolved promise if legend-items don't exist
        }
      })
      .then((dataUrl) => {
        if (dataUrl) {
          addToZip("Legend_Threshold.svg", dataUrl)
        }
        // Initiate ZIP download when all images are added
        downloadZip()
        setImagesLoaded(false)
      })
      .catch((error) => {
        console.error("Error capturing images or downloading ZIP:", error)
      })
  }

  // Use this function to set imagesLoaded to true when images are loaded
  const handleImagesLoaded = () => {
    setImagesLoaded(true)
  }

  return (
    <Panel position="top-right">
      <Tooltip title="Save as ZIP">
        <IconButton onClick={handleImagesLoaded}>
          <GoDownload
            style={{
              cursor: "pointer",
              fontSize: "2rem",
              color: imagesLoaded ? "green" : "grey"
            }}
          />
        </IconButton>
      </Tooltip>

      <button onClick={handleImagesLoaded} style={{ display: "none" }} onLoad={() => setImagesLoaded(true)}>
        Trigger Images Loaded
      </button>
    </Panel>
  )
}

export default DownloadButton
