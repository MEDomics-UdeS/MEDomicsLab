const { Archive } = require("pyunpack")
const fs = require("fs")
const path = require("path")
const rimraf = require("rimraf")

export default class CustomZipFile {
  constructor(fileExtension) {
    this.fileExtension = fileExtension
    this._cwd = ""
  }

  createZip(path, customActions) {
    /**
     * Creates a zip file from a folder
     * @param {string} path - path of the folder to zip
     * @param {function} customActions - custom actions to do on the folder before zipping it
     * @returns {void}
     */
    // get the file extension from the path
    path = this.handleInputPath(path)
    this._cwd = path
    // create an empty folder (temporary)
    fs.mkdirSync(path, { recursive: true })

    // add custom file/folder inside
    customActions(path)

    // zip the folder
    const zipPath = path + ".zip"
    Archive({ source: path, destination: zipPath })

    // rename the zip file to have the custom extension
    if (fs.existsSync(path + this.fileExtension)) {
      fs.unlinkSync(path + this.fileExtension)
    }
    fs.renameSync(zipPath, path + this.fileExtension)

    // delete the temporary folder
    rimraf.sync(path)
  }

  addContentToZip(path, customActions) {
    /**
     * Adds content to a zip file already existing
     * @param {string} path - path of the zip file to unzip
     * @param {function} customActions - custom actions to do on the unzipped folder before deleting it
     * @returns {void}
     */
    // get the file extension from the path
    const extractedPath = this.handleInputPath(path)
    this._cwd = extractedPath
    // create an empty folder (temporary)
    fs.mkdirSync(extractedPath, { recursive: true })

    // unzip the folder
    Archive({ source: path, destination: extractedPath })

    // do custom actions on the unzipped folder
    customActions(extractedPath)

    // zip the folder
    const zipPath = extractedPath + ".zip"
    Archive({ source: extractedPath, destination: zipPath })

    // rename the zip file to have the custom extension
    if (fs.existsSync(extractedPath + this.fileExtension)) {
      fs.unlinkSync(extractedPath + this.fileExtension)
    }
    fs.renameSync(zipPath, extractedPath + this.fileExtension)

    // delete the temporary folder
    rimraf.sync(extractedPath)
  }

  unzipActions(path, customActions) {
    /**
     * Unzips a zip file to a folder
     * @param {string} path - path of the zip file to unzip
     * @param {function} customActions - custom actions to do on the unzipped folder before deleting it
     * @returns {void}
     */
    // get the file extension from the path
    const extractedPath = this.handleInputPath(path)
    this._cwd = extractedPath
    // create an empty folder (temporary)
    fs.mkdirSync(extractedPath, { recursive: true })

    // unzip the folder
    Archive({ source: path, destination: extractedPath })

    // do custom actions on the unzipped folder
    customActions(extractedPath)

    // delete the temporary folder
    rimraf.sync(extractedPath)
  }

  handleInputPath(inputPath) {
    let path = inputPath
    if (inputPath.includes(".")) {
      const inputFileExtension = "." + inputPath.split(".")[1]
      if (inputFileExtension !== this.fileExtension) {
        throw new Error(`The file extension was supposed to be ${this.fileExtension} but it was ${inputFileExtension}.`)
      }
      path = inputPath.split(".")[0]
    }

    return path
  }

  createSubFolder(name) {
    /**
     * Creates a sub folder in the parent folder
     * @param {string} name - name of the sub folder
     * @returns {string} path of the sub folder
     */
    const subFolderPath = path.join(this._cwd, name)
    fs.mkdirSync(subFolderPath, { recursive: true })
    return subFolderPath
  }
}
