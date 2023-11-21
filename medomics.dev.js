export const PORT_FINDING_METHOD = {
  FIX: 0,
  AVAILABLE: 1
}

const config = {
  runServerAutomatically: true,
  useReactDevTools: false,
  condaEnv: "/home/local/USHERBROOKE/blag1201/anaconda3/envs/med/bin/python",
  defaultPort: 5000,
  portFindingMethod: PORT_FINDING_METHOD.FIX
}

export default config
