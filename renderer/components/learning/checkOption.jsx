import React, { useEffect, useState } from "react"
import Form from "react-bootstrap/Form"
import { Tooltip } from "react-tooltip"
import parse from "html-react-parser"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { implementedTypes } from "../../utilities/learning/inputTypesUtils"

/**
 *
 * @param {string} optionName name of the option
 * @param {object} optionInfos infos of the option (type, tooltip, ...)
 * @param {function} updateCheckState function to update the state of the option
 * @param {boolean} defaultState default state of the option
 * @returns {JSX.Element} A CheckOption
 * @description
 * This component is used to display a checkbox beside the name of the option and implement the associated tooltip
 */
const CheckOption = ({
  optionName,
  optionInfos,
  updateCheckState,
  defaultState
}) => {
  const [checked, setChecked] = useState(defaultState) // state of the checkbox

  // update the state of the checkbox when the default state changes
  // when the state of the checkbox changes, update the state of the option
  useEffect(() => {
    updateCheckState({ optionName: optionName, checked: checked })
  }, [checked])

  return (
    <>
      {/* this component is basically a Row with 2 Col, one for the checkbox and one for the name of the option */}
      <Row>
        {/* checkbox */}
        <Col sm={1}>
          <Form onChange={() => setChecked(!checked)}>
            {implementedTypes.includes(optionInfos.type) ? (
              <Form.Check
                defaultChecked={checked}
                type="switch"
                id={`check-${optionName}`}
              />
            ) : (
              <Form.Check disabled type="switch" id={`check-${optionName}`} />
            )}
          </Form>
        </Col>
        {/* name of the option */}
        <Col>
          <label id={`check-${optionName}-lbl`} htmlFor={`check-${optionName}`}>
            {optionName}
          </label>
        </Col>
      </Row>

      {/* tooltip */}
      <Tooltip className="tooltip" anchorSelect={`#check-${optionName}-lbl`}>
        {parse(optionInfos.tooltip)}
      </Tooltip>
    </>
  )
}

export default CheckOption
