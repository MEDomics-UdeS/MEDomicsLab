import React, { useState, useEffect, useCallback, useRef } from "react";
import Node from "../../flow/node";
import Input from "../input";
import { Button } from "react-bootstrap";
import ModalSettingsChooser from "../modalSettingsChooser";
import Option from "../checkOption";
import Form from "react-bootstrap/Form";

/**
 *
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A Selection node
 *
 * @description
 * This component is used to display a Selection node.
 * it handles the display of the node and the modal
 * it also handles the selection of the option. According to the selected option, the settings are updated
 */
const SelectionNode = ({ id, data, type }) => {
	const [modalShow, setModalShow] = useState(false);
	const [selection, setSelection] = useState(
		Object.keys(data.setupParam.possibleSettings)[0]
	); // default selection is the first option

	// update the node when the selection changes
	useEffect(() => {
		data.internal.selection = selection;
		data.parentFct.updateNode({
			id: id,
			updatedData: data.internal,
		});
	}, [selection]);

	// update the node when the selection changes
	const onSelectionChange = (e) => {
		data.internal.settings = {};
		data.internal.checkedOptions = [];
		console.log("onselectionchange", e.target.value);
		setSelection(e.target.value);
	};

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
				id={id}
				data={data}
				type={type}
				setupParam={data.setupParam}
				nodeBody={
					<>
						<Form.Select
							aria-label="machine learning model"
							onChange={onSelectionChange}
						>
							{Object.entries(
								data.setupParam.possibleSettings
							).map(([optionName]) => {
								return (
									<option key={optionName} value={optionName}>
										{optionName}
									</option>
								);
							})}
						</Form.Select>
					</>
				}
				defaultSettings={
					<>
						{"default" in
							data.setupParam.possibleSettings[
								data.internal.selection
							] &&
							Object.entries(
								data.setupParam.possibleSettings[
									data.internal.selection
								].default
							).map(([settingName, setting], i) => {
								return (
									<Input
										key={settingName + i}
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
								src={"/icon/learning/add.png"}
								alt="add"
								className="img-fluid"
							/>
						</Button>
						<ModalSettingsChooser
							show={modalShow}
							onHide={() => setModalShow(false)}
							options={
								data.setupParam.possibleSettings[
									data.internal.selection
								].options
							}
							data={data}
							id={id}
						/>
						{data.internal.checkedOptions.map((optionName) => {
							return (
								<Input
									key={optionName}
									name={optionName}
									settingInfos={
										data.setupParam.possibleSettings[
											data.internal.selection
										].options[optionName]
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

export default SelectionNode;