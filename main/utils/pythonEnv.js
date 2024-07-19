import { app } from "electron"
const fs = require("fs")
var path = require("path")
const { execSync, exec} = require("child_process")

export function getPythonEnvironment(medCondaEnv = "med_conda_env") {
  // Returns the python environment
  let pythonEnvironment = process.env.MED_ENV

  // Retrieve the path to the conda environment from the settings file
  let userDataPath = app.getPath("userData")
  let settingsFilePath = path.join(userDataPath, "settings.json")
  let settingsFound = fs.existsSync(settingsFilePath)
  let settings = {}
  if (settingsFound) {
    let settings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"))
    // Check if the conda environment is defined in the settings file
    if (settings.condaPath !== undefined) {
      pythonEnvironment = settings.condaPath
    }
  }

  if (pythonEnvironment === undefined) {
    if (pythonEnvironment === undefined || pythonEnvironment === null) {
      let userPath = process.env.HOME
      let anacondaPath = getCondaPath(userPath)
      if (anacondaPath !== null) {
        // If a python environment is found, the path to the python executable is returned
        if (checkCondaEnvs(anacondaPath).includes(medCondaEnv)) {
          pythonEnvironment = getThePythonExecutablePath(anacondaPath, medCondaEnv)
        }
      }
    }
  }
  // If the python environment is found, the conda path is saved in the settings file if it is not already defined
  if (pythonEnvironment !== undefined && pythonEnvironment !== null) {
    if (settingsFound && settings.condaPath === undefined) {
      settings.condaPath = pythonEnvironment
      fs.writeFileSync(settingsFilePath, JSON.stringify(settings))
    }
  }
  return pythonEnvironment
}

/**
 * @description Returns the path to the conda directory
 * @param {String} parentPath The path to the parent directory
 * @returns {String} The path to the conda directory
 */
function getCondaPath(parentPath) {
  let condaPath = null
  const possibleCondaPaths = ["anaconda3", "miniconda3", "anaconda", "miniconda", "Anaconda3", "Miniconda3", "Anaconda", "Miniconda"]
  condaPath = checkDirectories(parentPath, possibleCondaPaths)
  if (condaPath === null) {
    if (process.platform !== "win32") {
      let condaPathTemp = path.join(parentPath, "opt")
      condaPath = checkDirectories(condaPathTemp, possibleCondaPaths)
      if (condaPath === null) {
        condaPathTemp = path.join(parentPath, "bin")
        condaPath = checkDirectories(condaPathTemp, possibleCondaPaths)
      }
    } else {
      parentPath = "C:\\"
      let condaPathTemp = path.join(parentPath, "ProgramData")
      condaPath = checkDirectories(condaPathTemp, possibleCondaPaths)
      if (condaPath === null) {
        condaPathTemp = path.join(parentPath, "Program Files")
        condaPath = checkDirectories(condaPathTemp, possibleCondaPaths)
        if (condaPath === null) {
          condaPathTemp = path.join(parentPath, "Program Files (x86)")
          condaPath = checkDirectories(condaPathTemp, possibleCondaPaths)
        }
      }
    }
    if (process.platform == "darwin" && condaPath === null) {
      parentPath = "/opt/homebrew"
      condaPath = checkDirectories(parentPath, possibleCondaPaths)
    }
    if (condaPath === null && process.platform !== "darwin") {
      console.log("No conda environment found")
      dialog.showMessageBoxSync({
        type: "error",
        title: "No conda environment found",
        message: "No conda environment found. Please install anaconda or miniconda and try again."
      })
    }
  }
  return condaPath
}

/**
 * Checks if a list of directories exists from a parent directory
 * @param {String} parentPath The path to the parent directory
 * @param {Array} directories The list of directories to check
 * @returns {String} The path to the directory that exists
 */
function checkDirectories(parentPath, directories) {
  let directoryPath = null
  directories.forEach((directory) => {
    if (directoryPath === null) {
      let directoryPathTemp = path.join(parentPath, directory)
      console.log("directoryPathTemp: ", directoryPathTemp)
      if (fs.existsSync(directoryPathTemp)) {
        console.log("directoryPathTemp EXISTS: ", directoryPathTemp)
        directoryPath = directoryPathTemp
      }
    }
  })
  return directoryPath
}

/**
 * @description Returns the condas environments
 * @param {String} condaPath The path to the conda environment
 * @returns {Array} The condas environments
 */
function checkCondaEnvs(condaPath) {
  let envsPath = path.join(condaPath, "envs")
  let envs = []
  if (fs.existsSync(envsPath)) {
    envs = fs.readdirSync(envsPath)
  }
  return envs
}

/**
 * @description Returns the path to the python executable
 * @param {String} condaPath The path to the conda environment
 * @param {String} envName The name of the conda environment
 * @returns {String} The path to the python executable
 */
function getThePythonExecutablePath(condaPath, envName) {
  // Returns the path to the python executable
  let pythonExecutablePath = null
  if (process.platform == "win32") {
    pythonExecutablePath = path.join(condaPath, "envs", envName, "python.exe")
  } else {
    pythonExecutablePath = path.join(condaPath, "envs", envName, "bin", "python")
  }
  return pythonExecutablePath
}


export function getBundledPythonEnvironment() {
  let pythonEnvironment = null

  let bundledPythonPath = path.join(process.cwd(), "python")
  if (process.env.NODE_ENV === "production") {
    bundledPythonPath = path.join(process.cwd(), "python")
  }

  pythonEnvironment = path.join(bundledPythonPath, "bin", "python")
  if (process.platform == "win32") {
    pythonEnvironment = path.join(bundledPythonPath, "python.exe")
  } 
  console.log("Python Environment bundledPythonPath: ", bundledPythonPath)
  console.log("Python Environment: ", pythonEnvironment)
  if (!fs.existsSync(pythonEnvironment)) {
    pythonEnvironment = null
  }
  return pythonEnvironment
}


export function getInstalledPythonPackages(pythonPath=null) {
  let pythonPackages = []
  if (pythonPath === null) {
    pythonPath = getPythonEnvironment()
  }
  let pythonPackagesOutput = execSync(`${pythonPath} -m pip list --format=json`).toString()
  pythonPackages = JSON.parse(pythonPackagesOutput)
  return pythonPackages
}

export function installPythonPackage(pythonPath, packageName=null, requirementsFilePath=null) {
  console.log("Installing python package: ", packageName, requirementsFilePath, " with pythonPath: ", pythonPath)
  let execSyncResult = null
  let pipUpgradeExecResult = execSync(`${pythonPath} -m pip install --upgrade pip`).toString()
  if (requirementsFilePath !== null) {
    execSyncResult = exec(`${pythonPath} -m pip install -r ${requirementsFilePath}`).toString()
  } else {
    execSyncResult = exec(`${pythonPath} -m pip install ${packageName}`).toString()
  }
}

export function installBundledPythonExecutable() {
  
  let bundledPythonPath = path.join(process.cwd(), "python")
  if (process.env.NODE_ENV === "production") {
    bundledPythonPath = path.join(process.cwd(), "python")
  }
  // Check if the python executable is already installed
  let pythonExecutablePath = null
  if (process.platform == "win32") {
    pythonExecutablePath = path.join(bundledPythonPath, "python.exe")
  } else {
    pythonExecutablePath = path.join(bundledPythonPath, "bin", "python")
  }
  if (!fs.existsSync(pythonExecutablePath)) {
    // Install the python executable
    
    // 1. Download the python executable https://github.com/indygreg/python-build-standalone/releases/download/20240224/cpython-3.9.18+20240224
    // 2. Extract the python executable
    
    if (process.platform == "win32") {
      // Download the python executable
      let url = "https://github.com/indygreg/python-build-standalone/releases/download/20240224/cpython-3.10.13+20240224-x86_64-pc-windows-msvc-static-install_only.tar.gz"
      let downloadResult = execSync(`curl -fsSLO ${url}`).toString()
      
      // Extract the python executable
    } else if (process.platform == "darwin") {
      // Download the right python executable (arm64 or x86_64) 
      let isArm64 = process.arch === "arm64" 
      let url = "https://github.com/indygreg/python-build-standalone/releases/download/20240224/cpython-3.9.18+20240224-x86_64-apple-darwin-install_only.tar.gz"
      let extractCommand = `tar -xvf cpython-3.9.18+20240224-x86_64-apple-darwin-install_only.tar.gz`
      if (isArm64 === "arm64") {
        url = "https://github.com/indygreg/python-build-standalone/releases/download/20240224/cpython-3.9.18+20240224-aarch64-apple-darwin-install_only.tar.gz"
        extractCommand = `tar -xvf cpython-3.9.18+20240224-aarch64-apple-darwin-install_only.tar.gz`
      }
      let downloadResult = execSync(`/bin/bash -c "$(curl -fsSLO ${url})"`).toString()
      console.log("Download", downloadResult)
      // Extract the python executable
      let extractionResult = execSync(extractCommand).toString()
      console.log(extractionResult)
      // Install the required python packages
      installPythonPackage(pythonExecutablePath, null, path.join(process.cwd(), "pythonEnv", "requirements_mac.txt"))
    } else if (process.platform == "linux") {
      // Download the right python executable (arm64 or x86_64)
       
      let url = "https://github.com/indygreg/python-build-standalone/releases/download/20240224/cpython-3.9.18+20240224-x86_64_v4-unknown-linux-gnu-install_only.tar.gz"
      let extractCommand = `tar -xvf cpython-3.9.18+20240224-x86_64_v4-unknown-linux-gnu-install_only.tar.gz`
      let downloadResult = execSync(`wget ${url}`).toString()
      console.log(downloadResult)
      // Extract the python executable
      let extractionResult = execSync(extractCommand).toString()
      console.log(extractionResult)
      // Install the required python packages
      installPythonPackage(pythonExecutablePath,  null, path.join(process.cwd(),"pythonEnv", "requirements.txt"))
    }

  }
}