/* eslint-disable no-undef */
import React, { useEffect, useState } from "react"
import { Image } from "primereact/image"
import MedDataObject from "../../../workspace/medDataObject"
import { modifyZipFileSync } from "../../../../utilities/customZipFile"

/**
 *
 * @param {String} src An absolute path to the image
 * @returns
 */
const getLocalImageSync = (src) => {
  return new Promise((resolve) => {
    const nativeImage = require("electron").nativeImage
    const image = nativeImage.createFromPath(src)
    resolve(image.toDataURL())
  })
}

/**
 *
 * @param {Object} selectedResults The selected results
 * @returns {JSX.Element} The AnalyseResults component
 */
const AnalyseResults = ({ selectedResults }) => {
  const [images, setImages] = useState([])

  useEffect(() => {
    if (selectedResults.data) {
      let imagesInfos = []
      Object.entries(selectedResults.data).forEach(([modelName, path]) => {
        imagesInfos.push({ modelName: modelName, path: path })
      })
      createImages(imagesInfos)
    }
  }, [selectedResults])

  /**
   *
   * @param {List} imagesInfos The list of images infos
   * @description - This function is used to create the images
   *
   * @returns {JSX.Element} The AnalyseResults component
   */
  const createImages = (imagesInfos) => {
    if (imagesInfos.length != 0) {
      let zipPath = imagesInfos[0].path.split(MedDataObject.getPathSeparator() + "tmp" + MedDataObject.getPathSeparator())[0]
      modifyZipFileSync(zipPath + ".medml", () => {
        return new Promise((resolve) => {
          let promises = imagesInfos.map(({ modelName, path }) => {
            return getLocalImageSync(path).then((imageUrl) => {
              return {
                key: modelName,
                imageUrl: imageUrl
              }
            })
          })
          Promise.all(promises)
            .then((results) => {
              let images = results.map(({ key, imageUrl }) => (
                <div key={key}>
                  <Image src={imageUrl} alt="Image" height="250" indicatorIcon={<h5>{key}</h5>} preview downloadable />
                </div>
              ))
              setImages(images)
            })
            .catch((error) => {
              console.log(error)
            })
          resolve()
        })
      }).then(() => {
        // No operation needed, there for debugging purposes
      })
    }
  }

  return (
    <div className="height-100 width-100 flex-grid-gap-1rem">
      {images.map((image) => {
        return image
      })}
    </div>
  )
}

export default AnalyseResults
