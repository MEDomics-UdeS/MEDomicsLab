export const PORT_FINDING_METHOD = {
  FIX: 0,
  AVAILABLE: 1
}

const config = {
  // If true, the server will be run automatically when the app is launched
  runServerAutomatically: true,
  // If true, use the react dev tools
  useReactDevTools: false,
  // the default port to use for the server, be sure that no programs use it by default
  defaultPort: 5000,
  // Either "FIX" or "AVAILABLE" (case sensitive)
  // FIX 		-­> if defaultPort is used, force terminate and use defaultPort
  // AVAILABLE 	-> if defaultPort is used, iterate to find next available port
  portFindingMethod: PORT_FINDING_METHOD.FIX
}


export default config
