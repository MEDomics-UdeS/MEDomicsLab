const fs = require("fs")
const { parse } = require("csv-parse")

/**
 *
 * @param {Object} exportObj object to be exported
 * @param {String} exportName name of the exported file
 *
 * @description
 * This function takes an object and a name and downloads the object as a json file
 * It create a temporary anchor element to ask the user where to download the file
 */
const downloadJson = (exportObj, exportName) => {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj, null, 2))
  var downloadAnchorNode = document.createElement("a")
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", exportName + ".json")
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

/**
 *
 * @param {Object} exportObj object to be exported
 * @param {String} path path to the folder where the file will be saved
 * @param {String} name name of the exported file
 *
 * @description
 * This function takes an object, a path and a name and saves the object as a json file
 */
const writeJson = (exportObj, path, name) => {
  const fs = require("fs")
  fs.writeFile(
    path + name + ".json",
    JSON.stringify(exportObj, null, 2),
    function (err) {
      if (err) {
        return console.log(err)
      }
      console.log("The file was saved!")
    }
  )
}

/**
 *
 * @description
 * This function opens a file dialog and returns the selected json file
 */
const loadJson = () => {
  let jsonFile
  let input = document.createElement("input")
  input.type = "file"
  input.onchange = function () {
    var reader = new FileReader()
    reader.onload = onReaderLoad
    reader.readAsText(event.target.files[0])
  }
  function onReaderLoad(event) {
    jsonFile = JSON.parse(event.target.result)
    console.log(jsonFile)

    return jsonFile
  }
  input.click()
}

/**
 *
 * @returns {Promise} Promise that resolves to the selected json file
 *
 * @description
 * This function opens a file dialog and returns the selected json file
 */
const loadJsonSync = () => {
  return new Promise((resolve) => {
    let input = document.createElement("input")
    input.type = "file"
    input.onchange = function () {
      var reader = new FileReader()
      reader.onload = function (event) {
        const jsonFile = JSON.parse(event.target.result)
        console.log(jsonFile)
        resolve(jsonFile) // Resolve the Promise with the parsed JSON object
      }
      reader.readAsText(event.target.files[0])
    }
    input.click()
  })
}

/**
 *
 * @param {String} path
 * @returns {Object} json object
 *
 * @description
 * This function takes a path and returns the json object
 */
const loadJsonPath = (path) => {
  const fs = require("fs")
  if (path == "") {
    console.log("path empty")
    return null
  }
  try {
    const cwd = process.cwd()
    let cwdSlashType = cwd.includes("/") ? "/" : "\\"
    let cwdSlashTypeInv = cwdSlashType == "/" ? "\\" : "/"
    path.charAt(0) == "." &&
      (path = cwd + path.substring(1).replaceAll(cwdSlashTypeInv, cwdSlashType))
    console.log("reading json file: " + path)
    const data = fs.readFileSync(path)
    const jsonData = JSON.parse(data)
    return jsonData
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 *
 * @param {String} path
 * @returns {Object} json object
 *
 * @description
 * This function takes a path and returns the json object
 */
const loadCSVPath = (path, whenLoaded) => {
  const data = []
  // get current working directory
  const cwd = process.cwd()
  let cwdSlashType = cwd.includes("/") ? "/" : "\\"
  let cwdSlashTypeInv = cwdSlashType == "/" ? "\\" : "/"
  path.charAt(0) == "." &&
    (path = cwd + path.substring(1).replaceAll(cwdSlashTypeInv, cwdSlashType))
  console.log("reading csv file: " + path)
  fs.createReadStream(path)
    .pipe(
      parse({
        delimiter: ",",
        columns: true,
        ltrim: true
      })
    )
    .on("data", function (row) {
      // This will push the object row into the array
      data.push(row)
    })
    .on("error", function (error) {
      console.log(error.message)
    })
    .on("end", function () {
      // Here log the result array
      console.log("parsed csv data:")
      console.log(data)
      whenLoaded(data)
    })
}

export {
  downloadJson,
  writeJson,
  loadJson,
  loadJsonSync,
  loadJsonPath,
  loadCSVPath
}
