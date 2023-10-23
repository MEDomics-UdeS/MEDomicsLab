import React, { useCallback } from "react"
import { Form, Row, Col } from "react-bootstrap"
import DocLink from "../../docLink"

/**
 * @param {Object} nodeForm form associated to the discretization node
 * @param {Function} changeNodeForm function to change the node form
 * @param {Object} data data of the node
 * @returns {JSX.Element} A ReSegmentationForm to display in the modal of a re-segmentation node
 *
 * @description
 * This component is used to display a ReSegmentationForm.
 */
const ReSegmentationForm = ({ nodeForm, changeNodeForm, data }) => {
  /**
   * @param {Event} event event given change of the range in the form
   *
   * @description
   * This function is used to handle the range of the re-segmentation node.
   * It is used to modify the nodeForm.
   */
  const handleRange = useCallback(
    (event) => {
      // Separate event in name and value
      const { name, value } = event.target

      let [outliers_name, outliers_number] = name.split("-")
      let outliers = [...nodeForm[outliers_name]]

      // If the value is empty, set to string "inf" as prescribed by MEDimage documentation
      if (value === "") {
        outliers[outliers_number] = "inf"
      } else {
        outliers[outliers_number] = parseInt(value)
      }

      // Modify the event object
      const modifiedEvent = {
        ...event,
        target: {
          ...event.target,
          name: outliers_name,
          value: outliers
        }
      }

      // Pass the modified event to changeNodeForm
      changeNodeForm(modifiedEvent)
    },
    [nodeForm]
  )

  return (
    <Form className="standard-form">
      <DocLink
        linkString={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#reseg"
        }
        name={"Re-segmentation documentation"}
        image={"../icon/extraction/exclamation.svg"}
      />

      <Form.Group>
        <Form.Label>Range (HU):</Form.Label>
        <Row>
          <Col>
            <Form.Label>Min range</Form.Label>
            <Form.Control
              name="range-0"
              type="number"
              value={nodeForm.range[0] !== "inf" ? nodeForm.range[0] : ""}
              placeholder="Infinity"
              onChange={handleRange}
            />
          </Col>
          <Col>
            <Form.Label>Max range</Form.Label>
            <Form.Control
              name="range-1"
              type="number"
              value={nodeForm.range[1] !== "inf" ? nodeForm.range[1] : ""}
              placeholder="Infinity"
              onChange={handleRange}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group style={{ paddingTop: "10px" }}>
        <Form.Label>Outliers:</Form.Label>
        <Form.Control
          as="select"
          name="outliers"
          value={nodeForm.outliers}
          onChange={changeNodeForm}
        >
          <option value="">None</option>
          <option value="Collewet">Collewet</option>
        </Form.Control>
      </Form.Group>
    </Form>
  )
}

export default ReSegmentationForm
