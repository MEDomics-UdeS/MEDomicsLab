import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable"; // https://react-select.com/creatable
import Select from "react-select";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify"; // https://www.npmjs.com/package/react-toastify

/**
 * 
 * @param {*} label new option label 
 * @returns {object} a new option
 * 
 * @description
 * This function is used to create a new option for the select
 */
const createOption = (label) => ({
	label,
	value: label,
});

/**
 * 
 * @param {string} name name of the setting
 * @param {object} settingInfos infos of the setting
 * @param {object} data data of the node 
 * @returns {JSX.Element} A Input component
 * 
 * @description
 * This component is used to display a Input component.
 * it handles multiple types of input and format them to be similar
 */
const Input = ({ name, settingInfos, data , onInputChange}) => {
	const [inputUpdate, setInputUpdate] = useState({})
	const [inputValue, setInputValue] = useState("");

	/**
     * 
     * @param {Event} event keydown event 
     * 
     * @description
     * This function is used to handle the keydown event on the input
     * it handles the creation of a new option 
     * this function is used only for the select input
     */
	const handleKeyDown = (event) => {
		if (!inputValue) return;
		switch (event.key) {
		case "Enter":
		case "Tab":
			(data.internal.settings[name] == undefined) && (data.internal.settings[name] = [])
			setInputUpdate({ name: name, value: [...data.internal.settings[name], createOption(inputValue)], type: settingInfos.type })
			setInputValue("");
			event.preventDefault();
		}
	};

	// execute this when an input is updated
	// it also verify if the input is correct
	useEffect(() => {
		if (inputUpdate.name != undefined) {
			if (inputUpdate.type == "int") {
				let regexPattern = /^-?[0-9]+$/;
				if (!regexPattern.test(inputUpdate.value)) {
					toast.warn("This input must be an integer", {
						position: "bottom-right",
						autoClose: 2000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
						theme: "light",
						toastId: "customId"
					});
				}
			}
			console.log("inputUpdate", inputUpdate)
			onInputChange(inputUpdate)
		}
	}, [inputUpdate])

	/**
     * 
     * @param {Object} settingInfos contains infos about the setting
     * @returns {JSX.Element} a correct input component according to the type of the setting
     * 
     * @description
     * This function is used to return a correct input component according to the type of the setting
     * it handles multiple types of input and format them to be similar
     * 
     */
	const getCorrectInputType = (settingInfos) => {
		switch (settingInfos.type) {
		case "string":
			return (
				<FloatingLabel
					controlId={name}
					label={name}
					className="margin-bottom-15 input-hov"
				>
					<Form.Control type="text" defaultValue={data.internal.settings[name]} onChange={e => setInputUpdate({ name: name, value: e.target.value, type: settingInfos.type })} />
				</FloatingLabel >
			)
		case "int":
			return (
				<FloatingLabel
					controlId={name}
					label={name}
					className="margin-bottom-15 input-hov"
				>
					<Form.Control type="number" defaultValue={data.internal.settings[name]} onChange={e => setInputUpdate({ name: name, value: e.target.value, type: settingInfos.type })} />
				</FloatingLabel >
			)
		case "float":
			return (
				<FloatingLabel
					controlId={name}
					label={name}
					className="margin-bottom-15 input-hov"
				>
					<Form.Control type="number" defaultValue={data.internal.settings[name]} onChange={e => setInputUpdate({ name: name, value: e.target.value, type: settingInfos.type })} />
				</FloatingLabel >
			)
		case "bool":
			return (
				<FloatingLabel
					controlId={name}
					label={name}
					className="margin-bottom-15 input-hov"
				>
					<Form.Select defaultValue={data.internal.settings[name]} onChange={e => setInputUpdate({ name: name, value: e.target.value, type: settingInfos.type })}>
						<option value="True">True</option>
						<option value="False">False</option>
					</Form.Select>
				</FloatingLabel >

			)
		case "list":
			return (
				<>
					<FloatingLabel
						controlId={name}
						label={name}
						className="margin-bottom-15 input-hov"
					>
						<Form.Select className="" defaultValue={data.internal.settings[name]} onChange={e => setInputUpdate({ name: name, value: e.target.value, type: settingInfos.type })}>
							{Object.entries(settingInfos.choices).map(([option, tooltip]) => {
								return (<option key={option} value={option}>{option}</option>);
							})}
						</Form.Select>
					</FloatingLabel>
				</>
			)
		case "list-multiple":
			return (
				<>
					<label className="custom-lbl">{name}</label>
					<Select
						options={

							Object.entries(settingInfos.choices).map(([option, tooltip]) => {
								(data.internal.settings[name] == undefined) && (data.internal.settings[name] = [])
								console.log("option", option)
								console.log("data.internal.settings[name]", data.internal.settings[name])
								if (!data.internal.settings[name].includes(option))
									return (createOption(option));
							})
						}

						value={data.internal.settings[name]}
						onChange={(newValue) => setInputUpdate({ name: name, value: newValue, type: settingInfos.type })}
						isMulti
						isClearable
						isSearchable
						isCreatable={false}
					/>
				</>
			)
		case "range":
			return (
				<FloatingLabel
					controlId={name}
					label={name}
					className="margin-bottom-15 input-hov"
				>
					<Form.Control type="range" defaultValue={data.internal.settings[name]} onChange={e => setInputUpdate({ name: name, value: e.target.value, type: settingInfos.type })} />
				</FloatingLabel >
			)
		case "custom-list":
			return (
				<>
					<label className="custom-lbl">{name}</label>
					<CreatableSelect
						components={
							{ DropdownIndicator: null }
						}
						inputValue={inputValue}
						isClearable
						isMulti
						menuIsOpen={false}
						onChange={(newValue) => setInputUpdate({ name: name, value: newValue, type: settingInfos.type })}
						onInputChange={(newValue) => setInputValue(newValue)}
						onKeyDown={handleKeyDown}
						placeholder="Add"
						value={data.internal.settings[name]}
						className="margin-bottom-15 input-hov"
					/>

				</>
			)
		case "pandas.DataFrame":
			return (
				<FloatingLabel
					controlId={name}
					label={name}
					className="margin-bottom-15 input-hov"
				>
					<Form.Control type="text" defaultValue={data.internal.settings[name]} onChange={e => setInputUpdate({ name: name, value: e.target.value, type: settingInfos.type })} />
				</FloatingLabel >
			)
		default:
			return (
				<FloatingLabel
					controlId={name}
					label={name}
					className="margin-bottom-15 input-hov"
				>
					<Form.Control type="text" defaultValue={data.internal.settings[name]} onChange={e => setInputUpdate({ name: name, value: e.target.value, type: settingInfos.type })} />
				</FloatingLabel >
			)
		}
	}
	return (
		<>
			{getCorrectInputType(settingInfos)}
		</>
	);
}

export default Input;