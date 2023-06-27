import React, { useCallback, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import DocLink from "../../docLink";

// Form group for gabor filter, used in the filter node component
const GaborFilter = ({ changeFilterForm, defaultFilterForm }) => {
  // meanForm is the object containing the mean filter parameters
  const [gaborForm, setGaborForm] = useState(defaultFilterForm.gabor);

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;
    const updatedValue = value ?? defaultFilterForm.gabor[name];

    setGaborForm((prevState) => ({
      ...prevState,
      [name]: updatedValue,
    }));

    // Update node data content
    changeFilterForm("gabor", name, value);
  }, []);

  return (
    <Form.Group as={Row} controlId="filter-gabor">
      <DocLink
        link={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#gabor"
        }
        name={"Gabor filter documentation"}
        image={"../icon/extraction/exclamation.svg"}
      />
      <Form.Group as={Row} controlId="sigma">
        <Form.Label column>Sigma:</Form.Label>
        <Col>
          <Form.Control
            name="sigma"
            type="number"
            value={gaborForm.sigma}
            placeholder={"Default: " + defaultFilterForm.gabor.sigma}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="lambda">
        <Form.Label column>Lambda:</Form.Label>
        <Col>
          <Form.Control
            name="lambda"
            type="number"
            value={gaborForm.lambda}
            placeholder={"Default: " + defaultFilterForm.gabor.lambda}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="gamma">
        <Form.Label column>Gamma:</Form.Label>
        <Col>
          <Form.Control
            name="gamma"
            type="number"
            value={gaborForm.gamma}
            placeholder={"Default: " + defaultFilterForm.gabor.gamma}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="theta">
        <Form.Label column>Theta:</Form.Label>
        <Col>
          <Form.Control
            name="theta"
            type="text"
            value={gaborForm.theta}
            placeholder={"Default: " + defaultFilterForm.gabor.theta}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="rot_invariance">
        <Form.Label column>Rotational invariance:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="rot_invariance"
            value={gaborForm.rot_invariance}
            onChange={handleFormChange}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="orthogonal_rot">
        <Form.Label column>Orthogonal rotation:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="orthogonal_rot"
            value={gaborForm.orthogonal_rot}
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
            value={gaborForm.padding}
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
            value={gaborForm.name_save}
            placeholder={defaultFilterForm.gabor.name_save}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>
    </Form.Group>
  );
};

export default GaborFilter;
