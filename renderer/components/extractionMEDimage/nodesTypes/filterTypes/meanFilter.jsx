import React from "react"
import { Form, Row, Col } from "react-bootstrap"
import DocLink from "../../docLink"

/**
 * @param {Function} changeFilterForm function to change the filter form
 * @param {Object} data data of the node
 * @returns {JSX.Element} the form used for the Mean filter
 *
 * @description
 * This component is used to display the form of a Mean filter.
 * It is used in the filter node component.
 */
const MeanFilter = ({ changeFilterForm, data }) => {
  return (
    <Form.Group as={Row} controlId="filter-mean">
      <DocLink
        linkString={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#mean"
        }
        name={"Mean filter documentation"}
        image={"../icon/extraction_img/exclamation.svg"}
      />

      <Form.Group as={Row} controlId="ndims">
        <Form.Label column>Dimension:</Form.Label>
        <Col>
          <Form.Control
            className="int"
            name="ndims"
            type="number"
            value={data.internal.settings.mean.ndims}
            placeholder={
              "Default : " +
              data.setupParam.possibleSettings.defaultSettings.mean.ndims
            }
            onChange={(event) =>
              changeFilterForm(event.target.name, event.target.value)
            }
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="padding">
        <Form.Label column>Padding:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="padding"
            value={data.internal.settings.mean.padding}
            onChange={(event) =>
              changeFilterForm(event.target.name, event.target.value)
            }
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
            value={data.internal.settings.mean.orthogonal_rot}
            onChange={(event) =>
              changeFilterForm(event.target.name, event.target.value)
            }
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
            value={data.internal.settings.mean.name_save}
            placeholder={
              data.setupParam.possibleSettings.defaultSettings.mean.name_save
            }
            onChange={(event) =>
              changeFilterForm(event.target.name, event.target.value)
            }
          />
        </Col>
      </Form.Group>
    </Form.Group>
  )
}

export default MeanFilter
