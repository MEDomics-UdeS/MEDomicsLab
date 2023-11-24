import { app, ipcMain, Menu, dialog, BrowserWindow, protocol } from "electron"
import axios from "axios"
import serve from "electron-serve"
import { createWindow } from "./helpers"
import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-extension-installer"
import MEDconfig, { PORT_FINDING_METHOD } from "../medomics.dev"
import { saveJSON, loadJSON } from "./helpers/datamanager"
import { main } from "@popperjs/core"
const fs = require("fs")
var path = require("path")
const dirTree = require("directory-tree")
const { spawn, exec, execFile } = require("child_process")
var serverProcess = null
var serverPort = MEDconfig.defaultPort
var hasBeenSet = false
var recentWorkspaces = {}
const isProd = process.env.NODE_ENV === "production"

let splashScreen // The splash screen is the window that is displayed while the application is loading

if (isProd) {
  serve({ directory: "app" })
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`)
}

;(async () => {
  await app.whenReady()

  protocol.registerFileProtocol("local", (request, callback) => {
    const url = request.url.replace(/^local:\/\//, "")
    const decodedUrl = decodeURI(url)
    try {
      return callback(decodedUrl)
    } catch (error) {
      console.error("ERROR: registerLocalProtocol: Could not get file path:", error)
    }
  })

  ipcMain.on("get-file-path", (event, configPath) => {
    event.reply("get-file-path-reply", path.resolve(configPath))
  })

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
  const openRecentWorkspacesSubmenuOptions = getRecentWorkspacesOptions(null, mainWindow)
  console.log("openRecentWorkspacesSubmenuOptions", openRecentWorkspacesSubmenuOptions)
  const menuTemplate = [
    {
      label: "File",
      submenu: [{ label: "Open recent", submenu: getRecentWorkspacesOptions(null, mainWindow) }, { type: "separator" }, { role: "quit" }]
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
      label: "Help",
      submenu: [
        {
          label: "Report an issue",
          click() {
            openWindowFromURL("https://forms.office.com/r/8tbTBHL4bv")
          }
        },
        {
          label: "Contact us",
          click() {
            openWindowFromURL("https://forms.office.com/r/Zr8xJbQs64")
          }
        },
        {
          label: "Join Us on Discord !",
          click() {
            openWindowFromURL("https://discord.gg/ZbaGj8E6mP")
          }
        },
        {
          label: "Documentation",
          click() {
            openWindowFromURL("https://medomics-udes.gitbook.io/medomicslab-docs")
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
  if (MEDconfig.runServerAutomatically) {
    if (!isProd) {
      //**** DEVELOPMENT ****//

      findAvailablePort(MEDconfig.defaultPort)
        .then((port) => {
          serverPort = port
          serverProcess = execFile(`${process.platform == "win32" ? "main.exe" : "./main"}`, [serverPort, "prod", process.cwd()], {
            windowsHide: false,
            cwd: path.join(process.cwd(), "go_server")
          })
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
          }
        })
        .catch((err) => {
          console.error(err)
        })
    } else {
      //**** PRODUCTION ****//
      findAvailablePort(MEDconfig.defaultPort)
        .then((port) => {
          serverPort = port
          console.log("_dirname: ", __dirname)
          console.log("process.resourcesPath: ", process.resourcesPath)
          if (process.platform == "win32") {
            serverProcess = execFile(path.join(process.resourcesPath, "go_executables\\server_go_win32.exe"), [serverPort, "prod", process.resourcesPath], {
              windowsHide: false
            })
          } else if (process.platform == "linux") {
            serverProcess = execFile(path.join(process.resourcesPath, "go_executables/server_go_linux"), [serverPort, "prod", process.resourcesPath], {
              windowsHide: false
            })
          } else if (process.platform == "darwin") {
            serverProcess = execFile(path.join(process.resourcesPath, "go_executables/server_go_mac"), [serverPort, "prod", process.resourcesPath], {
              windowsHide: false
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
              console.log(`my server child process close all stdio with code ${code}`)
            })
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
        serverPort = port
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  ipcMain.on("getRecentWorkspaces", (event, data) => {
    // Receives a message from Next.js
    console.log("GetRecentWorkspaces : ", data)
    if (data === "requestRecentWorkspaces") {
      // If the message is "requestRecentWorkspaces", the function getRecentWorkspaces is called
      getRecentWorkspaces(event, mainWindow)
    }
  })

  ipcMain.on("setWorkingDirectory", (event, data) => {
    app.setPath("sessionData", data)
    console.log("setWorkingDirectory : ", data)
    event.reply("workingDirectorySet", {
      workingDirectory: dirTree(app.getPath("sessionData")),
      hasBeenSet: true,
      newPort: serverPort
    })
  })

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
        newPort: serverPort
      })
      updateWorkspace(app.getPath("sessionData"))
      event.reply("workingDirectorySet", {
        workingDirectory: dirTree(app.getPath("sessionData")),
        hasBeenSet: hasBeenSet,
        newPort: serverPort
      })
    } else if (data === "getRecentWorkspaces") {
      let recentWorkspaces = loadWorkspaces()
      event.reply("recentWorkspaces", recentWorkspaces)
    } else if (data === "updateWorkingDirectory") {
      event.reply("updateDirectory", {
        workingDirectory: dirTree(app.getPath("sessionData")),
        hasBeenSet: hasBeenSet,
        newPort: serverPort
      }) // Sends the folder structure to Next.js
    } else if (data === "getServerPort") {
      event.reply("getServerPort", {
        newPort: serverPort
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
                // Add selected folder to the recent workspaces
                updateWorkspace(file)
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
          updateWorkspace(file)
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
  // See the workspace menuTemplate in the repository
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

/**
 * @description Open a new window from an URL
 * @param {*} url The URL of the page to open
 * @returns {BrowserWindow} The new window
 */
function openWindowFromURL(url) {
  let window = new BrowserWindow({
    icon: path.join(__dirname, "../resources/MEDomicsLabWithShadowNoText100.png"),
    width: 700,
    height: 700,
    transparent: true,
    center: true
  })

  window.loadURL(url)
  window.once("ready-to-show", () => {
    window.show()
    window.focus()
  })
}

/**
 * Loads the recent workspaces
 * @returns {Array} An array of workspaces
 */
function loadWorkspaces() {
  const userDataPath = app.getPath("userData")
  const workspaceFilePath = path.join(userDataPath, "workspaces.json")
  if (fs.existsSync(workspaceFilePath)) {
    const workspaces = JSON.parse(fs.readFileSync(workspaceFilePath, "utf8"))
    // Sort workspaces by date, most recent first
    return workspaces.sort((a, b) => new Date(b.last_time_it_was_opened) - new Date(a.last_time_it_was_opened))
  } else {
    return []
  }
}

/**
 * Saves the recent workspaces
 * @param {Array} workspaces An array of workspaces
 */
function saveWorkspaces(workspaces) {
  const userDataPath = app.getPath("userData")
  const workspaceFilePath = path.join(userDataPath, "workspaces.json")
  fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaces))
}

/**
 * Updates the recent workspaces
 * @param {String} workspacePath The path of the workspace to update
 */
function updateWorkspace(workspacePath) {
  const workspaces = loadWorkspaces()
  const workspaceIndex = workspaces.findIndex((workspace) => workspace.path === workspacePath)
  if (workspaceIndex !== -1) {
    // Workspace exists, update it
    workspaces[workspaceIndex].status = "opened"
    workspaces[workspaceIndex].last_time_it_was_opened = new Date().toISOString()
  } else {
    // Workspace doesn't exist, add it
    workspaces.push({
      path: workspacePath,
      status: "opened",
      last_time_it_was_opened: new Date().toISOString()
    })
  }
  app.setPath("sessionData", workspacePath)
  saveWorkspaces(workspaces)
}

/**
 * Generate recent workspaces options
 */
function getRecentWorkspacesOptions(event, mainWindow, workspacesArray = null) {
  let workspaces
  if (workspacesArray === null) {
    workspaces = loadWorkspaces()
  } else {
    workspaces = workspacesArray
  }
  const recentWorkspaces = workspaces.filter((workspace) => workspace.status === "opened")
  if (event !== null) {
    event.reply("recentWorkspaces", recentWorkspaces)
  }
  const recentWorkspacesOptions = recentWorkspaces.map((workspace) => {
    return {
      label: workspace.path,
      click() {
        updateWorkspace(workspace.path)
        let workspaceObject = { workingDirectory: dirTree(workspace.path), hasBeenSet: true, newPort: serverPort }

        mainWindow.webContents.send("openWorkspace", workspaceObject)
      }
    }
  })
  return recentWorkspacesOptions
}
