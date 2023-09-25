import { React, createContext } from "react"

/**
 * @typedef {React.Context} ActionContext
 * @description Context for the action handler
 * @summary This is the context that holds the action handler and the dispatch function for the action handler
 * This context is used by the LayoutProvider to provide the action handler to the rest of the application
 * @see {@link https://react.dev/learn/passing-data-deeply-with-context}
 */
const ActionContext = createContext(null)

/**
 * @typedef {React.FunctionComponent} ActionContextProvider
 * @description Context function for the action handler
 * @params {Object} children - The children of the LayoutContext - The ones that will be wrapped by the LayoutContext
 * @params {Object} Action - The action handler that will be used by the LayoutContext that is passed by the App component
 * @params {Object} setAction - The action handler setting function that will be used by the LayoutContext to change the state of the action handler that is passed by the App component
 * @summary This function enables us to wrap the children of the LayoutContext and make to them the action handler and the functions to interact with it available
 * @author Nicolas Longchamps @link
 */
function ActionContextProvider({ children }) {
  /**
   * @param {Object} action - The action passed on by the components that use/modify the action handler
   * @param
   * @description This function is used to dispatch the actions passed on by the components that use/modify the action handler - [Switch case] It dispaches the actions according to their type
   */

  const dispatchAction = (action) => {
    switch (action.module) {
      case "learning":
        return console.log("learning", action)
      case "input":
        return console.log("input", action)
      case "extraction":
        return console.log("extraction", action)
      default:
        return console.log("default", action)
    }
  }

  // Returns the ActionContext.Provider with the Action, the dispatchAction function and the flexlayoutInterpreter function as values
  // The children are wrapped by the ActionContext.Provider and will have access to the Action, the dispatchAction function and the flexlayoutInterpreter function
  return <ActionContext.Provider value={{ dispatchAction }}>{children}</ActionContext.Provider>
}

export { ActionContextProvider, ActionContext }
