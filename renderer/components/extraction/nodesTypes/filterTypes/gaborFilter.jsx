import React, { useState } from "react";
import { Form, Row, Col, Image } from "react-bootstrap";
import DocLink from "../../docLink";

// Form group for gabor filter, used in the filter node component
const GaborFilter = ({ id, data }) => {
  // meanForm is the object containing the mean filter parameters
  const [meanForm, setMeanForm] = useState({});

  return (
    <Form.Group as={Row} controlId="filter-gabor">
      <DocLink
        link={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#gabor"
        }
        name={"Gabor filter documentation"}
      />
      <Form.Group as={Row} controlId="sigma">
        <Form.Label column>Sigma:</Form.Label>
        <Col>
          <Form.Control
            name="sigma"
            type="number"
            value="5"
            placeholder="Default: 5"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="lambda">
        <Form.Label column>Lambda:</Form.Label>
        <Col>
          <Form.Control
            name="lambda"
            type="number"
            value="2"
            placeholder="Default: 2"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="gamma">
        <Form.Label column>Gamma:</Form.Label>
        <Col>
          <Form.Control
            name="gamma"
            type="number"
            value="1.5"
            placeholder="Default: 1.5"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="theta">
        <Form.Label column>Theta:</Form.Label>
        <Col>
          <Form.Control
            name="theta"
            type="text"
            value="Pi/8"
            placeholder="Default: Pi/8"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="rot_invariance">
        <Form.Label column>Rotational invariance:</Form.Label>
        <Col>
          <Form.Control as="select" name="rot_invariance">
            <option value="false">False</option>
            <option value="true" selected>
              True
            </option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="orthogonal_rot">
        <Form.Label column>Orthogonal rotation:</Form.Label>
        <Col>
          <Form.Control as="select" name="orthogonal_rot">
            <option value="false">False</option>
            <option value="true" selected>
              True
            </option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="padding">
        <Form.Label column>Padding:</Form.Label>
        <Col>
          <Form.Control as="select" name="padding">
            <option value="constant">Constant</option>
            <option value="edge">Edge</option>
            <option value="linear_ramp">Linear ramp</option>
            <option value="maximum">Maximum</option>
            <option value="mean">Mean</option>
            <option value="median">Median</option>
            <option value="minimum">Minimum</option>
            <option value="reflect">Reflect</option>
            <option value="symmetric" selected>
              Symmetric
            </option>
            <option value="wrap">Wrap</option>
            <option value="empty">Empty</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="name_save">
        <Form.Label column>Name save:</Form.Label>
        <Col sm={9}>
          <Form.Control
            name="name_save"
            type="text"
            value=""
            placeholder="Name"
          />
        </Col>
      </Form.Group>
    </Form.Group>
  );
};

export default GaborFilter;
