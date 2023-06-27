import React, { useState, useEffect, useCallback, useRef } from "react";
import Node from "../../flow/node";
import ViewButton from "../buttonsTypes/viewButton";
import { Container, Row, Col, Table, Alert } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 *
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A StandardNode node
 *
 * @description
 * This component is used to display a StandardNode node.
 * it handles the display of the node and the modal
 *
 */
const SegmentationNode = ({ id, data, type }) => {
  // List of ROIS: only there for testing purposes
  // TODO: La liste de ROIs devrait être récupérée du node input!
  const roisList = ["ROI1", "ROI2", "ROI3"];

  // Creating default ROI dict with 2 as default value
  const defaultRois = roisList.reduce((result, string) => {
    result[string] = "2";
    return result;
  }, {});

  // Hook to keep track of selected ROIs
  const [selectedRois, setSelectedRois] = useState(defaultRois);

  // Hook to keep track of the selected ROIs to update roisString in the node data
  useEffect(() => {
    getRoisSelection();
  }, [selectedRois]);

  // Handle radio button changes made by the user to select ROIs
  const handleRadioChange = useCallback((event, currentRoi) => {
    try {
      // TODO : this is probably not the best way to handle that error
      // If the target value is a negative ROI, check if there is at least one positive ROI
      if (event.target.value === "1") {
        let oldRois = { ...selectedRois };
        oldRois[currentRoi] = "1";

        if (!Object.values(oldRois).some((value) => value === "0")) {
          throw new Error("At least one ROI should be positive.");
        }
      }

      setSelectedRois((prevRoisList) => ({
        ...prevRoisList,
        [currentRoi]: event.target.value,
      }));
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
        theme: "light",
      });
      return;
    }
  }, []);

  // Transform the selectedRois dict into a string respecting MEDimage conventions
  const getRoisSelection = useCallback(() => {
    let roisString = "";
    // Creating strings for positive and negative rois
    let positiveRois = "";
    let negativeRois = "";

    // Run through all selected ROIs in the component state
    for (const roi in selectedRois) {
      if (selectedRois[roi] === "0") {
        // If the ROI is positive, add it to positive_rois
        positiveRois += "+{" + roi + "}";
      } else if (selectedRois[roi] === "1") {
        // If the ROI is negative, add it to negative_rois
        negativeRois += "-{" + roi + "}";
      }
    }

    // Note : There should be at least one positive ROI since it is checked upon clicking on a radio button
    // ROI list is the concatenation of the strings positive_rois and negative_rois
    // Since the string starts with the positive rois, remove the first + character to be compliant with MEDimage's notation
    roisString = (positiveRois + negativeRois).substring(1);

    console.log("ROIS SELECTED : ", roisString);
    // Add the ROI list to the node's data
    data.internal.settings["rois_data"] = roisString;
    // And set changeView to true to update the view
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal,
    });
  }, []);

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
            {!roisList || roisList.length === 0 ? (
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
                          {roisList.map((currentRoi) => (
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
  );
};

export default SegmentationNode;
