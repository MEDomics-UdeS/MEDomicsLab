import React, { useState, useContext } from "react";
import Node from "../../flow/node";
import Input from "../input";
import { Button } from "react-bootstrap";
import ModalSettingsChooser from "../modalSettingsChooser";
import { FlowInfosContext} from "../../flow/context/flowInfosContext";


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
	const [modalShow, setModalShow] = useState(false);
	const { flowInfos } = useContext(FlowInfosContext);


	const onInputChange = (inputUpdate) => {
		data.internal.settings[inputUpdate.name] = inputUpdate.value;
		data.parentFct.updateNode({
			id: id,
			updatedData: data.internal,
		});
	};

	return (
		<>
			<Node
				key={id}
				id={id}
				data={data}
				type={type}
				setupParam={data.setupParam}
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
										data={data}
										onInputChange={onInputChange}
									/>
								);
							})}
					</>
				}
				nodeSpecific={
					<>
						<Button
							variant="light"
							className="width-100 btn-contour margin-bottom-25"
							onClick={() => setModalShow(true)}
						>
							<img
								src={`/icon/${flowInfos.type}/add.png`}
								alt="add"
								className="img-fluid"
							/>
						</Button>
						<ModalSettingsChooser
							show={modalShow}
							onHide={() => setModalShow(false)}
							options={data.setupParam.possibleSettings.options}
							data={data}
							id={id}
						/>
						{data.internal.checkedOptions.map((optionName) => {
							return (
								<Input
									key={optionName}
									name={optionName}
									settingInfos={
										data.setupParam.possibleSettings
											.options[optionName]
									}
									data={data}
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
