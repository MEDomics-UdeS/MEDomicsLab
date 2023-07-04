import React, { useCallback, useState } from "react";
import { Form, Row, Col, Image } from "react-bootstrap";
import DocLink from "../../docLink";

// Form group for log filter, used in the filter node component
const LogFilter = ({ changeFilterForm, defaultFilterForm }) => {
  // logForm is the object containing the log filter parameters
  // It contains the default values at the beginning
  const [logForm, setLogForm] = useState(defaultFilterForm.log);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const updatedValue = value ?? defaultLogForm[name];

    setLogForm((prevState) => ({
      ...prevState,
      [name]: updatedValue,
    }));

    // Update node data content
    changeFilterForm("log", name, value);
  };

  return (
    <Form.Group as={Row} controlId="filter-log">
      <DocLink
        link={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#log"
        }
        name={"Log filter documentation"}
        image={"../icon/extraction/exclamation.svg"}
      />

      <Form.Group as={Row} controlId="ndims">
        <Form.Label column>Dimension:</Form.Label>
        <Col>
          <Form.Control
            className="int"
            name="ndims"
            type="number"
            value={logForm.ndims}
            placeholder="Default: 3"
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="sigma">
        <Form.Label column>Sigma:</Form.Label>
        <Col>
          <Form.Control
            name="sigma"
            type="number"
            value={logForm.sigma}
            placeholder="Default: 1.5"
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="orthogonal_rot">
        <Form.Label column>Orthogonal rotation:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="orthogonal_rot"
            value={logForm.orthogonal_rot}
            onChange={handleFormChange}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="padding">
        <Form.Label column>Padding:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="padding"
            value={logForm.padding}
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

      <Form.Group as={Row} controlId="name_save">
        <Form.Label column>Name save:</Form.Label>
        <Col>
          <Form.Control
            name="name_save"
            type="text"
            value={logForm.name_save}
            placeholder={defaultFilterForm.log.name_save}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>
    </Form.Group>
  );
};

export default LogFilter;
