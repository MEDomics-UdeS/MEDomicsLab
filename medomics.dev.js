export const PORT_FINDING_METHOD = {
  FIX: 0,
  AVAILABLE: 1
}

const config = {
  runServerAutomatically: true,
  useReactDevTools: false,
  defaultPort: 5008,
  portFindingMethod: PORT_FINDING_METHOD.FIX,
}

export default config
