/* eslint-disable no-undef */
import React, { useEffect, useState } from "react"
import { Image } from "primereact/image"
import MedDataObject from "../../../workspace/medDataObject"
import { modifyZipFileSync } from "../../../../utilities/customZipFile"
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

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
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    console.log("Synchronizing selectedResults999:", selectedResults);
    if (selectedResults.data) {
      let imagesInfos = []
      Object.entries(selectedResults.data).forEach(([modelName, path]) => {
        imagesInfos.push({ modelName: modelName, path: path })
      })
      createImages(imagesInfos)
    }
    if (selectedResults.final_metrics){
      console.log("final_metrics selectedResults999:", selectedResults.final_metrics)
      let localResults = selectedResults.final_metrics
      let results = localResults
      ? [
            { metricName: "AUC", mean: localResults?.mean_auc, std: localResults?.std_auc, min: localResults?.min_auc, max: localResults?.max_auc },
            { metricName: "Accuracy", mean: localResults?.mean_accuracy, std: localResults?.std_accuracy, min: localResults?.min_accuracy, max: localResults?.max_accuracy },
            { metricName: "F1 Score", mean: localResults?.mean_f1, std: localResults?.std_f1, min: localResults?.min_f1, max: localResults?.max_f1 },
            { metricName: "Precision", mean: localResults?.mean_precision, std: localResults?.std_precision, min: localResults?.min_precision, max: localResults?.max_precision },
            { metricName: "Recall", mean: localResults?.mean_recall, std: localResults?.std_recall, min: localResults?.min_recall, max: localResults?.max_recall },
        ] : [];
        setMetrics(results);
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
    <>
    <div>
        <h3>Outer Cross-Validation Results</h3>
        <DataTable value={metrics} responsiveLayout="scroll">
            <Column field="metricName" header="Metric" />
            <Column field="mean" header="Mean" />
            <Column field="std" header="St Deviation" />
            <Column field="min" header="Minimum" />
            <Column field="max" header="Maximum" />
        </DataTable>
    </div>
    <div className="height-100 width-100 flex-grid-gap-1rem">
      {images.map((image) => {
        return image
      })}
    </div>
    </>
  )
}

export default AnalyseResults
