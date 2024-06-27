import { app, ipcMain, Menu, dialog, BrowserWindow, protocol } from "electron"
import axios from "axios"
import serve from "electron-serve"
import { createWindow } from "./helpers"
import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-extension-installer"
import MEDconfig from "../medomics.dev"
import { runServer } from "./utils/server"
import { setWorkingDirectory, getRecentWorkspacesOptions, loadWorkspaces, createMedomicsDirectory } from "./utils/workspace"

const MongoClient = require("mongodb").MongoClient
const mongoUrl = "mongodb://localhost:27017"
const fs = require("fs")
var path = require("path")
let mongoProcess = null
const dirTree = require("directory-tree")
const { exec, spawn } = require("child_process")
var serverProcess = null
var serverPort = MEDconfig.defaultPort
var hasBeenSet = false
const isProd = process.env.NODE_ENV === "production"
var serverIsRunning = false
let splashScreen // The splash screen is the window that is displayed while the application is loading
var mainWindow // The main window is the window of the application

//**** LOG ****// This is used to send the console.log messages to the main window
const originalConsoleLog = console.log
/**
 * @description Sends the console.log messages to the main window
 * @param {*} message The message to send
 * @summary We redefine the console.log function to send the messages to the main window
 */
console.log = function () {
  try {
    originalConsoleLog(...arguments)
    if (mainWindow !== undefined) {
      mainWindow.webContents.send("log", ...arguments)
    }
  } catch (error) {
    console.error(error)
  }
}

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

  mainWindow = createWindow("main", {
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
  const openRecentWorkspacesSubmenuOptions = getRecentWorkspacesOptions(null, mainWindow, hasBeenSet)
  console.log("openRecentWorkspacesSubmenuOptions", JSON.stringify(openRecentWorkspacesSubmenuOptions, null, 2))
  const menuTemplate = [
    {
      label: "File",
      submenu: [{ label: "Open recent", submenu: getRecentWorkspacesOptions(null, mainWindow, hasBeenSet) }, { type: "separator" }, { role: "quit" }]
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
          click: () => {
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

  console.log("running mode:", isProd ? "production" : "development")
  console.log(MEDconfig.runServerAutomatically ? "Server will start automatically here (in background of the application)" : "Server must be started manually")
  if (MEDconfig.runServerAutomatically) {
    runServer(isProd, serverPort, serverProcess, serverIsRunning)
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
      getRecentWorkspacesOptions(event, mainWindow, hasBeenSet)
    }
  })

  /*   ipcMain.on("setDB", (event, data) => {
    event.reply("DBSet", {
      name: data,
      hasBeenSet: true,
      newPort: serverPort
    })
  }) */

  ipcMain.handle("setWorkingDirectory", async (event, data) => {
    app.setPath("sessionData", data)
    console.log("setWorkingDirectory : ", data)
    createMedomicsDirectory(data)
    hasBeenSet = true
    try {
      // Stop MongoDB if it's running
      await stopMongoDB(mongoProcess)
      // Start MongoDB with the new configuration
      startMongoDB(data, mongoProcess)
      return {
        workingDirectory: dirTree(app.getPath("sessionData")),
        hasBeenSet: true,
        newPort: serverPort
      }
      /* event.reply("workingDirectorySet", {
          workingDirectory: dirTree(app.getPath("sessionData")),
          hasBeenSet: true,
          newPort: serverPort
        }) */
    } catch (error) {
      console.error("Failed to change workspace: ", error)
    }
  })

  /**
   * @description Returns the path of the specified directory of the app
   * @param {String} path The path to get
   * @returns {Promise<String>} The path of the specified directory of the app
   */
  ipcMain.handle("appGetPath", async (_event, path) => {
    return app.getPath(path)
  })

  /**
   * @description Copies the source file to the destination file set by the user in the dialog
   * @param {String} source The source file to copy
   * @param {String} defaultPath The default path to set in the dialog - If null, the default path will be the user's home directory
   * @returns {Promise<String>} The destination file
   */
  ipcMain.handle("appCopyFile", async (_event, source) => {
    // Get the filename from the source path
    let filename = path.basename(source)
    const { filePath } = await dialog.showSaveDialog({
      title: "Save file",
      defaultPath: filename.length > 0 ? filename : source,
      filters: [{ name: "All Files", extensions: ["*"] }]
    })
    if (filePath) {
      fs.copyFileSync(source, filePath)
      return filePath
    }
  })

  /**
   * @description select path to folder
   * @returns {String} path to the selected folder
   */
  ipcMain.handle("select-folder-path", async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"]
    })
    return result
  })

  /**
   * @description Returns the settings
   * @returns {Object} The settings
   * @summary Returns the settings from the settings file if it exists, otherwise returns an empty object
   */
  ipcMain.handle("get-settings", async () => {
    const userDataPath = app.getPath("userData")
    const settingsFilePath = path.join(userDataPath, "settings.json")
    if (fs.existsSync(settingsFilePath)) {
      const settings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"))
      return settings
    } else {
      return {}
    }
  })

  /**
   * @description Saves the settings
   * @param {*} event The event
   * @param {*} settings The settings to save
   */
  ipcMain.on("save-settings", async (_event, settings) => {
    const userDataPath = app.getPath("userData")
    const settingsFilePath = path.join(userDataPath, "settings.json")
    console.log("settings to save : ", settingsFilePath, settings)
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings))
  })

  /**
   * @description Gets the collections of a database
   * @param {*} event The event
   * @param {*} dbName The name of the database
   *
   */
  /*   ipcMain.on("get-collections", async (event, dbName) => {
    const client = new MongoClient(mongoUrl)
    try {
      await client.connect()
      const db = client.db(dbName)
      const collections = await db.listCollections().toArray()
      event.reply(
        "collections",
        collections.map((coll) => coll.name)
      )
    } catch (error) {
      console.error(error)
      event.reply("collections", [])
    } finally {
      await client.close()
    }
  }) */

  /**
   * @description Upload CSV, TSV, JSON files and images into the Database
   * @param {String} event The event
   * @param {String} dbName The name of the database
   */
  /* ipcMain.on("upload-files", async (event, dbName) => {
    // Select file(s) to import
    const result = await dialog.showOpenDialog({ properties: ["openFile", "multiSelections"] })

    // Import all the selected files
    if (result.filePaths && result.filePaths.length > 0) {
      result.filePaths.forEach((filePath, index) => {
        const fileName = path.basename(filePath, path.extname(filePath))
        const extension = path.extname(filePath).slice(1)
        let mongoImportCommand
        let tempFilePath
        let tempFileCreated = false

        if (extension === "json") {
          mongoImportCommand = `mongoimport --db ${dbName} --collection ${fileName} --type json --file "${filePath}" --jsonArray`
        } else if (extension === "csv" || extension === "tsv") {
          mongoImportCommand = `mongoimport --db ${dbName} --collection ${fileName} --type ${extension} --file "${filePath}" --headerline`
        } else {
          // Import images and other file types as paths
          let imgInfos = {
            path: filePath,
            type: extension
          }
          let jsonImg = JSON.stringify([imgInfos])
          tempFilePath = path.join(path.dirname(filePath), String("image_path_" + index + ".json"))
          fs.writeFileSync(tempFilePath, jsonImg)
          tempFileCreated = true
          mongoImportCommand = `mongoimport --db ${dbName} --collection ${fileName} --type json --file "${tempFilePath}" --jsonArray`
        }

        // Execute importation command
        exec(mongoImportCommand, (error, stdout, stderr) => {
          if (tempFileCreated) {
            fs.unlinkSync(tempFilePath) // Delete temp file (only for images) after import
          }
          if (error) {
            // Try import with mongofiles
            if (extension === "csv" || extension === "tsv" || extension === "json") {
              let secondChanceCmd = `mongofiles --db ${dbName} --prefix fs put "${filePath}"`
              exec(secondChanceCmd, (error, stdout, stderr) => {
                if (error) {
                  // Error with second try
                  console.error(`exec error: ${error}`)
                  event.reply("upload-file-error", fileName)
                  return
                }
                // Second try successful
                console.log(`stdout: ${stdout}`)
                console.error(`stderr: ${stderr}`)
                event.reply("second-upload-file-success", fileName)
              })
            } else {
              // Error while importing files other than json, csv & tsv
              console.error(`exec error: ${error}`)
              event.reply("upload-file-error", fileName)
            }
            return
          }
          // Import successful
          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
          event.reply("upload-file-success", fileName)
        })
      })
    }
  }) */

  /**
   * @description Upload a folder structure as collection into the Database
   * @param {String} event The event
   * @param {String} dbName The name of the database
   */
  /* ipcMain.on("select-folder", async (event, dbName) => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] })
    if (result.filePaths && result.filePaths.length > 0) {
      const directoryPath = result.filePaths[0]
      const collectionName = path.basename(directoryPath)

      const buildFolderStructure = (dirPath) => {
        const folderStructure = {}
        const items = fs.readdirSync(dirPath)

        items.forEach((item) => {
          const itemPath = path.join(dirPath, item)
          const stats = fs.statSync(itemPath)

          if (stats.isDirectory()) {
            folderStructure[item] = buildFolderStructure(itemPath)
          } else {
            folderStructure[item] = {
              path: itemPath,
              type: path.extname(item).slice(1)
            }
          }
        })

        return folderStructure
      }

      try {
        const folderStructure = [buildFolderStructure(directoryPath)]
        const jsonStructure = JSON.stringify(folderStructure)

        const tempFilePath = path.join(directoryPath, "folder_structure.json")
        fs.writeFileSync(tempFilePath, jsonStructure)

        const mongoImportCommand = `mongoimport --db ${dbName} --collection ${collectionName} --type json --file "${tempFilePath}" --jsonArray`

        exec(mongoImportCommand, (error, stdout, stderr) => {
          fs.unlinkSync(tempFilePath) // Delete temp file after import

          if (error) {
            console.error(`exec error: ${error}`)
            event.reply("upload-folder-error", collectionName)
            return
          }
          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
          event.reply("upload-folder-success", collectionName)
        })
      } catch (err) {
        console.error(`Error building folder structure: ${err}`)
        event.reply("upload-folder-error", collectionName)
      }
    }
  }) */

  /**
   * @description Delete a collection in the database
   * @param {*} event
   * @param {String} dbName Name of the database
   * @param {String} collectionName Name of the collection to delete
   */
  /*   ipcMain.on("delete-collection", async (event, dbName, collectionName) => {
    const client = new MongoClient(mongoUrl)
    try {
      await client.connect()
      const db = client.db(dbName)
      await db.collection(collectionName).drop()
      event.reply("delete-collection-success", collectionName)
    } catch (error) {
      console.error(`Error deleting collection: ${error}`)
      event.reply("delete-collection-error", collectionName)
    } finally {
      await client.close()
    }
  }) */

  /**
   * @description Gets the data of a collection
   * @param {*} event The event
   * @param {*} dbname The name of the database
   * @param {*} collectionName The name of the collection
   */

  /*   ipcMain.on("get-collection-data", async (event, dbname, collectionName) => {
    const client = new MongoClient(mongoUrl)
    try {
      await client.connect()
      const db = client.db(dbname)
      const collection = db.collection(collectionName)
      const data = await collection.find({}).toArray()
      event.reply("collection-data", data)
    } catch (error) {
      console.error(error)
      event.reply("collection-data", [])
    } finally {
      await client.close()
    }
  }) */

  /**
   * @description Returns the server status
   * @returns {Boolean} True if the server is running, false otherwise
   */
  ipcMain.handle("server-is-running", async () => {
    return serverIsRunning
  })

  /**
   * @description Kills the server
   * @returns {Boolean} True if the server was killed successfully, false otherwise
   * @summary Kills the server if it is running
   */
  ipcMain.handle("kill-server", async () => {
    if (serverProcess) {
      let success = await serverProcess.kill()
      serverIsRunning = false
      return success
    } else {
      return null
    }
  })

  /**
   * @description Starts the server
   * @param {*} event The event
   * @param {*} condaPath The path to the python executable (optional) - If null, the default python executable will be used (see environment variables MED_ENV)
   * @returns {Boolean} True if the server is running, false otherwise
   */
  ipcMain.handle("start-server", async (_event, condaPath = null) => {
    console.log("CONDA PATH: ", condaPath)
    if (serverProcess) {
      // kill the server if it is already running
      serverProcess.kill()
    }
    if (MEDconfig.runServerAutomatically) {
      let success = runServer(isProd, serverPort, serverProcess, serverIsRunning, condaPath)
      return success
    }
    return serverIsRunning
  })

  /**
   * @description Opens the dialog to select the python executable path and returns the path to Next.js
   * @param {*} event
   * @param {*} data
   * @returns {String} The path to the python executable
   */
  ipcMain.handle("open-dialog-exe", async (event, data) => {
    if (process.platform !== "win32") {
      const { filePaths } = await dialog.showOpenDialog({
        title: "Select the path to the python executable",
        properties: ["openFile"],
        filters: [{ name: "Python Executable", extensions: ["*"] }]
      })
      return filePaths[0]
    } else {
      const { filePaths } = await dialog.showOpenDialog({
        title: "Select the path to the python executable",
        properties: ["openFile"],
        filters: [{ name: "Executable", extensions: ["exe"] }]
      })
      return filePaths[0]
    }
  })

  ipcMain.on("messageFromNext", (event, data, args) => {
    // Receives a message from Next.js
    console.log("messageFromNext : ", data)
    if (data === "requestDialogFolder") {
      // If the message is "requestDialogFolder", the function setWorkingDirectory is called
      setWorkingDirectory(event, mainWindow)
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

ipcMain.handle("request", async (_, axios_request) => {
  const result = await axios(axios_request)
  return { data: result.data, status: result.status }
})

app.on("window-all-closed", () => {
  console.log("app quit")
  stopMongoDB(mongoProcess)
  if (MEDconfig.runServerAutomatically) {
    try {
      // Check if the serverProcess has the kill method
      serverProcess.kill()
      console.log("serverProcess killed")
    } catch (error) {
      console.log("serverProcess already killed")
    }
  }
  app.quit()
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

// Function to start MongoDB
function startMongoDB(workspacePath) {
  const mongoConfigPath = path.join(workspacePath, ".medomics", "mongod.conf")
  if (fs.existsSync(mongoConfigPath)) {
    console.log("Starting MongoDB with config: ", mongoConfigPath)
    mongoProcess = spawn("mongod", ["--config", mongoConfigPath])

    mongoProcess.stdout.on("data", (data) => {
      console.log(`MongoDB stdout: ${data}`)
    })

    mongoProcess.stderr.on("data", (data) => {
      console.error(`MongoDB stderr: ${data}`)
    })

    mongoProcess.on("close", (code) => {
      console.log(`MongoDB process exited with code ${code}`)
    })

    mongoProcess.on("error", (err) => {
      console.error("Failed to start MongoDB: ", err)
      reject(err)
    })
  } else {
    const errorMsg = `MongoDB config file does not exist: ${mongoConfigPath}`
    console.error(errorMsg)
  }
}

// Function to stop MongoDB
async function stopMongoDB(mongoProcess) {
  return new Promise((resolve, reject) => {
    if (mongoProcess) {
      mongoProcess.on("exit", () => {
        mongoProcess = null
        resolve()
      })
      try {
        mongoProcess.kill()
      } catch (error) {
        console.log("Error while stopping MongoDB ", error)
        reject()
      }
    } else {
      resolve()
    }
  })
}
