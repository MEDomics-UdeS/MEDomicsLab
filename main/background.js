import { app, protocol, BrowserWindow, ipcMain, Menu } from "electron"
import axios from "axios"
import serve from "electron-serve"
import { createWindow } from "./helpers"
var path = require("path")

const isProd = process.env.NODE_ENV === "production"

if (isProd) {
  serve({ directory: "app" })
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`)
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow("main", {
    width: 1500,
    height: 1000
  })
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

  // link: https://medium.com/red-buffer/integrating-python-flask-backend-with-electron-nodejs-frontend-8ac621d13f72
  //**** DEVELOPMENT ****//
  // Select python interpreter (related to your virtual environment)
  var pythonInterpreter = "C:\\Users\\gblai\\anaconda3\\envs\\med\\python.exe"

  var python = require("child_process").spawn(pythonInterpreter, [
    "./flask_server/server.py"
  ])
  python.stdout.on("data", function (data) {
    console.log("data: ", data.toString("utf8"))
  })
  python.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`) // when error
  })

  //**** PRODUCTION ****//
  //   let backend;
  //   backend = path.join(process.cwd(), 'resources/backend/dist/app.exe')
  //   var execfile = require(‘child_process’).execFile;
  //   execfile(
  //    backend,
  //    {
  // 	windowsHide: true,
  //    },
  //    (err, stdout, stderr) => {
  // 	if (err) {
  // 	console.log(err);
  // 	}
  // 	if (stdout) {
  // 	console.log(stdout);
  // 	}
  // 	if (stderr) {
  // 	console.log(stderr);
  // 	}
  //    }
  //   )
  // const { exec } = require(‘child_process’);
  // exec(‘taskkill /f /t /im app.exe’, (err, stdout, stderr) => {
  //  if (err) {
  //   console.log(err)
  //  return;
  //  }
  //  console.log(`stdout: ${stdout}`);
  //  console.log(`stderr: ${stderr}`);
  // });

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  if (isProd) {
    await mainWindow.loadURL("app://./index.html")
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/`)
    mainWindow.webContents.openDevTools()
  }
})()

ipcMain.handle("request", async (_, axios_request) => {
  const result = await axios(axios_request)
  return { data: result.data, status: result.status }
})

app.on("window-all-closed", () => {
  app.quit()
})
