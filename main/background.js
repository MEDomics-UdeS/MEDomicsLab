import { app, protocol, BrowserWindow, ipcMain, Menu, dialog } from "electron";
import axios from "axios";
import serve from "electron-serve";
import { createWindow } from "./helpers";
const fs = require("fs");
var path = require("path");
const dirTree = require("directory-tree");

const isProd = process.env.NODE_ENV === "production";
var hasBeenSet = false;
if (isProd) {
	serve({ directory: "app" });
} else {
	app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
	await app.whenReady();

	const mainWindow = createWindow("main", {
		width: 1500,
		height: 1000,
	});
	const template = [
		{
			label: "File",
			submenu: [
				{
					label: "New Experiment",
					click() {
						console.log("New expriment created")
					}
				},
				{
					label: "New Workspace",
					click() {
						console.log("New expriment created")
					}
				},
				{ type: "separator" },
				{
					label: "Open Experiment",
					click() {
						console.log("Open expriment")
					}
				},
				{
					label: "Open Workspace",
					click() {
						console.log("Workspace opened")
					}
				},
				{ type: "separator" },
				{ role: "quit" }
			]
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" }
			]
		},
		{
			label: "Hello From Electron!",
			submenu: [
				{
					label: "I have a custom handler",
					click() {
						console.log("👋")
					}
				},
				{ type: "separator" },
				{ role: "reload" },
				{ role: "forcereload" },
				{ role: "toggledevtools" },
				{ type: "separator" },
				{ role: "resetzoom" },
				{ role: "zoomin" },
				{ role: "zoomout" },
				{ type: "separator" }
			]
		}
	]



	ipcMain.handle("request", async (_, axios_request) => {
		const result = await axios(axios_request)
		return { data: result.data, status: result.status }
	})

	ipcMain.on("messageFromNext", (event, data) => { // Receives a message from Next.js
		console.log("messageFromNext : ", data);
		if (data === "requestDialogFolder") { // If the message is "requestDialogFolder", the function setWorkingDirectory is called
			setWorkingDirectory(event, mainWindow);
		}
		else if (data === "requestWorkingDirectory") { // If the message is "requestWorkingDirectory", the function getTheWorkingDirectoryStructure is called and the folder structure is returned to Next.js
			event.reply("messageFromElectron", { "workingDirectory": dirTree(app.getPath('sessionData')), "hasBeenSet": hasBeenSet });
			event.reply("workingDirectorySet", { "workingDirectory": dirTree(app.getPath('sessionData')), "hasBeenSet": hasBeenSet });
		}
		else if (data === "updateWorkingDirectory") {
			event.reply("updateDirectory", { "workingDirectory": dirTree(app.getPath('sessionData')), "hasBeenSet": hasBeenSet }); // Sends the folder structure to Next.js
		}
		else if (data === "requestAppExit") {
			app.exit();
		}
	});


	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)

	if (isProd) {
		await mainWindow.loadURL("app://./index.html");
	} else {
		const port = process.argv[2];
		await mainWindow.loadURL(`http://localhost:${port}/`);
		mainWindow.webContents.openDevTools();
	}
})();

/**
 * @description Set the working directory
 * @summary Opens the dialog to select the working directory and  creates the folder structure if it does not exist
 *          When the working directory is set, the function returns the folder structure of the working directory as a JSON object in a reply to Next.js
 * @param {*} event 
 * @param {*} mainWindow 
 */
function setWorkingDirectory(event, mainWindow) {
	dialog.showOpenDialog(mainWindow, { // Opens the dialog to select the working directory (Select a folder window)
		properties: ['openDirectory']
	}).then(result => {
		if (result.canceled) { // If the user cancels the dialog
			console.log('Dialog was canceled')
			event.reply("messageFromElectron", "Dialog was canceled");
		} else {
			const file = result.filePaths[0]
			console.log(file)
			if (file === app.getPath('sessionData')) { // If the working directory is already set to the selected folder
				console.log('Working directory is already set to ' + file) 
				event.reply("messageFromElectron", 'Working directory is already set to ' + file);
				event.reply("workingDirectorySet", { "workingDirectory": dirTree(file), "hasBeenSet": hasBeenSet }); 

			}
			else { // If the working directory is not set to the selected folder
				// The working directory is set to the selected folder and the folder structure is returned to Next.js
				console.log('Working directory set to ' + file)
				event.reply("messageFromElectron", 'Working directory set to ' + file);
				app.setPath('sessionData', file);
				createWorkingDirectory();
				hasBeenSet = true; // The boolean hasBeenSet is set to true to indicate that the working directory has been set
				// This is the variable that controls the disabled/enabled state of the IconSidebar's buttons in Next.js
				event.reply("messageFromElectron", dirTree(file));
				event.reply("workingDirectorySet", { "workingDirectory": dirTree(file), "hasBeenSet": hasBeenSet });

			}
		}
	}).catch(err => {
		console.log(err)
	})
}


function createWorkingDirectory() { // See the workspace template in the repository
	createFolder("DATA");
	createFolder("EXPERIMENTS");
	createFolder("MODELS");
	createFolder("RESULTS");
}


function createFolder(folderString) { // Creates a folder in the working directory
	const folderPath = path.join(app.getPath('sessionData'), folderString);

	fs.mkdir(folderPath, { recursive: true }, (err) => {
		if (err) {
			console.error(err);
			return;
		}

		console.log('Folder created successfully!');
	});
}


function getTheWorkingDirectoryStructure() { // Returns the folder structure of the working directory
	const dirTree = require("directory-tree");
	const tree = dirTree(getWorkingDirectory());
	return tree;
}

function getWorkingDirectory() { // Returns the working directory
	return app.getPath('sessionData');
}


app.on("window-all-closed", () => {
	app.quit();
});
