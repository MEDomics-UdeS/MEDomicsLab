import { createLoading } from "electron-loading"
import { contextBridge } from "electron"

const { startLoading, stopLoading } = createLoading()

startLoading()

contextBridge.exposeInMainWorld("stopLoading ", stopLoading)
