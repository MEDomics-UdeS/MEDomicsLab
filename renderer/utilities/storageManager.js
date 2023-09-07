import fs from "fs";


/**
 * @description Class that handles the storage of data
 * @class StorageManager
 * @param {string} path - The path to the root directory
 * @property {string} root - The path to the root directory
 * @method setRoot - Sets the root directory
 * @method downloadJson - Downloads a JSON file
 * @method writeJson - Writes a JSON file
 * @method loadJson - Loads a JSON file
 * @method loadJsonSync - Loads a JSON file synchronously
 * @method loadJsonFile - Loads a JSON file from a path
 * @returns {StorageManager} - The StorageManager class
 */
class StorageManager {
	constructor(path = "./") {
		this.root = path;
	}

	/**
	 * @description Sets the root directory
	 * @param {*} path 
	 */
	setRoot(path) {
		this.root = path;
	}

	/**
	 * @description Downloads a JSON file
	 * @param {*} exportObj 
	 * @param {*} exportName 
	 */
	downloadJson(exportObj, exportName) {
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
		var downloadAnchorNode = document.createElement("a");
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", exportName + ".json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	/**
	 * @description Writes a JSON file
	 * @param {*} exportObj - The object to export
	 * @param {*} path - The path to the file
	 * @param {*} name - The name of the file
	 */
	writeJson(exportObj, path, name) {
		fs.writeFile(path + name + ".json", JSON.stringify(exportObj, null, 2), function (err) {
			if (err) {
				return console.log(err);
			}
			console.log("The file was saved!");
		});
	}

	/**
	 * @description Loads a JSON file
	 * @returns {JSON} - The JSON file
	 */
	loadJson() {
		let jsonFile;
		let input = document.createElement("input");
		input.type = "file";
		input.onchange = function () {
			var reader = new FileReader();
			reader.onload = onReaderLoad;
			reader.readAsText(event.target.files[0]);
		}
		function onReaderLoad(event) {
			jsonFile = JSON.parse(event.target.result);
			console.log(jsonFile);

			return jsonFile;
		}
		input.click();
	}

	/**
	 * @description Loads a JSON file synchronously
	 * @returns {JSON} - The JSON file
	 */
	loadJsonSync() {
		return new Promise((resolve) => {
			let input = document.createElement("input");
			input.type = "file";
			input.onchange = function () {
				var reader = new FileReader();
				reader.onload = function (event) {
					const jsonFile = JSON.parse(event.target.result);
					console.log(jsonFile);
					resolve(jsonFile); // Resolve the Promise with the parsed JSON object
				};
				reader.readAsText(event.target.files[0]);
			};
			input.click();
		});
	}

	/**
	 * @description Loads a JSON file from a path
	 * @param {*} path - The path to the file
	 * @returns - The JSON file
	 */
	loadJsonFile(path) {
		try {
			const data = fs.readFileSync("./" + path);
			const jsonData = JSON.parse(data);
			return jsonData;
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}

export default StorageManager;