// Feature node component represents a radiomic feature family
// The node specific settings are only shown if the user need to select distinct parameters for the feature family
// The default settings are always a list of checkboxes for each feature in the feature family and are shown in the offcanvas
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Node from "../../flow/node";
import { Form } from "react-bootstrap";
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
  );
  const [selectedFeatures, setSelectedFeatures] = useState(features);

  const handleToggleAll = useCallback((event) => {
    const isChecked = event.target.checked;
    const updatedSelectedFeatures = isChecked ? [...features] : [];
    setSelectedFeatures(updatedSelectedFeatures);
  }, []);

  const handleToggleFeature = useCallback((event) => {
    const feature = event.target.value;
    const isChecked = event.target.checked;

    setSelectedFeatures((prevSelectedFeatures) => {
      if (isChecked) {
        return [...prevSelectedFeatures, feature];
      } else {
        return prevSelectedFeatures.filter(
          (selectedFeature) => selectedFeature !== feature
        );
      }
    });
  }, []);

  // Keepts the value of select_all checkbox up to date
  const isAllChecked = selectedFeatures.length === features.length;

  // Called when the form is changed, updates the node data
  useEffect(() => {
    data.internal.settings = {
      associatedFeatures: selectedFeatures,
    };
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal,
    });
  }, [selectedFeatures]);

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
            <Form.Check
              type="checkbox"
              label="Select all"
              checked={isAllChecked}
              onChange={handleToggleAll}
            />

            {features.map((feature) => (
              <Form.Check
                key={feature}
                type="checkbox"
                label={feature}
                value={feature}
                checked={selectedFeatures.includes(feature)}
                onChange={handleToggleFeature}
              />
            ))}
          </>
        }
      />
    </>
  );
};

export default FeaturesNode;
