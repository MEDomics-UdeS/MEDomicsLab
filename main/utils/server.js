import MEDconfig, { PORT_FINDING_METHOD } from "../../medomics.dev"
import { getPythonEnvironment, getBundledPythonEnvironment } from "./pythonEnv"
const { exec, execFile } = require("child_process")
const os = require("os")
var path = require("path")

export function findAvailablePort(startPort, endPort = 8000) {
  let killProcess = MEDconfig.portFindingMethod === PORT_FINDING_METHOD.FIX || !MEDconfig.runServerAutomatically
  let platform = process.platform
  return new Promise((resolve, reject) => {
    let port = startPort
    function tryPort() {
      if (platform == "darwin") {
        exec(`lsof -i:${port}`, (err, stdout, stderr) => {
          if (err) {
            console.log(`Port ${port} is available !`)
            resolve(port)
          } else {
            if (killProcess) {
              exec("kill -9 $(lsof -t -i:" + port + ")", (err, stdout, stderr) => {
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
      } else {
        exec(`netstat ${platform == "win32" ? "-ano | find" : "-ltnup | grep"} ":${port}"`, (err, stdout, stderr) => {
          if (err) {
            console.log(`Port ${port} is available !`)
            resolve(port)
          } else {
            if (killProcess) {
              // Split the stdout into individual lines and use the first line to get the PID
              let line = stdout.trim().split("\n")[0]
              let PID = line.trim().split(/\s+/)[line.trim().split(/\s+/).length - 1].split("/")[0]
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
    }
    tryPort()
  })
}

export function killProcessOnPort(port) {
  let platform = process.platform
  return new Promise((resolve, reject) => {
    if (platform == "darwin") {
      exec(`lsof -i:${port}`, (err, stdout, stderr) => {
        if (err) {
          console.log(`Port ${port} is available !`)
          resolve(port)
        } else {
          exec("kill -9 $(lsof -t -i:" + port + ")", (err, stdout, stderr) => {
            if (!err) {
              console.log("Previous server instance was killed successfully")
              console.log(`Port ${port} is now available !`)
              resolve(port)
            }
            stdout && console.log(stdout)(stderr) && console.log(stderr)
          })
        }
      })
    } else {
      exec(`netstat ${platform == "win32" ? "-ano | find" : "-ltnup | grep"} ":${port}"`, (err, stdout, stderr) => {
        if (err) {
          console.log(`Port ${port} is available !`)
          resolve(port)
        } else {
          let PID = stdout.trim().split(/\s+/)[stdout.trim().split(/\s+/).length - 1].split("/")[0]
          exec(`${platform == "win32" ? "taskkill /f /t /pid" : "kill"} ${PID}`, (err, stdout, stderr) => {
            if (!err) {
              console.log("Previous server instance was killed successfully")
              console.log(`Port ${port} is now available !`)
              resolve(port)
            }
            stdout && console.log(stdout)(stderr) && console.log(stderr)
          })
        }
      })
    }
  })
}

export async function runServer(isProd, serverPort, serverProcess, serverState, condaPath = null) {
  // Runs the server
  let pythonEnvironment = getPythonEnvironment()
  if (process.platform !== "win32" && condaPath === null) {
    condaPath = pythonEnvironment
    if (pythonEnvironment !== undefined) {
      condaPath = pythonEnvironment
    }
  }

  let env = process.env
  let bundledPythonPath = getBundledPythonEnvironment()

  if (bundledPythonPath !== null) {
    bundledPythonPath = bundledPythonPath.replace("python.exe", "")

    let scriptPath = path.join(bundledPythonPath, "Scripts")
    let libPath = path.join(bundledPythonPath, "Lib")
    let pythonPath = path.join(bundledPythonPath, "python.exe")

    env.PATH = `${bundledPythonPath};${scriptPath};${libPath};${env.PATH}`
    console.log("env.PATH: " + env.PATH)
  }

  if (!isProd) {
    //**** DEVELOPMENT ****//
    let args = [serverPort, "dev", process.cwd()]
    // Get the temporary directory path
    args.push(os.tmpdir())

    if (condaPath !== null) {
      args.push(condaPath)
    }

    await findAvailablePort(MEDconfig.defaultPort)
      .then((port) => {
        serverPort = port
        serverState.serverIsRunning = true
        serverProcess = execFile(`${process.platform == "win32" ? "main.exe" : "./main"}`, args, {
          windowsHide: false,
          cwd: path.join(process.cwd(), "go_server"),
          env: env
        })
        if (serverProcess) {
          serverProcess.stdout.on("data", function (data) {
            console.log(`data: ${data.toString("utf8")}`)
          })
          serverProcess.stderr.on("data", (data) => {
            console.log(`stderr: ${data.toString("utf8")}`)
          })
          serverProcess.on("error", (err) => {
            console.log(`error: ${err}`)
          })
          serverProcess.on("disconnect", () => {
            console.log(`disconnected`)
          })
          serverProcess.on("close", (code) => {
            serverState.serverIsRunning = false
            console.log(`server child process close all stdio with code ${code}`)
          })
        }
      })
      .catch((err) => {
        console.error(err)
      })
  } else {
    //**** PRODUCTION ****//
    let args = [serverPort, "prod", process.resourcesPath]
    // Get the temporary directory path
    args.push(os.tmpdir())
    if (condaPath !== null) {
      args.push(condaPath)
    }

    await findAvailablePort(MEDconfig.defaultPort)
      .then((port) => {
        serverPort = port
        console.log("_dirname: ", __dirname)
        console.log("process.resourcesPath: ", process.resourcesPath)

        if (process.platform == "win32") {
          serverProcess = execFile(path.join(process.resourcesPath, "go_executables\\server_go_win32.exe"), args, {
            windowsHide: false,
            env: env
          })
          serverState.serverIsRunning = true
        } else if (process.platform == "linux") {
          serverProcess = execFile(path.join(process.resourcesPath, "go_executables/server_go_linux"), args, {
            windowsHide: false
          })
          serverState.serverIsRunning = true
        } else if (process.platform == "darwin") {
          serverProcess = execFile(path.join(process.resourcesPath, "go_executables/server_go_mac"), args, {
            windowsHide: false
          })
          serverState.serverIsRunning = true
        }
        if (serverProcess) {
          serverProcess.stdout.on("data", function (data) {
            console.log("data: ", data.toString("utf8"))
          })
          serverProcess.stderr.on("data", (data) => {
            console.log(`stderr: ${data}`)
            serverState.serverIsRunning = true
          })
          serverProcess.on("close", (code) => {
            serverState.serverIsRunning = false
            console.log(`my server child process close all stdio with code ${code}`)
          })
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
  return serverProcess
}
