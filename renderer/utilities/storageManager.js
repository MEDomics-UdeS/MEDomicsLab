
class StorageManager {
	constructor(path="./") {
		this.root = path;
	}

	setRoot(path) {
		this.root = path;
	}

	downloadJson(exportObj, exportName) {
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
		var downloadAnchorNode = document.createElement("a");
		downloadAnchorNode.setAttribute("href",     dataStr);
		downloadAnchorNode.setAttribute("download", exportName + ".json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	writeJson(exportObj, path, name) {
		const fs = require("fs");
		fs.writeFile(path + name + ".json", JSON.stringify(exportObj, null, 2), function (err) {
			if (err) {
				return console.log(err);
			}
			console.log("The file was saved!");
		});
	}

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

	loadJsonFile(path) {
		const fs = require("fs");
		try {
			const data = fs.readFileSync("./"+ path);
			const jsonData = JSON.parse(data);
			return jsonData;
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
  
export default StorageManager;