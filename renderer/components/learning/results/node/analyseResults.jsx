import React from "react"
import { Image } from "primereact/image"
// import Image from "next/image"

const getLocalImage = (src) => {
  const nativeImage = require("electron").nativeImage
  const image = nativeImage.createFromPath(src)
  console.log(image)
  return image.toDataURL()
}

/**
 *
 * @param {Object} selectedResults The selected results
 * @returns {JSX.Element} The AnalyseResults component
 */
const AnalyseResults = ({ selectedResults }) => {
  return (
    <div className="height-100 width-100 flex-grid-gap-1rem">
      {Object.entries(selectedResults.data).map(([modelName, path]) => {
        return (
          <div key={modelName}>
            <Image src={getLocalImage(path)} alt="Image" height="250" indicatorIcon={<h5>{modelName}</h5>} preview downloadable />
          </div>
        )
      })}
    </div>
  )
}

export default AnalyseResults
