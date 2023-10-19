import fs from "fs"
import decompress from "decompress"
import { promises as fsPromises } from "fs"
import zipper from "zip-local"

import { createFolderSync, loadJsonPath } from "./fileManagementUtils.js"
import { toast } from "react-toastify"
import Path from "path"

const IS_FILE = 0
const IS_FOLDER = 1

/**
 *
 * @param {string} path /path/to/file.extension
 * @param {*} customActions async function to do custom actions on the folder before zipping it
 *
 * @example
 * async function UseCreateZip() {
 *   await createZipFileSync("C:/Users/username/Desktop/folderToZip.extension",
 *    async (path) => {
 *      // do custom actions in the folder while it is unzipped
 *    }
 *   )
 * }
 */
export const createZipFileSync = async (path, customActions) => {
  if (!path.includes(".")) {
    toast.error("Please provide a path with a file extension")
    return
  } else {
    let zipFile = new CustomZipFile(path)
    await zipFile.createZipSync(path, customActions)
  }
}

/**
 *
 * @param {*} path /path/to/file.extension
 * @param {*} customActions async function to do custom actions on the unzipped folder before deleting it
 *
 * @example
 * async function UseModifyZip() {
 *  await modifyZipFileSync("C:/Users/username/Desktop/folderToZip.extension",
 *    async (path) => {
 *      // do custom actions in the folder while it is unzipped
 *    }
 *  )
 * }
 */
export const modifyZipFileSync = async (path, customActions) => {
  if (!path.includes(".")) {
    toast.error("Please provide a path with a file extension")
    return
  } else {
    // check if file exists
    if (fs.existsSync(path)) {
      let zipFile = new CustomZipFile(path)
      await zipFile.interactZipSync(path, customActions)
    } else {
      toast.error("The file does not exist: " + path)
    }
  }
}

export const customZipFile2Object = async (path) => {
  if (!path.includes(".")) {
    toast.error("Please provide a path with a file extension")
    return
  } else {
    // check if file exists
    if (fs.existsSync(path)) {
      let zipFile = new CustomZipFile(path)
      return await zipFile.toObject()
    } else {
      toast.error("The file does not exist: " + path)
    }
  }
}

/**
 * @class CustomZipFile
 * @description
 * This class allows to create a zip file with a custom extension
 */
export default class CustomZipFile {
  constructor(path) {
    if (path.includes(".")) {
      this.fileExtension = "." + path.split(".")[1]
      this._cwd = path.split(".")[0]
    } else {
      this.fileExtension = ""
      this._cwd = ""
    }
  }

  async toObject() {
    let content = {}
    await this.interactZipSync("default", async (folderPath) => {
      content = await this.openContentToObject(folderPath)
    })
    return content
  }

  openContentToObject(folderPath) {
    return new Promise((resolve, reject) => {
      const readDirRecursive = (folderPath) => {
        return new Promise((resolve2, reject2) => {
          let subContent = {}
          fs.readdir(folderPath, function (err, files) {
            //handling error
            if (err) {
              console.log("Unable to scan directory: " + err)
              reject2(err)
            }
            //listing all files using forEach
            console.log("files", files)
            files.forEach((element) => {
              console.log("element", element, CustomZipFile.getPathType(Path.join(folderPath, element)))
              if (CustomZipFile.getPathType(Path.join(folderPath, element)) == IS_FILE) {
                if (element.split(".")[1] == "json") {
                  subContent[element.split(".")[0]] = loadJsonPath(Path.join(folderPath, element))
                } else {
                  subContent[element.split(".")[0]] = element
                }
              } else if (CustomZipFile.getPathType(Path.join(folderPath, element)) == IS_FOLDER) {
                subContent[element] = {}
                readDirRecursive(Path.join(folderPath, element)).then((subSubContent) => {
                  subContent[element] = subSubContent
                })
              }
            })
            console.log("subContent", subContent)
            resolve2(subContent)
          })
        })
      }
      readDirRecursive(folderPath)
        .then((content) => {
          resolve(content)
          console.log("content", content)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  static getPathType(path) {
    if (path.includes(".")) {
      return IS_FILE
    } else {
      return IS_FOLDER
    }
  }

  /**
   * Creates a zip file from a folder
   * @param {string} path path of the folder to zip
   * @param {function} customActions custom actions to do on the folder before zipping it
   * @returns {Promise} path of the zip file created with the custom extension
   *
   * @example
   * async function UseCreateZip() {
   *    const customZipFile = new CustomZipFile("C:/Users/username/Desktop/folderToZip.extension")
   *    await customZipFile.createZipSync(null,
   *        async (path) => {
   *          // do custom actions in the folder while it is unzipped
   *        }
   *    )
   * }
   */
  createZipSync(
    path = "default",
    customActions = () => {
      return new Promise((resolve, reject) => {
        console.log("No default custom actions")
        resolve()
      })
    }
  ) {
    try {
      // get the file extension from the path
      this.handleInputPath(path)
      console.log("createZipSync", this._cwd, this.fileExtension)

      return new Promise((resolve, reject) => {
        // create an empty folder (temporary)
        createFolderSync(this._cwd).then(async () => {
          // add custom file/folder inside
          await customActions(this._cwd)
          await this.zipDirectory(this._cwd)
          resolve(this._cwd + this.fileExtension)
        })
      })
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Adds content to a zip file already existing
   * @param {string} path - path of the zip file to unzip
   * @param {function} customActions - custom actions to do on the unzipped folder before deleting it
   * @returns {void}
   */
  interactZipSync(
    path = "default",
    customActions = () => {
      console.log("No default custom actions")
    }
  ) {
    try {
      // get the file extension from the path
      this.handleInputPath(path)

      return new Promise((resolve, reject) => {
        // create an empty folder (temporary)
        fsPromises.mkdir(this._cwd, { recursive: true }).then(() => {
          // unzip the folder
          let extensionPath = this._cwd + this.fileExtension
          this.unzipDirectory(extensionPath, this._cwd).then(async () => {
            // do custom actions on the unzipped folder
            await customActions(this._cwd)
            await this.zipDirectory(this._cwd)
            resolve(this._cwd + this.fileExtension)
          })
        })
      })
    } catch (err) {
      console.error(err)
    }
  }

  /**
   *
   * @param {string} inputPath - path of the zip file to unzip
   */
  handleInputPath(inputPath) {
    if (inputPath) {
      if (inputPath.includes(".")) {
        const inputFileExtension = "." + inputPath.split(".")[1]
        if (this.fileExtension !== "") {
          if (inputFileExtension !== this.fileExtension) {
            throw new Error(`The file extension was supposed to be ${this.fileExtension} but it was ${inputFileExtension}.`)
          }
        } else {
          this.fileExtension = inputFileExtension
        }
        this._cwd = inputPath.split(".")[0]
      } else if (inputPath !== "default") {
        this._cwd = inputPath
      } else {
        if (this._cwd === "") {
          throw new Error("The path is empty. Please provide a path.")
        }
      }
    }
  }

  /**
   * @param {String} sourceDir /some/folder/to/compress
   * @returns {Promise}
   */
  async zipDirectory(sourceDir) {
    let zipPath = sourceDir + ".zip"
    await zipper.sync.zip(sourceDir).compress().save(zipPath)
    await this.convertExtension(zipPath)
  }

  /**
   *
   * @param {String} sourceDir /path/to/file.zip
   * @param {String} outPath /path/to/extracted/folder
   * @returns {Promise}
   */
  unzipDirectory(zipPath, folderPath) {
    return new Promise((resolve, reject) => {
      decompress(zipPath, folderPath)
        .then((files) => {
          resolve(files)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   *
   * @param {String} zipPath /path/to/file.zip
   * @returns
   */
  convertExtension(zipPath) {
    let extensionPath = zipPath.replace(".zip", this.fileExtension)
    let folderPath = zipPath.replace(".zip", "")

    return new Promise((resolve, reject) => {
      try {
        // rename the zip file to have the custom extension
        if (fs.existsSync(extensionPath)) {
          fs.unlinkSync(extensionPath)
        }
        fs.renameSync(zipPath, extensionPath)

        // delete the temporary folder
        // rimraf.sync(folderPath)
        fs.rm(folderPath, { recursive: true, force: true }, (err) => {
          if (err) {
            throw err
          }
          resolve(extensionPath)
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}
