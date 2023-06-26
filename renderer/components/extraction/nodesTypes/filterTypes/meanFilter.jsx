import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import DocLink from "../../docLink";

// Form group for mean filter, used in the filter node component
const MeanFilter = ({ changeFilterForm, defaultFilterForm }) => {
  // meanForm is the object containing the mean filter parameters
  // It contains the default values at the beginning
  const [meanForm, setMeanForm] = useState(defaultFilterForm.mean);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const updatedValue = value ?? defaultFilterForm.mean[name];

    setMeanForm((prevState) => ({
      ...prevState,
      [name]: updatedValue,
    }));

    changeFilterForm("mean", name, value);
  };

  return (
    <Form.Group as={Row} controlId="filter-mean">
      <DocLink
        link={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#mean"
        }
        name={"Mean filter documentation"}
      />

      <Form.Group as={Row} controlId="ndims">
        <Form.Label column>Dimension:</Form.Label>
        <Col>
          <Form.Control
            className="int"
            name="ndims"
            type="number"
            value={meanForm.ndims}
            placeholder="Default: 3"
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="padding">
        <Form.Label column>Padding:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="padding"
            value={meanForm.padding}
            onChange={handleFormChange}
          >
            <option value="constant">Constant</option>
            <option value="edge">Edge</option>
            <option value="linear_ramp">Linear ramp</option>
            <option value="maximum">Maximum</option>
            <option value="mean">Mean</option>
            <option value="median">Median</option>
            <option value="minimum">Minimum</option>
            <option value="reflect">Reflect</option>
            <option value="symmetric">Symmetric</option>
            <option value="wrap">Wrap</option>
            <option value="empty">Empty</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="orthogonal_rot">
        <Form.Label column>Orthogonal rotation:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="orthogonal_rot"
            value={meanForm.orthogonal_rot}
            onChange={handleFormChange}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="name_save">
        <Form.Label column>Name save:</Form.Label>
        <Col>
          <Form.Control
            name="name_save"
            type="text"
            value={meanForm.name_save}
            placeholder={defaultFilterForm.mean.name_save}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>
    </Form.Group>
  );
};

export default MeanFilter;
