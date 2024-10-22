import { app } from "electron"
import { execCallbacksForChildWithNotifications } from "../utils/pythonEnv"
import { mainWindow, getMongoDBPath } from "../background"
var path = require("path")
const util = require("util")
const exec = util.promisify(require("child_process").exec)

export const installMongoDB = async () => {
  if (process.platform === "win32") {
    // Download MongoDB installer
    const downloadUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.12-signed.msi"
    const downloadPath = path.join(app.getPath("downloads"), "mongodb-windows-x86_64-7.0.12-signed.msi")
    let downloadMongoDBPromise = exec(`curl -o ${downloadPath} ${downloadUrl}`)
    execCallbacksForChildWithNotifications(downloadMongoDBPromise.child, "Downloading MongoDB installer", mainWindow)
    await downloadMongoDBPromise
    // Install MongoDB
    // msiexec.exe /l*v mdbinstall.log /qb /i mongodb-windows-x86_64-7.0.12-signed.msi ADDLOCAL="ServerNoService" SHOULD_INSTALL_COMPASS="0"
    let installMongoDBPromise = exec(`msiexec.exe /l*v mdbinstall.log /qb /i ${downloadPath} ADDLOCAL="ServerNoService" SHOULD_INSTALL_COMPASS="0"`)
    execCallbacksForChildWithNotifications(installMongoDBPromise.child, "Installing MongoDB", mainWindow)
    await installMongoDBPromise

    return getMongoDBPath() !== null
  } else if (process.platform === "darwin") {
    // Download MongoDB installer
    const downloadUrl = "https://fastdl.mongodb.org/osx/mongodb-macos-x86_64-7.0.12-signed.dmg"
    const downloadPath = path.join(app.getPath("downloads"), "mongodb-macos-x86_64-7.0.12-signed.dmg")
    let downloadMongoDBPromise = exec(`curl -o ${downloadPath} ${downloadUrl}`)
    execCallbacksForChildWithNotifications(downloadMongoDBPromise.child, "Downloading MongoDB installer", mainWindow)
    await downloadMongoDBPromise
    // Install MongoDB
    let installMongoDBPromise = exec(
      `hdiutil attach ${downloadPath} && cp -R /Volumes/mongodb-macos-x86_64-7.0.12-signed/* /Applications && hdiutil detach /Volumes/mongodb-macos-x86_64-7.0.12-signed`
    )
    execCallbacksForChildWithNotifications(installMongoDBPromise.child, "Installing MongoDB", mainWindow)
    await installMongoDBPromise

    return getMongoDBPath() !== null
  } else if (process.platform === "linux") {
    // Download MongoDB installer
    const downloadUrl = "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-7.0.12-signed.tgz"
    const downloadPath = path.join(app.getPath("downloads"), "mongodb-linux-x86_64-7.0.12-signed.tgz")
    let downloadMongoDBPromise = exec(`curl -o ${downloadPath} ${downloadUrl}`)
    execCallbacksForChildWithNotifications(downloadMongoDBPromise.child, "Downloading MongoDB installer", mainWindow)
    await downloadMongoDBPromise
    // Install MongoDB
    let installMongoDBPromise = exec(`tar -zxvf ${downloadPath} && cp -R mongodb-linux-x86_64-7.0.12-signed/* /usr/local`)
    execCallbacksForChildWithNotifications(installMongoDBPromise.child, "Installing MongoDB", mainWindow)
    await installMongoDBPromise

    return getMongoDBPath() !== null
  }
}
