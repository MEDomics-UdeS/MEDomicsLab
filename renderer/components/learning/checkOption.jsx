import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import { Tooltip } from "react-tooltip"
import parse from "html-react-parser";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const implementedTypes = [
	"string",
	"int",
	"float",
	"bool",
	"list",
	"list-multiple",
	"range",
	"custom-list",
	"pandas.DataFrame",

]

/**
 * 
 * @param {string} optionName name of the option
 * @param {object} optionInfos infos of the option (type, tooltip, ...)
 * @param {function} updateCheckState function to update the state of the option
 * @param {boolean} defaultState default state of the option
 * @returns 
 */
const CheckOption = ({ optionName, optionInfos, updateCheckState, defaultState }) => {
	const [checked, setChecked] = useState(defaultState);

	useEffect(() => {
		updateCheckState({optionName: optionName, checked: checked})
	}, [checked])
	return (
		<>
			<Row>
				<Col sm={1}>
					<Form onChange={(e)=>setChecked(!checked)}>
						{(implementedTypes.includes(optionInfos.type)) ?
							<Form.Check
								defaultChecked={checked}
								type="switch"
								id={`check-${optionName}`}
							/> :
							<Form.Check
								disabled
								type="switch"
								id={`check-${optionName}`}
							/>
						}
					</Form>
				</Col>
				<Col><label id={`check-${optionName}-lbl`} htmlFor={`check-${optionName}`}>{optionName}</label></Col>
			</Row>

			<Tooltip className="tooltip" anchorSelect={`#check-${optionName}-lbl`}>
				{parse(optionInfos.tooltip)}
			</Tooltip>

		</>
	);
}

export default CheckOption;