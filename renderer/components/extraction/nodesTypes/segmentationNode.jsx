import React, { useState, useEffect, useCallback } from "react"
import Node from "../../flow/node"
import ViewButton from "../buttonsTypes/viewButton"
import { Container, Row, Col, Table, Alert } from "react-bootstrap"
import { toast } from "react-toastify"

const SegmentationNode = ({ id, data, type }) => {
  const [selectedRois, setSelectedRois] = useState(data.internal.settings.rois)
  const [shouldUpdateRois, setShouldUpdateRois] = useState(false)

  useEffect(() => {
    let newSelectedRois = {}
    if (
      data.internal.settings.rois &&
      Object.keys(data.internal.settings.rois).length > 0
    ) {
      for (const roiNumber in data.internal.settings.rois) {
        newSelectedRois[data.internal.settings.rois[roiNumber]] = "2"
      }
    }
    setSelectedRois(newSelectedRois)
  }, [data.internal.settings.rois])

  const handleRadioChange = useCallback(
    (event, currentRoi) => {
      try {
        if (event.target.value === "1") {
          const isPositiveRoiSelected = Object.values(selectedRois).some(
            (value) => value === "0"
          )
          if (!isPositiveRoiSelected) {
            throw new Error("At least one ROI should be positive.")
          }
        }

        setSelectedRois((prevRoisList) => ({
          ...prevRoisList,
          [currentRoi]: event.target.value
        }))

        setShouldUpdateRois(true)
      } catch (error) {
        // Show toast error to the user
        toast.warn(error.message, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        })
      }
    },
    [selectedRois]
  )

  useEffect(() => {
    if (shouldUpdateRois) {
      getRoisSelection() // Call getRoisSelection when shouldUpdateRois is true
      setShouldUpdateRois(false)
    }
  }, [shouldUpdateRois])

  const getRoisSelection = useCallback(() => {
    let roisString = ""
    let positiveRois = ""
    let negativeRois = ""

    for (const roi in selectedRois) {
      if (selectedRois[roi] === "0") {
        // If the ROI is positive, add it to positive_rois
        positiveRois += "+{" + roi + "}"
      } else if (selectedRois[roi] === "1") {
        // If the ROI is negative, add it to negative_rois
        negativeRois += "-{" + roi + "}"
      }
    }

    // Note: There should be at least one positive ROI since it is checked upon clicking on a radio button
    // ROI list is the concatenation of the strings positive_rois and negative_rois
    // Since the string starts with the positive rois, remove the first + character to be compliant with MEDimage's notation
    roisString = (positiveRois + negativeRois).substring(1)

    console.log("ROIS SELECTED : ", roisString)
    // Add the ROI list to the node's data
    data.internal.settings["rois_data"] = roisString
    // And set changeView to true to update the view
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [selectedRois, id, data.internal, data.parentFct])

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        type={type}
        setupParam={data.setupParam}
        nodeSpecific={
          <>
            {/* Show segmentation warning when there is no roisList or the roisList is empty */}
            {!Object.keys(selectedRois) ||
            Object.keys(selectedRois).length === 0 ? (
              <Alert variant="danger">
                <b>No input node detected</b>
              </Alert>
            ) : (
              <>
                {/* If there is a roisList, show the ROIs options in the table and the view button */}
                <Container>
                  <Row>
                    <Col xs={12}>
                      <Table>
                        <thead>
                          <tr>
                            <th scope="col">ROI name</th>
                            <th scope="col">
                              <img
                                src="/icon/extraction/plus-circle.svg"
                                className="segmentationSymbols"
                                alt="Add ROI"
                              />
                            </th>
                            <th scope="col">
                              <img
                                src="/icon/extraction/minus-circle.svg"
                                className="segmentationSymbols"
                                alt="Subtract ROI"
                              />
                            </th>
                            <th scope="col">
                              <img
                                src="/icon/extraction/slash.svg"
                                className="segmentationSymbols"
                                alt="Unused ROI"
                              />
                            </th>
                          </tr>
                        </thead>
                        <tbody id={`segmentation-form-body-${id}`}>
                          {/* Map all possible ROIs to a set of radio buttons: add is 0, sub is 1 and unused is 2 (default value) */}
                          {Object.keys(selectedRois).map((currentRoi) => (
                            <tr key={currentRoi}>
                              <td>
                                <label htmlFor={currentRoi}>{currentRoi}</label>
                              </td>
                              {["0", "1", "2"].map((value, key) => (
                                <td key={key}>
                                  <input
                                    type="radio"
                                    name={currentRoi}
                                    value={value}
                                    checked={selectedRois[currentRoi] === value}
                                    onChange={(e) =>
                                      handleRadioChange(e, currentRoi)
                                    }
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </Container>
                <ViewButton id={id} data={data} type={type} />
              </>
            )}
          </>
        }
      />
    </>
  )
}

export default SegmentationNode
