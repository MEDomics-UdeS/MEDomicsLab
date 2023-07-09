import React, { useState, useContext } from "react";
import Node from "../../flow/node";
import Input from "../input";
import { Button } from "react-bootstrap";
import ModalSettingsChooser from "../modalSettingsChooser";
import * as Icon from "react-bootstrap-icons";


/**
 *
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A StandardNode node
 *
 * @description
 * This component is used to display a StandardNode node.
 * it handles the display of the node and the modal
 *
 */
const StandardNode = ({ id, data, type }) => {
	const [modalShow, setModalShow] = useState(false); 	// state of the modal


	const onInputChange = (inputUpdate) => {
		data.internal.settings[inputUpdate.name] = inputUpdate.value;
		data.parentFct.updateNode({
			id: id,
			updatedData: data.internal,
		});
	};

	return (
		<>
			{/* build on top of the Node component */}
			<Node
				key={id}
				id={id}
				data={data}
				type={type}
				setupParam={data.setupParam}
				// no body for this node (particular to this node)
				// default settings are the default settings of the node, so mandatory settings
				defaultSettings={
					<>
						{"default" in data.setupParam.possibleSettings &&
							Object.entries(
								data.setupParam.possibleSettings.default
							).map(([settingName, setting]) => {
								return (
									<Input
										key={settingName}
										name={settingName}
										settingInfos={setting}
										currentValue={data.internal.settings[settingName]}
										onInputChange={onInputChange}
									/>
								);
							})}
					</>
				}
				// node specific is the body of the node, so optional settings
				nodeSpecific={
					<>
						{/* the button to open the modal (the plus sign)*/}
						<Button
							variant="light"
							className="width-100 btn-contour margin-bottom-25"
							onClick={() => setModalShow(true)}
						>
							<Icon.Plus width="30px" height="30px" className="img-fluid"/>
						</Button>
						{/* the modal component*/}
						<ModalSettingsChooser
							show={modalShow}
							onHide={() => setModalShow(false)}
							options={data.setupParam.possibleSettings.options}
							data={data}
							id={id}
						/>
						{/* the inputs for the options */}
						{data.internal.checkedOptions.map((optionName) => {
							return (
								<Input
									key={optionName}
									name={optionName}
									settingInfos={
										data.setupParam.possibleSettings
											.options[optionName]
									}
									currentValue={data.internal.settings[optionName]}
									onInputChange={onInputChange}
								/>
							);
						})}
					</>
				}
			/>
		</>
	);
};

export default StandardNode;
