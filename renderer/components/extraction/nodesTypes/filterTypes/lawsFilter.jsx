import React, { useCallback, useState } from "react"
import { Form, Row, Col, Image } from "react-bootstrap"
import DocLink from "../../docLink"

// Form group for laws filter, used in the filter node component
const LawsFilter = ({ changeFilterForm, data }) => {
  const handleConfigChange = useCallback(
    (event) => {
      const { name, value } = event.target
      let configNumber = name.split("_")[1]
      let newConfig = data.internal.settings.laws.config
      newConfig[configNumber] = value

      changeFilterForm(
        "config",
        newConfig.filter((value) => value !== "")
      )
    },
    [data.internal.settings]
  )

  return (
    <Form.Group as={Row} controlId="filter-laws">
      <DocLink
        link={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#laws"
        }
        name={"Laws filter documentation"}
        image={"../icon/extraction/exclamation.svg"}
      />
      <Form.Group as={Row} controlId="config">
        <Row>
          <Col style={{ minWidth: "220px" }}>
            <Form.Label column>1D filters to use (in order):</Form.Label>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="config_0">
              <Form.Control
                as="select"
                name="config_0"
                value={data.internal.settings.laws.config[0]}
                onChange={handleConfigChange}
              >
                <option value="L3">L3</option>
                <option value="L5">L5</option>
                <option value="E3">E3</option>
                <option value="E5">E5</option>
                <option value="S3">S3</option>
                <option value="S5">S5</option>
                <option value="W5">W5</option>
                <option value="R5">R5</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="config_1">
              <Form.Control
                as="select"
                name="config_1"
                value={data.internal.settings.laws.config[1]}
                onChange={handleConfigChange}
              >
                <option value=""></option>
                <option value="L3">L3</option>
                <option value="L5">L5</option>
                <option value="E3">E3</option>
                <option value="E5">E5</option>
                <option value="S3">S3</option>
                <option value="S5">S5</option>
                <option value="W5">W5</option>
                <option value="R5">R5</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Row} controlId="config_2">
              <Form.Control
                as="select"
                name="config_2"
                value={data.internal.settings.laws.config[2]}
                onChange={handleConfigChange}
              >
                <option value=""></option>
                <option value="L3">L3</option>
                <option value="L5">L5</option>
                <option value="E3">E3</option>
                <option value="E5">E5</option>
                <option value="S3">S3</option>
                <option value="S5">S5</option>
                <option value="W5">W5</option>
                <option value="R5">R5</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      </Form.Group>

      <Form.Group as={Row} controlId="energy_distance">
        <Form.Label column>Chebyshev distance:</Form.Label>
        <Col>
          <Form.Control
            name="energy_distance"
            type="number"
            value={data.internal.settings.laws.energy_distance}
            placeholder={
              "Default : " +
              data.setupParam.possibleSettings.defaultSettings.laws
                .energy_distance
            }
            onChange={(event) =>
              changeFilterForm(event.target.name, event.target.value)
            }
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="rot_invariance">
        <Form.Label column>Rotational invariance:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="rot_invariance"
            value={data.internal.settings.laws.rot_invariance}
            onChange={(event) =>
              changeFilterForm(event.target.name, event.target.value)
            }
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
            value={data.internal.settings.laws.orthogonal_rot}
            onChange={(event) =>
              changeFilterForm(event.target.name, event.target.value)
            }
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="energy_image">
        <Form.Label column>Energy images:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="energy_image"
            value={data.internal.settings.laws.energy_image}
            onChange={(event) =>
              changeFilterForm(event.target.name, event.target.value)
            }
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
            value={data.internal.settings.laws.padding}
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

      <Form.Group as={Row} controlId="name_save">
        <Form.Label column>Name save:</Form.Label>
        <Col>
          <Form.Control
            name="name_save"
            type="text"
            value={data.internal.settings.laws.name_save}
            placeholder={
              data.setupParam.possibleSettings.defaultSettings.laws.name_save
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

export default LawsFilter
