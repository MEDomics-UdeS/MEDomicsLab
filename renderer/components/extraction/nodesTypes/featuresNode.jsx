// Feature node component represents a radiomic feature family
// The node specific settings are only shown if the user need to select distinct parameters for the feature family
// The default settings are always a list of checkboxes for each feature in the feature family and are shown in the offcanvas
import React, { useState, useEffect, useCallback, useMemo, use } from "react"
import Node from "../../flow/node"
import { Form } from "react-bootstrap"
/**
 *
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A FeaturesNode node
 *
 * @description
 *
 */

const FeaturesNode = ({ id, data, type }) => {
  const features = useMemo(
    () =>
      Object.keys(
        data.setupParam.possibleSettings.defaultSettings.associatedFeatures
      ),
    []
  )

  const [selectedFeatures, setSelectedFeatures] = useState(
    data.internal.settings.features
  )

  useEffect(() => {
    if (selectedFeatures.length === features.length) {
      setSelectedFeatures(["extract_all"])
    }

    // Update the node data
    data.internal.settings.features = selectedFeatures

    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [selectedFeatures])

  const handleToggleAll = useCallback((event) => {
    const isChecked = event.target.checked
    const updatedSelectedFeatures = isChecked ? ["extract_all"] : []
    setSelectedFeatures(updatedSelectedFeatures)
  }, [])

  const handleToggleFeature = useCallback((event) => {
    const feature = event.target.value
    const isChecked = event.target.checked

    setSelectedFeatures((prevSelectedFeatures) => {
      if (isChecked) {
        return [...prevSelectedFeatures, feature]
      } else {
        // A feature is getting unchecked and the previous state was "extract_all"
        if (prevSelectedFeatures.length === 1) {
          prevSelectedFeatures = [...features]
        }
        return prevSelectedFeatures.filter(
          (selectedFeature) => selectedFeature !== feature
        )
      }
    })
  }, [])

  // Keeps the value of select_all checkbox up to date
  const isAllChecked = selectedFeatures.length === features.length

  // Called when the form is changed, updates the node data
  useEffect(() => {
    data.internal.settings.associatedFeatures = {
      associatedFeatures: selectedFeatures
    }
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [selectedFeatures])

  // Function used to update the node body when the distance correction or the merge method is changed
  const updateNodeBody = useCallback(
    (event) => {
      const name = event.target.name
      const value = event.target.value

      data.internal.settings[name] = value
      data.parentFct.updateNode({
        id: id,
        updatedData: data.internal
      })
    },
    [
      data.internal.settings.merge_method,
      data.internal.settings.dist_correction
    ]
  )

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        type={type}
        setupParam={data.setupParam}
        nodeBody={
          data.internal.type === "glcm" || data.internal.type === "glrlm" ? (
            <>
              <Form className="features-node-body">
                <Form.Label style={{ marginBottom: "0px" }}>
                  Distance correction :
                </Form.Label>
                <Form.Control
                  as="select"
                  name="dist_correction"
                  value={data.internal.settings.dist_correction || "false"}
                  onChange={updateNodeBody}
                  className="form-control-sm"
                >
                  <option value="false">False</option>
                  <option value="true"> True </option>
                  <option value="manhattan"> Manhattan </option>
                  <option value="euclidean"> Euclidean </option>
                  <option value="chebyshev"> Chebyshev </option>
                </Form.Control>

                <Form.Label style={{ marginBottom: "0px" }}>
                  Merge method :
                </Form.Label>
                <Form.Control
                  as="select"
                  name="merge_method"
                  value={data.internal.settings.merge_method || "vol_merge"}
                  onChange={updateNodeBody}
                  className="form-control-sm"
                >
                  <option value="vol_merge">Volume merge</option>
                  <option value="slice_merge"> Slice merge </option>
                  <option value="dir_merge"> Direction merge </option>
                  <option value="average"> Average </option>
                </Form.Control>
              </Form>
            </>
          ) : null
        }
        nodeSpecific={
          <>
            <Form.Check
              type="checkbox"
              label="Select all"
              checked={isAllChecked || selectedFeatures[0] === "extract_all"}
              onChange={handleToggleAll}
            />

            {features.map((feature) => (
              <Form.Check
                key={feature}
                type="checkbox"
                label={
                  data.setupParam.possibleSettings.defaultSettings
                    .associatedFeatures[feature]
                }
                value={feature}
                checked={
                  selectedFeatures.includes(feature) ||
                  selectedFeatures[0] === "extract_all"
                }
                onChange={handleToggleFeature}
              />
            ))}
          </>
        }
      />
    </>
  )
}

export default FeaturesNode
