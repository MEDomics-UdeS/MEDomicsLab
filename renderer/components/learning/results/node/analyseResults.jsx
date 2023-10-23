import React, { useEffect, useState } from "react"
import { Image } from "primereact/image"
import MedDataObject from "../../../workspace/medDataObject"
import { modifyZipFileSync } from "../../../../utilities/customZipFile"

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
  const [addedKeys, setAddedKeys] = useState([])

  /**
   *
   * @param {String} modelName The name of the model
   * @param {String} path The path of the image
   */
  const createImageFromZip = async (modelName, path) => {
    let zipPath = path.split(MedDataObject.getPathSeparator() + "tmp" + MedDataObject.getPathSeparator())[0]
    await modifyZipFileSync(zipPath + ".medml", async () => {
      !addedKeys.includes(modelName) &&
        images.push(
          <div key={modelName}>
            <Image src={getLocalImage(path)} alt="Image" height="250" indicatorIcon={<h5>{modelName}</h5>} preview downloadable />
          </div>
        ),
        setImages(images)
      addedKeys.push(modelName)
      setAddedKeys(...addedKeys)
    })
  }

  // Create the images from the zip files when the selected results change
  useEffect(() => {
    if (selectedResults.data) {
      Object.entries(selectedResults.data).forEach(async ([modelName, path]) => {
        if (!addedKeys.includes(modelName)) {
          await createImageFromZip(modelName, path)
        }
      })
    }
  }, [selectedResults.data, addedKeys])

  return (
    <div className="height-100 width-100 flex-grid-gap-1rem">
      {images.map((image) => {
        return image
      })}
    </div>
  )
}

export default AnalyseResults
