import React, { useEffect, useState } from "react"
import { Image } from "primereact/image"
import MedDataObject from "../../../workspace/medDataObject"
import {modifyZipFileSync} from "../../../../utilities/customZipFile"

const getLocalImage = (src) => {
  const nativeImage = require("electron").nativeImage
  const image = nativeImage.createFromPath(src)
  return image.toDataURL()
}

/**
 *
 * @param {Object} selectedResults The selected results
 * @returns {JSX.Element} The AnalyseResults component
 */
const AnalyseResults = ({ selectedResults }) => {
  const [images, setImages] = useState([])

  const createImageFromZip = (modelName,path) => {
   let zipPath = path.split(MedDataObject.getPathSeparator()+"tmp"+MedDataObject.getPathSeparator())[0]
   console.log("zipPath", zipPath+".medml")
   modifyZipFileSync(zipPath+".medml", () => {
    setImages(images => [...images,
     <div key={modelName}>
      <Image src={getLocalImage(path)} alt="Image" height="250" indicatorIcon={<h5>{modelName}</h5>} preview downloadable />
    </div>])
    })
  }

  useEffect(() => {
    if (selectedResults.data) {
      setImages([])
    Object.entries(selectedResults.data).forEach(([modelName, path]) => {
        console.log("modelName", modelName, "path", path)
        createImageFromZip(modelName,path)
      })
    }
  }, [selectedResults.data])

  return (
    <div className="height-100 width-100 flex-grid-gap-1rem">
      {images.map((image) => {
        return (
          image
        )
      })}
    </div>
  )
}

export default AnalyseResults
