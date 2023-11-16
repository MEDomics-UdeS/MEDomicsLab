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
  condaEnv: "/home/local/USHERBROOKE/blag1201/anaconda3/envs/med/bin/python",
  defaultPort: 5550,
  serverChoice: SERVER_CHOICE.GO,
  portFindingMethod: PORT_FINDING_METHOD.FIX
}

export default config
