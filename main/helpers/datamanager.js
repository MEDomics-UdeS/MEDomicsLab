import exp from "constants"
import { screen, BrowserWindow } from "electron"
import fs from "fs"

function DataManager() {
  /**
   * @description This class is responsible for managing the data of the application in Electron Backend
   * @note This is a placeholder for future development
   */
}
/**
 * @description This function is responsible for saving the data in JSON format
 * @param {Object} data - The data to be saved
 * @param {String} path - The path where the data will be saved
 */
const saveJSON = (data, path) => {
  fs.writeFile(path, JSON.stringify(data), (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log("Data saved successfully")
    }
  })
}

/**
 * @description This function is responsible for loading the data in JSON format
 * @param {String} path - The path where the data will be loaded
 */
const loadJSON = (path) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      console.log("Data loaded successfully")
      return JSON.parse(data)
    }
  })
}

export { saveJSON, loadJSON, DataManager }
