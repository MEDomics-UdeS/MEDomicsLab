import { app, ipcMain, Menu, dialog, BrowserWindow } from "electron"
import axios from "axios"
import serve from "electron-serve"
import { createWindow } from "./helpers"
import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-extension-installer"
const fs = require("fs")
var path = require("path")
const dirTree = require("directory-tree")
var serverProcess = null
var flaskPort = 5000
var hasBeenSet = false

const RUN_SERVER_WITH_APP = true
const USE_REACT_DEV_TOOLS = false

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

  // const splashScreen = createWindow("splash", {
  //   width: 700,
  //   height: 700,
  //   transparent: false,
  //   frame: true,
  //   alwaysOnTop: true,
  //   center: true,
  //   show: false
  // })

  const mainWindow = createWindow("main", {
    width: 1500,
    height: 1000,
    show: false
  })

  splashScreen.loadFile(path.join(__dirname, "../main/splash.html"))
  splashScreen.once("ready-to-show", () => {
    splashScreen.show()
    splashScreen.focus()
    splashScreen.setAlwaysOnTop(true)
  }
  )


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
  console.log(RUN_SERVER_WITH_APP ? "Server will start automatically here (in background of the application)" : "Server must be started manually")
  if (RUN_SERVER_WITH_APP) {
    if (!isProd) {
      //**** DEVELOPMENT ****//
      // IMPORTANT: Select python interpreter (related to your virtual environment)
      var path2conda = fs.readFileSync("./path2condaenv_toDeleteInProd.txt", "utf8").replace(/\s/g, "")
      console.log(`path2conda: "${path2conda}"`)

      const net = require("net")

      function findAvailablePort(startPort, endPort) {
        return new Promise((resolve, reject) => {
          const net = require("net")
          let port = startPort

          function tryPort() {
            const server = net.createServer()
            server.once("error", (err) => {
              if (err.code === "EADDRINUSE") {
                port++
                if (port <= endPort) {
                  tryPort()
                } else {
                  reject(new Error("No available ports found"))
                }
              } else {
                reject(err)
              }
            })
            server.once("listening", () => {
              server.close()
              resolve(port)
            })
            server.listen(port, "127.0.0.1", () => {
              server.close()
            })
          }

          tryPort()
        })
      }

      findAvailablePort(5000, 8000)
        .then((port) => {
          console.log(`Available port: ${port}`)
          serverProcess = require("child_process").spawn(path2conda, ["./flask_server/server.py", "--port=" + port])
          flaskPort = port
          serverProcess.stdout.on("data", function (data) {
            console.log("data: ", data.toString("utf8"))
          })
          serverProcess.stderr.on("data", (data) => {
            console.log(`stderr: ${data}`) // when error
          })
          serverProcess.on("close", (code) => {
            console.log(`child process close all stdio with code ${code}`)
          })
        })
        .catch((err) => {
          console.error(err)
        })
    } else {
      //**** PRODUCTION ****//
      let backend
      backend = path.join(process.cwd(), "resources/backend/dist/app.exe")
      var execfile = require("child_process").execFile
      execfile(
        backend,
        {
          windowsHide: true
        },
        (err, stdout, stderr) => {
          if (err) {
            console.log(err)
          }
          if (stdout) {
            console.log(stdout)
          }
          if (stderr) {
            console.log(stderr)
          }
        }
      )
      const { exec } = require("child_process")
      exec("taskkill /f /t /im app.exe", (err, stdout, stderr) => {
        if (err) {
          console.log(err)
          return
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
      })
    }
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
        hasBeenSet: hasBeenSet
      })
      event.reply("workingDirectorySet", {
        workingDirectory: dirTree(app.getPath("sessionData")),
        hasBeenSet: hasBeenSet
      })
    } else if (data === "updateWorkingDirectory") {
      event.reply("updateDirectory", {
        workingDirectory: dirTree(app.getPath("sessionData")),
        hasBeenSet: hasBeenSet
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
        if (file === app.getPath("sessionData")) {
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
  if (!isProd && RUN_SERVER_WITH_APP) {
    serverProcess.kill()
    console.log("serverProcess killed")
  }
})

if (USE_REACT_DEV_TOOLS) {
  app.on("ready", async () => {
    await installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true
      }
    })
  })
}
