const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("darkModeTest", {
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system")
})
