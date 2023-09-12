/** <h3>Dict containing specific data type conversion to string</h3>
 * */
var parser = {
	"list-multiple": function(input) {
		let value = [];
		for(let i = 0; i < input.children.length; i++) {
			if(input.children[i].selected) {
				value.push(input.children[i].innerHTML);
			}
		}
		return value;
	},
	"string": function(input) {
		return input.value + "";
	},
	"int": function(input) {
		return parseInt(input.value);
	},
	"float": function(input) {
		return parseFloat(input.value);
	},
	"bool": function(input) {
		return input.value == "true" || input.value == "True";
	},
	"list": function(input) {
		return input.value + "";
	},
	"other": function(input, optionType) {
		if(optionType == "custom-list") {
			return parser["list-multiple"](input);
		}
		return input.value + "";
	}
}

/** <h3>Class to create a modal specific to parent node's settings</h3>
 * <h4> Useful links: </h4>
 * <ul>
 *     <li>https://getbootstrap.com/docs/5.0/components/modal/</li>
 * </ul>
 * */
class Modal {
	constructor(id) {
		this.id = id;
	}

	generate(){
		let divModals = document.getElementById("modals");
		let innerhtmlModals =
            `<div class="modal fade" id="modal-${this.id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel-${this.id}" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered
               ${(() => {
		if(this.id == "error"){
			return " modal-lg";
		} else {
			return "";
		}
	})()}
               ">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel-${this.id}">
                            ${(() => {
		if(this.id == "error"){
			return "Error";
		}
		return `Settings available for ${nodesArray[this.id].type}`;
	})()}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="modalCheckbox-${this.id}">
                        ${(() => {
		if(this.id != "error"){
			let modalContent = "";
			Object.entries(nodesArray[this.id].possibleOptions).forEach(([optName,optContent]) => {
				modalContent += generateCheckbox(optName, optContent);
			});
			return modalContent;
		} else {
			return "";
		}
	})()}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                        ${(() => {
		if(this.id != "error"){
			return `<button type="button" id="btn-save-modal-${this.id}" class="btn btn-outline-primary" data-bs-dismiss="modal" >Save changes</button>`;
		} else {
			return "";
		}
	})()}
                    </div>
                </div>
            </div>`;
		divModals.insertAdjacentHTML("beforeend", innerhtmlModals);
	}

	setErrorMessage(message){
		let modalTextFeild = document.getElementById("modalCheckbox-error");
		modalTextFeild.innerHTML = message.replaceAll("\n", "<br>");
	}

	show(){
		$(`#modal-${this.id}`).modal("show");
	}

	refresh(){
		// TODO
	}

	reset(){
		let modal = document.getElementById("modalCheckbox-"+this.id);
		let modalContent = "";
		for (let key in nodesArray[this.id].possibleOptions) {
			let value = nodesArray[this.id].possibleOptions[key];
			modalContent += generateCheckbox(key, value);
		}
		modal.innerHTML = modalContent;
	}

	getElement(){
		return document.getElementById(`modal-${this.id}`);
	}

	/**
     * This function verify all options in modal if they are checked or not and if they already exists in the selected settings.
     *
     * @param id        {string}    id of the node and related modal to check
     * @param onImport  {boolean}   if the function is called from import or not
     */
	saveOptionsFromModal(onImport = false) {

		let divModals = document.getElementById("modalCheckbox-" + this.id);

		var children = divModals.children;
		for(let i=0; i<children.length; i++){
			let checkbox = children[i].getElementsByClassName("form-check-input")[0];
			if(checkbox.checked){
				if(!(checkbox.value in nodesArray[this.id].settings) || onImport){
					let elemHtml = nodesArray[this.id].createOption(checkbox.value);
					$(document).find(`#optionsContainer-${this.id}`)[0].insertAdjacentHTML("beforeend", elemHtml);
					updateTooltip();
				} else {
					console.log("already exist");
				}
			} else {
				let elem = document.getElementById(this.id+"."+checkbox.value);
				elem?.remove();
				delete nodesArray[this.id].settings[checkbox.value];
			}
		}
	}
}

/** <h3>Composed of every html element relative to a Node</h3>
 * <ul style="list-style: none;">
 * <li> A modal to add valid options of node</li>
 * <li> A div to contain all settings of node</li>
 * <li> A div to contain all results of node</li>
 * <li> A div to contain code editor of node</li>
 * </ul>
 * */
class NodeDrawflow {
	/** <h3>Class Node:</h3>
     * <p>Initialize all members of node</p>
     * @param id {string} id of the node
     */
	constructor(id) {
		this.id = id;                                                           // id of the node
		this.type = editor.getNodeFromId(id)["name"];                           // type of the node
		this.modal = new Modal(id);                                             // modal of the node's available settings
		// connected in/out auto TODO
		this.connections = {
			"connected": {"in": [], "out": []},
			"accepted":  {"in": editor.getNodeFromId(this.id)["data"]["input"], "out": editor.getNodeFromId(this.id)["data"]["output"]},
			"generateTooltip": () => {
				// TODO
			}
		}                                                // connections of the node
		this.nodeClasses = editor.getNodeFromId(id)["class"].split(" ");        // classes of the node (defined in addNodeToDrawFlow())
		this.settings = {};                                                     // settings of the node
		this.codeEditor = null;                                                 // code editor of the node (code tab)
		this.onImport = false;                                                  // if the node is created from import or not
		this.results = [];                                                      // results of the node
		this.pipeline = -1;
		this.uniqueIdResult = -1;

		//from classes defined in addNodeToDrawFlow()
		this.isStatic = this.nodeClasses.includes("static");                    // if the node is static or not
		this.isSelectionNode = this.nodeClasses.includes("selection");          // if the node is a selection node or not
		this.isSubModuleNode = this.nodeClasses.includes("subModuleOnDblclick");// if the node is a subModule node or not
		this.isRunnable = this.nodeClasses.includes("run");                     // if the node is runnable or not

		// save the possible settings of the node from global variable possibleSettings
		this.possibleSettings = possibleSettings[this.type];
		this.possibleOptions = null;
		this.possibleDefault = null;

		this.code = (this.isSelectionNode || this.isSubModuleNode || this.isStatic)? null : this.possibleSettings["code"];   // default code of the node
		this.hasDefault = false;                                                                            // if the node has default settings or not
		this.selectedValue = this.isSelectionNode? Object.keys(this.possibleSettings)[0]: null;             // selected value of the node (if it is a selection node)
	}

	/**
     * <p>Update node possible settings from Machine Learning type selected and call createNodeComponents() </p>
     */
	create(){
		hideAll();
		if(!this.isStatic && !this.isSubModuleNode){
			this.mlTypeChanged();
			this.createNodeComponents();
		}
	}

	/**
     * <p>Create all necessary node's components </p>
     */
	createNodeComponents(){
		let divSettings = document.getElementById("div-settings");
		let settingsHTML =
            `<div id="div-settings-${this.id}" class="container-fluid" style="display: none; padding: unset">
                <div class="row">
                    <div class="col-md-auto" style="height: 100%; border-right: 2px solid #378dfc">
                        <button type="button" class="btn btn-outline-primary" style="margin-top: 10px; margin-bottom: 10px; width:100%; " data-bs-toggle="modal" data-bs-target="#modal-${this.id}">
                            Select options
                        </button>
                        ${(() => {
		let defaultOptionsHTML = "";
		if(this.hasDefault){
			for(let option in this.possibleDefault) {
				defaultOptionsHTML += this.createOption(option, true);
			}
		}
		return defaultOptionsHTML;
	})()}
                        ${(() => {
		let datasetDefaultValue = "";
		if(this.type == "dataset"){
			let optionName = "filesFromInput";
			datasetDefaultValue += `
                                    <div id="${this.id}.filesFromInput" class="form-floating " data-bs-toggle="tooltip" data-bs-html="true" title="<h6>files from input: string </h6>choose dataframe from this list generated by the Input module">
                                        <select class="dynamic-select-${this.id}filesFromInput  form-control" id="input.${this.id}.filesFromInput" style="width: 225px;" name="datasetNode" onload="updateInputfromfiles()" onchange="updateFeild('input.${this.id}.filesFromInput', 'string')">
                                            ${(() => {
			let options = Object.keys(dataframes);
			let optionsHtml = "";
			for (let key in options) {
				optionsHtml += `<option value="${options[key]}">${options[key]}</option>`;
			}
			return optionsHtml;
		})()}
                                        </select>
                                        <label for="input.${this.id}.${optionName}">${optionName}</label>
                                    </div>`;
		}
		return datasetDefaultValue;
	})()}
                    </div>
                    <div class="col-md" >
                        <ul class="nav nav-tabs">
                            <li class="nav-item">
                                <a class="nav-link" data-bs-toggle="tab" href="#settings-${this.id}">Settings</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-bs-toggle="tab" href="#code-${this.id}">Code</a>
                            </li>
                        </ul>
                        <div class="spacer"></div>
                        <div id="myTabContent-${this.id}" class="tab-content">
                            <div class="tab-pane fade active show" id="settings-${this.id}">
                                <div class="spacer"></div>
                                <div id="optionsContainer-${this.id}" style="column-width: 230px;"></div>
                            </div>
                            <div class="tab-pane fade" style="display: flex" id="code-${this.id}">
                                <div class="container position-relative" style="width: border-box; min-height: 25vh; padding: unset">
                                    <div id="editor-${this.id}" style="position: absolute; width: 100%; height:100%; margin-top: 10px; border-radius: 2px !important;">${this.code}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

		// add new custom modal
		divSettings.insertAdjacentHTML("beforeend", settingsHTML);
		this.codeEditor = ace.edit(`editor-${this.id}`);
		this.codeEditor.setTheme("ace/theme/chaos");
		this.codeEditor.session.setMode(new PythonMode());
		document.getElementById(`editor-${this.id}`).style.fontSize="16px";
		this.modal.generate();
		updateTooltip();
	}

	/**
     *
     * @param option {string}       option name
     * @param isDefault {boolean}   if the option is a default option or not
     * @returns {string}            HTML code of the option
     */
	createOption(option, isDefault = false){
		let path = isDefault ? "default" : "options";
		let optionData = this.possibleSettings[path][option];
		console.log(this.possibleSettings[path]);
		console.log(option)
		let optionType = optionData.type;
		let tooltip = optionData.tooltip;
		let defaultValue = "";
		if(this.onImport) {
			defaultValue = this.settings[option];
		} else {
			defaultValue = ("defaultVal" in optionData) ? optionData.defaultVal : "";
			this.settings[option] = defaultValue;
		}
		let boxWidth = 225;
		let optionHTML = "";
		if (optionType == "string" || optionType == "pandas.DataFrame") {
			optionHTML = `<div id="${this.id}.${option}" class="form-floating" data-bs-toggle="tooltip" data-bs-html="true" title="<h6>${option}: ${optionType}</h6>${tooltip}">
                <input type="text" class="form-control" value="${defaultValue}" id="input.${this.id}.${option}" onchange="updateFeild('input.${this.id}.${option}', '${optionType}')" placeholder="placeholder">
                <label for="input.${this.id}.${option}">${option}</label>
            </div>`;
		}
		else if (optionType == "int") {
			optionHTML = `<div id="${this.id}.${option}" class="form-floating" data-bs-toggle="tooltip" data-bs-html="true" title="<h6>${option}: ${optionType}</h6>${tooltip}">
                <input type="number" class="form-control" value="${defaultValue}" id="input.${this.id}.${option}" placeholder="placeholder" onchange="updateFeild('input.${this.id}.${option}', '${optionType}')">
                <label for="input.${this.id}.${option}">${option}</label>
            </div>`;
		}
		else if (optionType == "float") {
			optionHTML = `<div id="${this.id}.${option}" class="form-floating" data-bs-toggle="tooltip" data-bs-html="true" title="<h6>${option}: ${optionType}</h6>${tooltip}">
                <input type="number" class="form-control" value="${defaultValue}" id="input.${this.id}.${option}" placeholder="placeholder" step=0.01 onchange="updateFeild('input.${this.id}.${option}', '${optionType}')">
                <label for="input.${this.id}.${option}">${option}</label>
            </div>`;
		}
		else if (optionType == "bool") {
			optionHTML =
                `<div id="${this.id}.${option}" class="form-floating " data-bs-toggle="tooltip" data-bs-html="true" title="<h6>${option}: ${optionType}</h6>${tooltip}" >
                    <select class=" dynamic-select-${this.id+option} form-control" id="input.${this.id}.${option}" style="width: ${boxWidth}px;" onchange="updateFeild('input.${this.id}.${option}', '${optionType}')">
                        ${(() => {
		let optionBool = "";
		let choices = ["true", "false"];
		for (let key in choices) {
			key = choices[key];
			if((defaultValue+"").toLowerCase() == key) {
				optionBool += `<option value="${key}" selected>${capitalizeFirstLetter(key)}</option>`;
			} else {
				optionBool += `<option value="${key}">${capitalizeFirstLetter(key)}</option>`;
			}
		}
		return optionBool;
	})()}
                    </select>
                    <label for="input.${this.id}.${option}">${option}</label>
                </div>`;
			$(document).ready(function() {
				$(`.dynamic-select-${this.id+option}`).select2({
					width: "style",
					selectionCssClass: ":all:",
				});
			});
		}
		else if (optionType.split("-")[0] == "list") {
			let isMultiple = false;
			if(optionType.split("-").length > 1) {
				isMultiple = optionType.split("-")[1] == "multiple";
			}
			optionHTML =
                `<div id="${this.id}.${option}" class="form-floating " data-bs-toggle="tooltip" data-bs-html="true" title="<h6>${option}: ${optionType}</h6>${tooltip}" >
                    <select class=" dynamic-select-${this.id+option} form-control" ${(() => {
	return isMultiple ? "multiple=\"multiple\"" : "";
})()} id="input.${this.id}.${option}" style="width: ${boxWidth}px;" onchange="updateFeild('input.${this.id}.${option}', '${optionType}')">
                        ${(() => {
		let optionList = "";
		let choices = optionData.choices;
		for (let key in choices) {
			let choiceTooltip = choices[key];
			optionList += `<option value="${key}" ${(() => {
				return defaultValue == key ? "selected" : "";
			})()} data-bs-toggle="tooltip" data-bs-html="true" title="${choiceTooltip}">${key}</option>`;
		}
		return optionList;
	})()}
                    </select>
                    <label for="input.${this.id}.${option}">${option}</label>
                </div>`;

			$(document).ready(function() {
				$(`.dynamic-select-${this.id+option}`).select2({
					width: "style",
					selectionCssClass: ":all:",
				});
			});
		}
		else if (optionType.split("-")[0] == "range") {
			let min = optionData["range"][0];
			let max = optionData["range"][1];
			let step = (optionType.split("-")[1] == "int") ? 1 : 0.01;
			optionHTML =
            `<div id="${this.id}.${option}" class="form-floating " data-bs-toggle="tooltip" data-bs-html="true" title="<h6>${option}: ${optionType}</h6>${tooltip}" >
                <input type="number" class="form-control" value="${defaultValue}" id="input.${this.id}.${option}" onchange="updateFeild('input.${this.id}.${option}')" placeholder="name@example.com" min="${min}" max="${max}" step="${step}">
                <label for="input.${this.id}.${option}">${option}</label>
            </div>`;
		}
		else if (optionType == "custom-list") {
			optionHTML =
                `<div id="${this.id}.${option}" class="form-floating " data-bs-toggle="tooltip" data-bs-html="true" title="<h6>${option}: ${optionType}</h6>${tooltip}" onfocusout="updateFeild('input.${this.id}.${option}', '${optionType}')">
                   <select class=" dynamic-select-${this.id}${option} form-control" id="input.${this.id}.${option}" style="width: ${boxWidth}px;" multiple="multiple" >
                    ${(() => {
		let optionsHtml = "";
		if (defaultValue != "" && defaultValue != "None") {
			for (let key in defaultValue) {
				optionsHtml += `<option value="${defaultValue[key]}" selected>${defaultValue[key]}</option>`;
			}
			return optionsHtml;
		}
	})()}
                   </select>
                  <label for="input.${this.id}.${option}">${option}</label>
                </div>`;

			$(document).ready(function() {
				$(`.dynamic-select-${this.id+option}`).select2({
					tags: true,
					width: "style",
					selectionCssClass: ":all:",
				});
			});
		}
		else {
			console.log("unknown option type");
		}
		updateTooltip();
		return optionHTML;
	}

	/**
     * <p>Updates code settings</p>
     * <p> Called when the user changes a setting</p>
     */
	updateCodeSettings() {
		let addText = "";
		let prevText = this.codeEditor.getValue();
		for(let option in this.settings) {
			if(option in this.possibleOptions) {
				let optionValue = this.settings[option];
				let optionType = this.possibleOptions[option]["type"];
				let value = "";
				if(optionType == "string" || optionType == "list")
					value = `"${optionValue}"`;
				else if(optionType == "list-multiple" || optionType == "custom-list")
					value = `[${(() => {
						let valueList = optionValue;
						let valueListStr = "";
						for (let key in valueList) {
							valueListStr += `'${valueList[key]}'${key < valueList.length-1 ? ", ": ""}`;
						}
						return valueListStr;
					})()}]`;
				else
					value = optionValue;

				addText += `${option} = ${value}, `;
			}
		}
		if (this.connections.accepted.in != []) {
			for (let i in this.connections.accepted.in) {
				addText = `${this.connections.accepted.in[i]}, ` + addText;
			}
		}

		let index = 0;
		let bracketStart = prevText.indexOf("(", index);
		let bracketEnd = prevText.indexOf(")", index);

		let startSub = prevText.substring(0, bracketStart + 1);
		let endSub = prevText.substring(bracketEnd, prevText.length);
		let newText = startSub + addText.substring(0,addText.length-2) + endSub;

		this.codeEditor.setValue(newText);
	}

	/**
     * <p>Updates possible settings of the node and call a reset</p>
     * @param newVal {String} - The new selected value of the node
     */
	nodeSelectionChanged(newVal){
		console.log("Selection changed to " + newVal);
		this.selectedValue = newVal;
		this.possibleSettings = possibleSettings[this.type][newVal];
		this.possibleOptions = this.possibleSettings["options"];
		this.code = this.possibleSettings["code"];
		if ("default" in this.possibleSettings) {
			this.possibleDefault = this.possibleSettings["default"];
		} else {
			if ("default" in this.possibleSettings) {
				for(let key in this.possibleSettings["default"]) {
					delete this.settings[key];
				}
				this.possibleDefault = null;
			}
		}
		console.log(this.id)
		this.reset();
	}

	/**
     * <p>Updates HTML elements from new settings </p>
     */
	reset(){
		this.emptyDivSettings();
		this.modal.reset();

		let defaultOptionsDiv = document.getElementById(`div-settings-${this.id}`)
			.querySelector(".row")
			.querySelector(".col-md-auto");
		const options = defaultOptionsDiv.querySelectorAll(".form-floating");
		options.forEach(option => {
			option.remove();
		});
		if(this.hasDefault) {
			let innerhtml = "";
			for(let option in this.possibleDefault) {
                
				innerhtml += this.createOption(option, true);
			}
			defaultOptionsDiv.insertAdjacentHTML("beforeend", innerhtml);
		}
		this.codeEditor.setValue(this.possibleSettings["code"]);
		updateTooltip();
	}

	/**
     * <p>Empty div settings </p>
     * <p>Utility function</p>
     */
	emptyDivSettings(){
		let optionalSettingsDiv = $(`#optionsContainer-${this.id}`)[0];
		for(let i = 0; i < optionalSettingsDiv.children.length; i++) {
			let optionToRemove = optionalSettingsDiv.children[i].id.split(".")[1];
			delete this.settings[optionToRemove];
		}
		console.log(optionalSettingsDiv.innerHTML);
		optionalSettingsDiv.innerHTML = "";
	}

	/**
     * <p>Updates the settings of the node</p>
     * @param event {boolean} - if a reset is needed
     */
	mlTypeChanged(event = false){
		this.possibleSettings = possibleSettings[this.type];
		if(this.isSelectionNode) {
			this.possibleSettings = possibleSettings[this.type][this.selectedValue];
			this.possibleOptions = this.possibleSettings["options"];
			this.code = this.possibleSettings["code"];
			if ("default" in this.possibleSettings) {
				this.possibleDefault = this.possibleSettings["default"];
				this.hasDefault = true;
			} else {
				this.possibleDefault = null;
				this.hasDefault = false;
			}
		} else {
			if(!this.isSubModuleNode) {
				this.possibleOptions = this.possibleSettings["options"];
				if ("default" in this.possibleSettings) {
					this.possibleDefault = this.possibleSettings["default"];
					this.hasDefault = true;
				} else {
					this.possibleDefault = null;
					this.hasDefault = false;
				}
			}
		}
		if(event) {
			this.reset();
		}
	}

	/**
     * Create div results containing results content from getResultsContent()
     * @param resPipelineIndex {int} - index of the result pipeline
     * @param pipeResCount {int} - count of node's type in the result pipeline
     * @returns {string} - HTML code of the div results
     */
	createNodeResults(pipeIndex, results) {
		this.results = results;
		this.pipeline = pipeIndex;
		this.uniqueIdResult = `${this.pipeline}.${this.id}`;
		return `
            <div id="div-results-content-${this.uniqueIdResult}" className="container-fluid" style="height: auto; display: none; overflow-y:auto; overflow-x: hidden">
                ${
	this.getResultsContent(pipeIndex)
}
            </div>
        `;
	}

	/**
     * <p>Creates the HTML code for the node results content</p>
     * @param pipeIndex {int} - index of the result pipeline
     * @param indexInPipeline {int} - count of node's type in the result pipeline
     * @returns {string} - HTML code of the node results content
     */
	getResultsContent(pipeIndex) {
		let resultsHTML = `${this.id}, ${this.type}`;

		if(this.type == "dataset" || this.type == "clean") {
			resultsHTML = `
                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">${capitalizeFirstLetter(this.type)}</h4>
                            </div>
                            <div class="card-body">
                                ${(() => {
		return this.createDataTable(pipeIndex);
	})()}
                                <div class="table-responsive">
                                    <table class="table" style="width: fit-content">
                                        <thead class=" text-primary">
                                            <th>
                                                Option
                                            </th>
                                            <th>
                                                Value
                                            </th>
                                        </thead>
                                        <tbody>
                                            ${(() => {
		let content = "";
		for (let key in this.results["logs"]["setup"]) {
			content += `
                                                        <tr>
                                                            <td>
                                                                ${key}
                                                            </td>
                                                            <td>
                                                                ${this.results["logs"]["setup"][key]}
                                                            </td>
                                                        </tr>
                                                    `;
		}
		return content;
	})()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
		}
		else if(this.type == "createModel" || this.type == "compareModels") {
			resultsHTML = `
                <div class="row">
                    ${(() => {
		let content = `<div class="accordion" id="accordionPanelsStayOpenExample-${this.uniqueIdResult}">`;
		for(let model in this.results["logs"]["models"]) {
			let modelName = model.split("-")[1];
			let modelIndex = model.split("-")[0];
			content += `
                                <div class="spacer"></div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="panelsStayOpen-heading${modelIndex}">
                                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapse${modelIndex}" aria-expanded="false" aria-controls="panelsStayOpen-collapse${modelIndex}">
                                            ${modelName}
                                        </button>
                                    </h2>
                                    <div id="panelsStayOpen-collapse${modelIndex}" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-heading${modelIndex}">
                                        <div class="accordion-body">
                                            <div class="col-md-12">
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <div class="card">
                                                            <div class="card-header">
                                                                <h4 class="card-title">Metrics</h4>
                                                            </div>
                                                            <div class="card-body">
                                                                <div class="table-responsive">
                                                                    <table class="table">
                                                                        <thead class=" text-primary">
                                                                            <th>
                                                                                Metric
                                                                            </th>
                                                                            <th>
                                                                                Value
                                                                            </th>
                                                                        </thead>
                                                                        <tbody>
                                                                            ${(() => {
			let content = "";
			for (let key in this.results["logs"]["models"][model]["metrics"][0]) {
				content += `
                                                                                        <tr>
                                                                                            <td>
                                                                                                ${key}
                                                                                            </td>
                                                                                            <td>
                                                                                                ${this.results["logs"]["models"][model]["metrics"][0][key]}
                                                                                            </td>
                                                                                        </tr>
                                                                                    `;
			}
			return content;
		})()}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="card">
                                                            <div class="card-header">
                                                                <h4 class="card-title">Parameters</h4>
                                                            </div>
                                                            <div class="card-body">
                                                                <div class="table-responsive">
                                                                    <table class="table">
                                                                        <thead class=" text-primary">
                                                                            <th>
                                                                                Option
                                                                            </th>
                                                                            <th>
                                                                                Value
                                                                            </th>
                                                                        </thead>
                                                                        <tbody>
                                                                            ${(() => {
			let content = "";
			for (let key in this.results["logs"]["models"][model]["params"][0]) {
				content += `
                                                                                        <tr>
                                                                                            <td>
                                                                                                ${key}
                                                                                            </td>
                                                                                            <td>
                                                                                                ${this.results["logs"]["models"][model]["params"][0][key]}
                                                                                            </td>
                                                                                        </tr>
                                                                                    `;
			}
			return content;
		})()}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
		}
		content += "</div>";
		return content;
	})()}
                </div>
            `;
		}
		else if(this.type == "analyse") {
			let typeSelection = $(`#node-${this.id}`).find("select").val();
			console.log(typeSelection);
			if(typeSelection == "plotModel" || typeSelection == "interpretModel") {
				resultsHTML = `
                    <div class="container-fluid">
                        ${(() => {
		let content = "";
		for (let model in this.results["data"]) {
			console.log(model);
			content += `
                                    <img class="clickFullScreen" src="../${this.results["data"][model]}"  height="350px" style="padding: 10px">
                                `;
		}
		return content;
	})()}
                    </div>
                `;
			}
		}
		else if(this.type == "deploy") {
			let typeSelection = $(`#node-${this.id}`).find("select").val();
			console.log(typeSelection);
			if(typeSelection == "saveModel") {
				resultsHTML = `
                    <div class="container-fluid">
                        <div class="table-responsive">
                            <table class="table" style="width: fit-content">
                                <thead class=" text-primary">
                                    <th>
                                        <h4>Model</h4>
                                    </th>
                                    <th>
                                        <h4>Download link</h4>
                                    </th>
                                </thead>
                                <tbody>
                                    ${(() => {
		let content = "";
		for (let model in this.results["data"]) {
			content += `
                                                <tr>
                                                    <td>
                                                        <h5>${model}</h5>
                                                    </td>
                                                    <td>
                                                       <button class="btn btn-outline-success downloadBtn" style="border-radius: 3px; height: 40px " onclick="downloadFile('../${this.results["data"][model]}')" ><img id="test" src="../static/icon/downloadFixed.png" width="20" height="20"> </img>Download</button>
                                                    </td>
                                                </tr>
                                            `;
		}
		return content;
	})()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
			}
		}
		return resultsHTML;
	}
    
	/**
     * Create table for results
     * @param pipeIndex {int} index of the pipeline
     * @returns {string} HTML code for the table
     */
	createDataTable(pipeIndex){
		let header = Object.keys(JSON.parse(this.results["data"])[0]);
		let dataTableHtml = `
            <table class='table display cell-border compact' id='table-${pipeIndex}-${this.id}' data-dfStr=${this.results["data"]} style='width: 100%'>
                <thead>
                    <tr>
                        ${(() => {
		let content = "";
		header.forEach(header => {
			content += `<th>${header}</th>`;
		});
		return content;
	})()}
                    </tr>
                </thead>
            </table>
        `;
		return dataTableHtml;
	}

	/**
     * Get necessary data from node to export
     * @returns {Object} data to export
     */
	export(){
		let oldStandardNodesInfos = {
			"type": this.type,
			"settings": this.settings,
			"code" : this.code
		};
		if(this.isSelectionNode){
			oldStandardNodesInfos["selection"] = this.selectedValue;
		}
		return oldStandardNodesInfos;
	}

	/**
     * Create Node from imported data
     * @param data {Object} data to import
     */
	importNodeData(data){
		this.onImport = true;
		if("selection" in data){
			this.selectedValue = data["selection"];
		}
		if("code" in data){
			this.code = data["code"];
		}
		if("settings" in data){
			this.settings = data["settings"];
		}
		this.create();
		let divModals = document.getElementById("modalCheckbox-" + this.id);
		for (let option in this.settings) {
			let elements = divModals.querySelectorAll(".form-check");
			Array.from(elements).forEach((element, index) => {
				if(element.querySelectorAll(".form-check-input")[0].value == option){
					element.querySelectorAll(".form-check-input")[0].checked = true;
				}
			});
		}
		this.modal.saveOptionsFromModal(this.onImport);
		if(this.type == "dataset") {
			let elems = document.getElementById(`${this.id}.filesFromInput`).getElementsByTagName("*");
			for(let i = 0 ; i < elems.length ; i++){
				elems[i].disabled = true;
			}
		}
		this.onImport = false;
	}

	/**
     * Request backend to run the node and get the results
     */
	run(){
		let json = getSceneJson();
		json["upToId"] = this.id;
		sendRunRequest(json);
	}
    
	getNodeElement(){
		return $(`#node-${this.id}`);
	}
}

