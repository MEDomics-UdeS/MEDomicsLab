import React, { useCallback, useState, useMemo } from "react";
import { Form, Row, Col } from "react-bootstrap";
import DocLink from "../../docLink";

// Form group for wavelet filter, used in the filter node component
const WaveletFilter = ({ changeFilterForm, defaultFilterForm }) => {
  // waveletForm is the object containing the wavelet filter parameters
  // It contains the default values at the beginning
  const [waveletForm, setWaveletForm] = useState(defaultFilterForm.wavelet);

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;
    const updatedValue = value ?? defaultFilterForm.wavelet[name];

    setWaveletForm((prevState) => ({
      ...prevState,
      [name]: updatedValue,
    }));

    // Update node data content
    changeFilterForm("wavelet", name, value);
  }, []);

  const handleSubbandChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      let subbandNumber = name.split("_")[1];

      let newSubband = waveletForm.subband.split("");
      newSubband[subbandNumber] = value;
      newSubband = newSubband.join("");

      setWaveletForm((prevState) => ({
        ...prevState,
        subband: newSubband,
      }));

      // Update node data content
      changeFilterForm("wavelet", "subband", newSubband.replace(/x/g, ""));
    },
    [waveletForm]
  );

  return (
    <Form.Group as={Row} controlId="filter-wavelet">
      <DocLink
        link={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#wavelet"
        }
        name={"Wavelet filter documentation"}
        image={"../icon/extraction/exclamation.svg"}
      />
      <Form.Group as={Row} controlId="ndims">
        <Form.Label column>Dimension:</Form.Label>
        <Col>
          <Form.Control
            className="int"
            name="ndims"
            type="number"
            value={waveletForm.ndims}
            placeholder={"Default: " + defaultFilterForm.wavelet.ndims}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="basis_function">
        <Form.Label column>
          <DocLink
            link={
              "https://pywavelets.readthedocs.io/en/v0.3.0/ref/wavelets.html#wavelet-families"
            }
            name={"Basis function:"}
          />
        </Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="basis_function"
            value={waveletForm.basis_function}
            onChange={handleFormChange}
          >
            <option value="haar">Haar</option>
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
          <Col style={{ minWidth: "220px" }}>
            <Form.Label column>Subband:</Form.Label>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="subband_0">
              <Form.Control
                as="select"
                name="subband_0"
                value={waveletForm.subband.split("")[0]}
                onChange={handleSubbandChange}
              >
                <option value="x"></option>
                <option value="L">L</option>
                <option value="H">H</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="subband_1">
              <Form.Control
                as="select"
                name="subband_1"
                value={waveletForm.subband.split("")[1]}
                onChange={handleSubbandChange}
              >
                <option value="x"></option>
                <option value="L">L</option>
                <option value="H">H</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="subband_2">
              <Form.Control
                as="select"
                name="subband_2"
                value={waveletForm.subband.split("")[2]}
                onChange={handleSubbandChange}
              >
                <option value="x"></option>
                <option value="L">L</option>
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
            value={waveletForm.level}
            placeholder={"Default: " + defaultFilterForm.wavelet.level}
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
            value={waveletForm.rot_invariance}
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
            value={waveletForm.padding}
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
            type="text"
            name="name_save"
            value={waveletForm.name_save}
            placeholder={defaultFilterForm.wavelet.name_save}
            onChange={handleFormChange}
          />
        </Col>
      </Form.Group>
    </Form.Group>
  );
};

export default WaveletFilter;
