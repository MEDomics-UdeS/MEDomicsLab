import React, { useCallback } from "react"
import { Form, Row, Col } from "react-bootstrap"
import DocLink from "../../docLink"

/**
 * @param {Function} changeFilterForm function to change the filter form
 * @param {Object} data data of the node
 * @returns {JSX.Element} the form used for the Wavelet filter
 *
 * @description
 * This component is used to display the form of a Wavelet filter.
 * It is used in the filter node component.
 */
const WaveletFilter = ({ changeFilterForm, data }) => {
  /**
   * @param {Event} event event given change of the subband selection
   *
   * @description
   * This function is used to handle the change of the subband selection in the form.
   */
  const handleSubbandChange = useCallback(
    (event) => {
      const { name, value } = event.target
      let subbandNumber = name.split("_")[1]

      let newSubband = data.internal.settings.wavelet.subband.split("")
      newSubband[subbandNumber] = value
      newSubband = newSubband.join("")

      event.target.name = "subband"
      event.target.value = newSubband.replace(/x/g, "")
      // Update node data content
      changeFilterForm(event)
    },
    [data.internal.settings.wavelet]
  )

  return (
    <Form.Group as={Row} controlId="filter-wavelet">
      <DocLink 
        linkString={"https://medimage.readthedocs.io/en/latest/configurations_file.html#wavelet"}
        name={"Wavelet filter documentation"}
        image={"https://www.svgrepo.com/show/521262/warning-circle.svg"} 
      />
      <Form.Group as={Row} controlId="ndims">
        <Form.Label column>Dimension:</Form.Label>
        <Col>
          <Form.Control
            className="int"
            name="ndims"
            type="number"
            value={data.internal.settings.wavelet.ndims}
            placeholder={"Default: " + data.setupParam.possibleSettings.defaultSettings.wavelet.ndims}
            onChange={changeFilterForm}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="basis_function">
        <Form.Label column>
          <DocLink linkString={"https://pywavelets.readthedocs.io/en/v0.3.0/ref/wavelets.html#wavelet-families"} name={"Basis function:"} />
        </Form.Label>
        <Col>
          <Form.Control as="select" name="basis_function" value={data.internal.settings.wavelet.basis_function} onChange={changeFilterForm}>
            <option value="haar">Haar</option>
            <option value="db">Daubechies</option>
            <option value="sym">Symlets</option>
            <option value="coif">Coiflets</option>
            <option value="bior">Biorthogonal</option>
            <option value="rbio">Reverse biorthogonal</option>
            <option value="dmey">&quot;Discrete&quot; approximation of Meyer wavelet</option>
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
              <Form.Control as="select" name="subband_0" value={data.internal.settings.wavelet.subband.split("")[0]} onChange={handleSubbandChange}>
                <option value="x"></option>
                <option value="L">L</option>
                <option value="H">H</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="subband_1">
              <Form.Control as="select" name="subband_1" value={data.internal.settings.wavelet.subband.split("")[1]} onChange={handleSubbandChange}>
                <option value="x"></option>
                <option value="L">L</option>
                <option value="H">H</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="subband_2">
              <Form.Control as="select" name="subband_2" value={data.internal.settings.wavelet.subband.split("")[2]} onChange={handleSubbandChange}>
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
            value={data.internal.settings.wavelet.level}
            placeholder={"Default: " + data.setupParam.possibleSettings.defaultSettings.wavelet.level}
            onChange={changeFilterForm}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="rot_invariance">
        <Form.Label column>Rotational invariance:</Form.Label>
        <Col>
          <Form.Control as="select" name="rot_invariance" value={data.internal.settings.wavelet.rot_invariance} onChange={changeFilterForm}>
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="padding">
        <Form.Label column>Padding:</Form.Label>
        <Col>
          <Form.Control as="select" name="padding" value={data.internal.settings.wavelet.padding} onChange={changeFilterForm}>
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
            value={data.internal.settings.wavelet.name_save}
            placeholder={data.setupParam.possibleSettings.defaultSettings.wavelet.name_save}
            onChange={changeFilterForm}
          />
        </Col>
      </Form.Group>
    </Form.Group>
  )
}

export default WaveletFilter