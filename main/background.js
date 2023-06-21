import { app, protocol, BrowserWindow, ipcMain, Menu } from "electron";
import axios from "axios";
import serve from "electron-serve";
import { createWindow } from "./helpers";
var path = require("path");

const isProd = process.env.NODE_ENV === "production";

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


	// ca fonctionne pas pour l'instant
	// // var conda = require('child_process').spawn('C:\\Users\\gblai\\anaconda3\\Scripts\\conda.exe', ['run', '-n', 'med', '/bin/bash', '-c', 'source activate med']);
	// // var conda = require('child_process').spawn('C:\\Users\\gblai\\anaconda3\\Scripts\\conda.exe', ['activate', 'med']);
	// var conda = require('child_process').spawn('cmd.exe', ['/c', 'call', '/v', '/k', path.join("C:\\Users\\gblai\\anaconda3\\envs\\med\\Lib\\site-packages\\virtualenv\\activation\\batch\\activate.bat"), 'med']);

	// conda.on('exit', function (code) {
	//   if (code === 0) {
	//     console.error('Failed to activate conda environment');
	//     return;
	//   }

	//   // execute the Python file
	//   var python = require('child_process').spawn('py', ['./Flask_server/server.py']);

	//   python.stdout.on('data', function (data) {
	//     console.log(data.toString());
	//   });

	//   python.stderr.on('data', function (data) {
	//     console.error(data.toString());
	//   });
	//   python.on('exit', function (code) {
	//     console.log('Child process exited with code ' + code);
	//   });
	// });
	// conda.catch(function (err) {
	//   console.error(err);
	// });

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

ipcMain.handle("request", async (_, axios_request) => {
	const result = await axios(axios_request)
	return { data: result.data, status: result.status }
})

app.on("window-all-closed", () => {
	app.quit();
});
