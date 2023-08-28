import React from "react"
import { Form, Row, Col } from "react-bootstrap"
import DocLink from "../../docLink"

/**
 * @param {Object} nodeForm form associated to the discretization node
 * @param {Function} changeNodeForm function to change the node form
 * @param {Object} data data of the node
 * @returns {JSX.Element} A InterpolationForm to display in the modal of an interpolation node
 *
 * @description
 * This component is used to display a InterpolationForm.
 */
const InterpolationForm = ({ nodeForm, changeNodeForm, data }) => {
  // Get default settings for the interpolation node
  const defaultValues = data.setupParam.possibleSettings.defaultSettings

  /**
   * @param {Event} event event given change of the scale in the form
   *
   * @description
   * This function is used to handle the scale of the interpolation node.
   */
  const handleScale = (event) => {
    // Separate event in name and value
    const { name, value } = event.target

    // The name of the scale is in the form "scale_name-scale_number"
    let [scale_name, scale_number] = name.split("-")

    // Initializing new scale
    let scale = [...nodeForm[scale_name]]
    // If the scale name is scale_non_text, the format expected is an array
    if (scale_name === "scale_non_text") {
      // If the user deleted the value (empty), set to the default value
      let scale_value =
        value !== "" ? parseInt(value) : defaultValues[scale_name][scale_number]
      scale[scale_number] = scale_value
    } else if (scale_name === "scale_text") {
      // If the scale name is scale_text, the format expected is an array of arrays
      // NOTE : scale_text as of MEDimage documentation are lists of size 3 of the new voxel size for texture
      // features (features will be computed for each list). Since there are no option at the moment for multiple
      // list given by the user, scale_text is a list of size one, containing the only list for the new voxel size.
      let scale_value =
        value !== ""
          ? parseInt(value)
          : defaultValues[scale_name][0][scale_number]
      scale[0][scale_number] = scale_value
    }

    // Modify the event object
    const modifiedEvent = {
      ...event, // Copy all properties of the original event
      target: {
        ...event.target,
        name: scale_name,
        value: scale
      }
    }

    // Pass the modified event to changeNodeForm
    changeNodeForm(modifiedEvent)
  }

  return (
    <Form className="standard-form">
      <DocLink
        linkString={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#interp"
        }
        name={"Interpolation documentation"}
        image={"../icon/extraction/exclamation.svg"}
      />

      <Form.Group controlId="scale_non_text" style={{ paddingTop: "10px" }}>
        <Form.Label>Voxel size for non-texture features :</Form.Label>
        <Row>
          <Col>
            <Form.Label>X</Form.Label>
            <Form.Control
              name="scale_non_text-0"
              type="number"
              min="0"
              defaultValue={nodeForm.scale_non_text[0]}
              placeholder={
                "Default: " + String(defaultValues.scale_non_text[0])
              }
              onChange={handleScale}
            />
          </Col>
          <Col>
            <Form.Label>Y</Form.Label>
            <Form.Control
              name="scale_non_text-1"
              type="number"
              min="0"
              defaultValue={nodeForm.scale_non_text[1]}
              placeholder={
                "Default: " + String(defaultValues.scale_non_text[1])
              }
              onChange={handleScale}
            />
          </Col>
          <Col>
            <Form.Label>Z</Form.Label>
            <Form.Control
              name="scale_non_text-2"
              type="number"
              min="0"
              defaultValue={nodeForm.scale_non_text[2]}
              placeholder={
                "Default: " + String(defaultValues.scale_non_text[2])
              }
              onChange={handleScale}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group controlId="scale_text" style={{ paddingTop: "10px" }}>
        <Form.Label>Voxel size for texture features :</Form.Label>
        <Row>
          <Col style={{ width: "20px !important" }}>
            <Form.Label>X</Form.Label>
            <Form.Control
              name="scale_text-0"
              type="number"
              min="0"
              defaultValue={nodeForm.scale_text[0][0]}
              placeholder={"Default: " + String(defaultValues.scale_text[0][0])}
              onChange={handleScale}
            />
          </Col>
          <Col>
            <Form.Label>Y</Form.Label>
            <Form.Control
              name="scale_text-1"
              type="number"
              min="0"
              defaultValue={nodeForm.scale_text[0][1]}
              placeholder={"Default: " + String(defaultValues.scale_text[0][1])}
              onChange={handleScale}
            />
          </Col>
          <Col>
            <Form.Label>Z</Form.Label>
            <Form.Control
              name="scale_text-2"
              type="number"
              min="0"
              defaultValue={nodeForm.scale_text[0][2]}
              placeholder={"Default: " + String(defaultValues.scale_text[0][2])}
              onChange={handleScale}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group controlId="vol_interp" style={{ paddingTop: "10px" }}>
        <Form.Label>Volume interpolation method :</Form.Label>
        <Form.Control
          as="select"
          name="vol_interp"
          value={nodeForm.vol_interp}
          onChange={changeNodeForm}
        >
          <option value="linear">Linear</option>
          <option value="spline">Spline</option>
          <option value="cubic">Cubic</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="gl_round" style={{ paddingTop: "10px" }}>
        <Form.Label>Rounding value (only for CT scan) :</Form.Label>
        <Form.Control
          name="gl_round"
          type="number"
          defaultValue={nodeForm.gl_round}
          placeholder={"Default: " + String(defaultValues.gl_round)}
          onChange={changeNodeForm}
        />
      </Form.Group>

      <Form.Group controlId="roi_interp" style={{ paddingTop: "10px" }}>
        <Form.Label>ROI interpolation method :</Form.Label>
        <Form.Control
          as="select"
          name="roi_interp"
          value={nodeForm.roi_interp}
          onChange={changeNodeForm}
        >
          <option value="linear">Linear</option>
          <option value="spline">Spline</option>
          <option value="cubic">Cubic</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="roi_pv" style={{ paddingTop: "10px" }}>
        <Form.Label>Rounding value for ROI intensities :</Form.Label>
        <Form.Control
          name="roi_pv"
          type="number"
          defaultValue={nodeForm.roi_pv}
          placeholder={"Default: " + String(defaultValues.roi_pv)}
          onChange={changeNodeForm}
        />
      </Form.Group>
    </Form>
  )
}

export default InterpolationForm
