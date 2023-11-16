import { app, ipcMain, Menu, dialog, BrowserWindow } from "electron"
import axios from "axios"
import serve from "electron-serve"
import { createWindow } from "./helpers"
import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-extension-installer"
import MEDconfig, { SERVER_CHOICE, PORT_FINDING_METHOD } from "../medomics.dev"
const fs = require("fs")
var path = require("path")
const dirTree = require("directory-tree")
const { spawn, exec, execFile } = require("child_process")
var serverProcess = null
var flaskPort = MEDconfig.defaultPort
var hasBeenSet = false

const isProd = process.env.NODE_ENV === "production"

let splashScreen // The splash screen is the window that is displayed while the application is loading

if (isProd) {
  serve({ directory: "app" })
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`)
}

;(async () => {
  await app.whenReady()
  splashScreen = new BrowserWindow({
    icon: path.join(__dirname, "../resources/MEDomicsLabWithShadowNoText100.png"),
    width: 700,
    height: 700,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true,
    show: true
  })

  const mainWindow = createWindow("main", {
    width: 1500,
    height: 1000,
    show: false
  })

  if (isProd) {
    splashScreen.loadFile(path.join(__dirname, "splash.html"))
  } else {
    splashScreen.loadFile(path.join(__dirname, "../main/splash.html"))
  }
  splashScreen.once("ready-to-show", () => {
    splashScreen.show()
    splashScreen.focus()
    splashScreen.setAlwaysOnTop(true)
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
        { role: "paste" },
        { type: "separator" },
        {
          role: "preferences",
          label: "Preferences",
          click() {
            console.log("👋")
          },
          submenu: [
            {
              label: "Toggle dark mode",
              click: () => app.emit("toggleDarkMode")
            }
          ]
        }
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
  console.log("running mode:", isProd ? "production" : "development")
  console.log(MEDconfig.runServerAutomatically ? "Server will start automatically here (in background of the application)" : "Server must be started manually")
  MEDconfig.runServerAutomatically && console.log("Server type:", MEDconfig.serverChoice)
  if (MEDconfig.runServerAutomatically) {
    if (!isProd) {
      //**** DEVELOPMENT ****//

      findAvailablePort(MEDconfig.defaultPort)
        .then((port) => {
          flaskPort = port
          if (MEDconfig.serverChoice === SERVER_CHOICE.FLASK) {
            serverProcess = spawn(MEDconfig.condaEnv, ["-m", "flask", "run"], {
              cwd: path.join(process.cwd(), "flask_server"),
              env: {
                FLASK_APP: "server.py",
                FLASK_RUN_PORT: flaskPort,
                FLASK_ENV: "development",
                FLASK_DEBUG: 0
              }
            })
          } else if (MEDconfig.serverChoice === SERVER_CHOICE.GO) {
            serverProcess = execFile(`${process.platform == "win32" ? "main.exe" : "./main"}`, {
              windowsHide: false,
              cwd: path.join(process.cwd(), "go_server"),
              env: {
                ELECTRON_PORT: flaskPort,
                ELECTRON_CONDA_ENV: MEDconfig.condaEnv,
                ELECTRON_RUN_MODE: "dev"
              }
            })
          }
          if (serverProcess) {
            serverProcess.stdout.on("data", function (data) {
              console.log("data: ", data.toString("utf8"))
            })
            serverProcess.stderr.on("data", (data) => {
              console.log(`stderr: ${data}`)
            })
            serverProcess.on("close", (code) => {
              console.log(`server child process close all stdio with code ${code}`)
            })
          } else {
            throw new Error("You must choose a valid server in medomics.dev.js")
          }
        })
        .catch((err) => {
          console.error(err)
        })
    } else {
      //**** PRODUCTION ****//
      findAvailablePort(MEDconfig.defaultPort)
        .then((port) => {
          flaskPort = port
          console.log("__dirname: ", __dirname)
          console.log("app.getAppPath():", app.getAppPath())
          console.log("process.resourcesPath:", process.resourcesPath)
          console.log("env", process.env)
          serverProcess = execFile(path.join(__dirname, `${process.platform == "win32" ? "server_go.exe" : "server_go"}`), [flaskPort, "prod", process.resourcesPath], {
            windowsHide: false
            // env: {
            //   ELECTRON_PORT: flaskPort,
            //   ELECTRON_CONDA_ENV: MEDconfig.condaEnv,
            //   ELECTRON_RUN_MODE: "prod"
            // }
          })
          if (serverProcess) {
            serverProcess.stdout.on("data", function (data) {
              console.log("data: ", data.toString("utf8"))
            })
            serverProcess.stderr.on("data", (data) => {
              console.log(`stderr: ${data}`)
            })
            serverProcess.on("close", (code) => {
              console.log(`my server child process close all stdio with code ${code}`)
            })
          } else {
            throw new Error("You must choose a valid server in medomics.dev.js")
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
  } else {
    //**** NO SERVER ****//
    findAvailablePort(MEDconfig.defaultPort)
      .then((port) => {
        flaskPort = port
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  ipcMain.on("messageFromNext", (event, data) => {
    // Receives a message from Next.js
    console.log("messageFromNext : ", data)
    if (data === "requestDialogFolder") {
      // If the message is "requestDialogFolder", the function setWorkingDirectory is called
      setWorkingDirectory(event, mainWindow)
    } else if (data === "requestWorkingDirectory") {
      // If the message is "requestWorkingDirectory", the function getTheWorkingDirectoryStructure is called and the folder structure is returned to Next.js
      event.reply("messageFromElectron", {
        workingDirectory: dirTree(app.getPath("sessionData")),
        hasBeenSet: hasBeenSet,
        newPort: flaskPort
      })
      event.reply("workingDirectorySet", {
        workingDirectory: dirTree(app.getPath("sessionData")),
        hasBeenSet: hasBeenSet,
        newPort: flaskPort
      })
    } else if (data === "updateWorkingDirectory") {
      event.reply("updateDirectory", {
        workingDirectory: dirTree(app.getPath("sessionData")),
        hasBeenSet: hasBeenSet,
        newPort: flaskPort
      }) // Sends the folder structure to Next.js
    } else if (data === "getFlaskPort") {
      event.reply("getFlaskPort", {
        newPort: flaskPort
      }) // Sends the folder structure to Next.js
    } else if (data === "requestAppExit") {
      app.exit()
    }
  })

  app.on("toggleDarkMode", () => {
    console.log("toggleDarkMode")
    mainWindow.webContents.send("toggleDarkMode")
  })
  if (isProd) {
    await mainWindow.loadURL("app://./index.html")
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/`)
    mainWindow.webContents.openDevTools()
  }

  splashScreen.destroy()
  mainWindow.maximize()
  mainWindow.show()
})()

/**
 * @description Set the working directory
 * @summary Opens the dialog to select the working directory and  creates the folder structure if it does not exist
 *          When the working directory is set, the function returns the folder structure of the working directory as a JSON object in a reply to Next.js
 * @param {*} event
 * @param {*} mainWindow
 */
function setWorkingDirectory(event, mainWindow) {
  dialog
    .showOpenDialog(mainWindow, {
      // Opens the dialog to select the working directory (Select a folder window)
      properties: ["openDirectory"]
    })
    .then((result) => {
      if (result.canceled) {
        // If the user cancels the dialog
        console.log("Dialog was canceled")
        event.reply("messageFromElectron", "Dialog was canceled")
      } else {
        const file = result.filePaths[0]
        console.log(file)
        if (dirTree(file).children.length > 0) {
          // If the selected folder is not empty
          console.log("Selected folder is not empty")
          event.reply("messageFromElectron", "Selected folder is not empty")
          // Open a dialog to ask the user if he wants to still use the selected folder as the working directory or if he wants to select another folder
          dialog
            .showMessageBox(mainWindow, {
              type: "question",
              buttons: ["Yes", "No"],
              title: "Folder is not empty",
              message: "The selected folder is not empty. Do you want to use this folder as the working directory?"
            })
            .then((result) => {
              if (result.response === 0) {
                // If the user clicks on "Yes"
                console.log("Working directory set to " + file)
                event.reply("messageFromElectron", "Working directory set to " + file)
                app.setPath("sessionData", file)
                createWorkingDirectory()
                hasBeenSet = true // The boolean hasBeenSet is set to true to indicate that the working directory has been set
                // This is the variable that controls the disabled/enabled state of the IconSidebar's buttons in Next.js
                event.reply("messageFromElectron", dirTree(file))
                event.reply("workingDirectorySet", {
                  workingDirectory: dirTree(file),
                  hasBeenSet: hasBeenSet
                })
              } else if (result.response === 1) {
                // If the user clicks on "No"
                console.log("Dialog was canceled")
                event.reply("messageFromElectron", "Dialog was canceled")
              }
            })
        } else if (file === app.getPath("sessionData")) {
          // If the working directory is already set to the selected folder
          console.log("Working directory is already set to " + file)
          event.reply("messageFromElectron", "Working directory is already set to " + file)
          event.reply("workingDirectorySet", {
            workingDirectory: dirTree(file),
            hasBeenSet: hasBeenSet
          })
        } else {
          // If the working directory is not set to the selected folder
          // The working directory is set to the selected folder and the folder structure is returned to Next.js
          console.log("Working directory set to " + file)
          event.reply("messageFromElectron", "Working directory set to " + file)
          app.setPath("sessionData", file)
          createWorkingDirectory()
          hasBeenSet = true // The boolean hasBeenSet is set to true to indicate that the working directory has been set
          // This is the variable that controls the disabled/enabled state of the IconSidebar's buttons in Next.js
          event.reply("messageFromElectron", dirTree(file))
          event.reply("workingDirectorySet", {
            workingDirectory: dirTree(file),
            hasBeenSet: hasBeenSet
          })
        }
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

function createWorkingDirectory() {
  // See the workspace template in the repository
  createFolder("DATA")
  createFolder("EXPERIMENTS")
}

function createFolder(folderString) {
  // Creates a folder in the working directory
  const folderPath = path.join(app.getPath("sessionData"), folderString)

  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error(err)
      return
    }

    console.log("Folder created successfully!")
  })
}

function getTheWorkingDirectoryStructure() {
  // Returns the folder structure of the working directory
  const dirTree = require("directory-tree")
  const tree = dirTree(getWorkingDirectory())
  return tree
}

function getWorkingDirectory() {
  // Returns the working directory
  return app.getPath("sessionData")
}

ipcMain.handle("request", async (_, axios_request) => {
  const result = await axios(axios_request)
  return { data: result.data, status: result.status }
})

app.on("window-all-closed", () => {
  app.quit()
  console.log("app quit")
  if (MEDconfig.runServerAutomatically) {
    serverProcess.kill()
    console.log("serverProcess killed")
  }
})

if (MEDconfig.useReactDevTools) {
  app.on("ready", async () => {
    await installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true
      }
    })
  })
}

function findAvailablePort(startPort, endPort = 8000) {
  let killProcess = MEDconfig.portFindingMethod === PORT_FINDING_METHOD.FIX || !MEDconfig.runServerAutomatically
  let platform = process.platform
  return new Promise((resolve, reject) => {
    let port = startPort
    function tryPort() {
      exec(`netstat ${platform == "win32" ? "-ano | find" : "-ltnup | grep"} ":${port}"`, (err, stdout, stderr) => {
        if (err) {
          console.log(`Port ${port} is available !`)
          resolve(port)
        } else {
          if (killProcess) {
            let PID = stdout.trim().split(/\s+/)[stdout.trim().split(/\s+/).length - 1].split("/")[0]
            exec(`${platform == "win32" ? "taskkill /f /t /pid" : "kill"} ${PID}`, (err, stdout, stderr) => {
              if (!err) {
                console.log("Previous server instance was killed successfully")
                console.log(`Port ${port} is now available !`)
                resolve(port)
              }
              stdout && console.log(stdout)(stderr) && console.log(stderr)
            })
          } else {
            port++
            if (port > endPort) {
              reject("No available port")
            }
            tryPort()
          }
        }
      })
    }
    tryPort()
  })
}
