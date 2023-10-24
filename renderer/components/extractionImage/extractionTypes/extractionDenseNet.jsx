import { Checkbox } from "primereact/checkbox"
import { Dropdown } from "primereact/dropdown"
import React, { useEffect, useState } from "react"


/**
 *
 * @param {Function} setExtractionJsonData function setting data to send to the extraction_image server
 * @param {Function} setOptionsSelected function setting the boolean variable setOptionsSelected, telling if the choosen options are convenient for the extraction
 * @returns {JSX.Element} sub-component of the ExtractionJPG component
 *
 * @description
 * This component is displayed in the ExtractionJPG component when the user choose "DenseNet"
 * extraction type. It is used to select options for the DenseNet extraction.
 *
 */
const ExtractionDenseNet = ({ setExtractionJsonData, setOptionsSelected }) => {
  const [selectedFeaturesToGenerate, setSelectedFeaturesToGenerate] = useState(["denseFeatures"])
  const [selectedWeights, setSelectedWeights] = useState("densenet121-res224-chex")
  const [weightsList] = useState(["densenet121-res224-chex", "densenet121-res224-pc", "densenet121-res224-nih", "densenet121-res224-rsna", "densenet121-res224-all", "densenet121-res224-mimic_nb", "densenet121-res224-mimic_ch"])

  /**
   * 
   * @param {event} e 
   * 
   * @description
   * Called when features checkbox are checked / unchecked
   */
  const onFeaturesChange = (e) => {
    let selectedFeatures = [...selectedFeaturesToGenerate]

    if (e.checked) selectedFeatures.push(e.value)
    else selectedFeatures = selectedFeatures.filter((feature) => feature !== e.value)

    setSelectedFeaturesToGenerate(selectedFeatures)
  }

  // Called when options are modified
  useEffect(() => {
    if (selectedWeights != "" && selectedFeaturesToGenerate.length > 0) {
      setOptionsSelected(true)
    } else {
      setOptionsSelected(false)
    }
    setExtractionJsonData({ selectedWeights: selectedWeights, selectedFeaturesToGenerate: selectedFeaturesToGenerate })
  }, [selectedWeights, selectedFeaturesToGenerate])

  return (
    <>
      <div className="text-left margin-top-15">
        <div className="flex-container">
          <div>
            {/* DenseNet Weights */}
            <b>Select your model weights : &nbsp;</b>
            <hr></hr>
            <div className="margin-top-15">
              <Dropdown value={selectedWeights} options={weightsList} onChange={(event) => setSelectedWeights(event.value)} placeholder="Select your model weights" />
            </div>
          </div>
          <div className="vertical-divider"></div>
          <div>
            <div>
              {/* Features to generate */}
              <b>Select the features you want to generate &nbsp;</b>
              <hr></hr>
              <div className="margin-top-15">
                <Checkbox value={"denseFeatures"} onChange={onFeaturesChange} checked={selectedFeaturesToGenerate.some((item) => item === "denseFeatures")} />
                &nbsp; DenseFeatures
              </div>
              <div className="margin-top-15">
                <Checkbox value={"predictions"} onChange={onFeaturesChange} checked={selectedFeaturesToGenerate.some((item) => item === "predictions")} />
                &nbsp; Predictions
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExtractionDenseNet
