export const SERVER_CHOICE = {
  FLASK: "Flask",
  GO: "Go"
}

export const PORT_FINDING_METHOD = {
  FIX: 0,
  AVAILABLE: 1
}

const config = {
  runServerAutomatically: false,
  useReactDevTools: false,
  condaEnv: "C:\\Users\\gblai\\anaconda3\\envs\\med\\python.exe",
  defaultPort: 5550,
  serverChoice: SERVER_CHOICE.GO,
  portFindingMethod: PORT_FINDING_METHOD.FIX
}

export default config
