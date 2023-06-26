import React, { useState } from "react";
import { Form, Row, Col, Image } from "react-bootstrap";
import DocLink from "../../docLink";

// Form group for wavelet filter, used in the filter node component
const WaveletFilter = ({ id, data }) => {
  // meanForm is the object containing the mean filter parameters
  const [meanForm, setMeanForm] = useState({});

  return (
    <Form.Group as={Row} controlId="filter-wavelet">
      <DocLink
        link={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#wavelet"
        }
        name={"Wavelet filter documentation"}
      />
      <Form.Group as={Row} controlId="ndims">
        <Form.Label column>Dimension:</Form.Label>
        <Col>
          <Form.Control
            className="int"
            name="ndims"
            type="number"
            value="3"
            placeholder="Default: 3"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="basis_function">
        <Form.Label column>
          Basis function -{" "}
          <a
            href="https://pywavelets.readthedocs.io/en/v0.3.0/ref/wavelets.html#wavelet-families"
            target="_blank"
            rel="noopener noreferrer"
          >
            Help
          </a>
          :
        </Form.Label>
        <Col>
          <Form.Control as="select" name="basis_function">
            <option value="haar" selected>
              Haar
            </option>
            <option value="db">Daubechies</option>
            <option value="sym">Symlets</option>
            <option value="coif">Coiflets</option>
            <option value="bior">Biorthogonal</option>
            <option value="rbio">Reverse biorthogonal</option>
            <option value="dmey">
              "Discrete" approximation of Meyer wavelet
            </option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="subband">
        <Row>
          <Form.Label column>Subband:</Form.Label>

          <Col>
            <Form.Group as={Row} controlId="subband_1">
              <Form.Control as="select" name="subband">
                <option value=""></option>
                <option value="L" selected>
                  L
                </option>
                <option value="H">H</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="subband_2">
              <Form.Control as="select" name="subband">
                <option value=""></option>
                <option value="L" selected>
                  L
                </option>
                <option value="H">H</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="subband_3">
              <Form.Control as="select" name="subband">
                <option value=""></option>
                <option value="L" selected>
                  L
                </option>
                <option value="H">H</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      </Form.Group>

      <Form.Group as={Row} controlId="level">
        <Form.Label column>Level:</Form.Label>
        <Col>
          <Form.Control
            className="int"
            type="number"
            name="level"
            value="1"
            placeholder="Default: 1"
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
        <Col>
          <Form.Control
            type="text"
            name="name_save"
            value=""
            placeholder="Name"
          />
        </Col>
      </Form.Group>
    </Form.Group>
  );
};

export default WaveletFilter;
