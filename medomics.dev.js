import fs from "fs"

export const SERVER_CHOICE = {
  FLASK: "Flask",
  GO: "Go"
}

export const PORT_FINDING_METHOD = {
  FIX: 0,
  AVAILABLE: 1
}

const config = {
  runServerAutomatically: true,
  useReactDevTools: false,
  condaEnv: fs.readFileSync("./path2condaenv_toDeleteInProd.txt", "utf8").replace(/\s/g, ""),
  defaultPort: 5000,
  serverChoice: SERVER_CHOICE.GO,
  portFindingMethod: PORT_FINDING_METHOD.FIX
}

export default config
