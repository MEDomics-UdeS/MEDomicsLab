const fs = require("fs")

// Function to start MongoDB
export function startMongoDB(workspacePath, mongoProcess) {
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
  } else {
    console.error("MongoDB config file does not exist: ", mongoConfigPath)
  }
}

// Function to stop MongoDB
export function stopMongoDB(mongoProcess) {
  if (mongoProcess) {
    mongoProcess.kill()
  }
}
