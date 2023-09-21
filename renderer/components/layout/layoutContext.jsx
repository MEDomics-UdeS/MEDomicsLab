import { React, createContext, useContext } from "react"
import LearningPage from "../mainPages/learning"
import { DataContext } from "../workspace/dataContext"
/**
 * @typedef {React.Context} LayoutModelContext
 * @description Context for the layout model
 * @summary This is the context that holds the layout model and the dispatch function for the layout model
 * This context is used by the LayoutProvider to provide the layout model to the rest of the application
 * @see {@link https://react.dev/learn/passing-data-deeply-with-context}
 */
export const LayoutModelContext = createContext(null)

/**
 * @typedef {React.FunctionComponent} LayoutContext
 * @description Context function for the layout model
 * @params {Object} children - The children of the LayoutContext - The ones that will be wrapped by the LayoutContext
 * @params {Object} layoutModel - The layout model that will be used by the LayoutContext that is passed by the App component
 * @params {Object} setlayoutModel - The layout model setting function that will be used by the LayoutContext to change the state of the layout model that is passed by the App component
 * @summary This function enables us to wrap the children of the LayoutContext and make to them the layout model and the functions to interact with it available
 * @author Nicolas Longchamps @link
 */
function LayoutContext({ children, layoutModel, setLayoutModel }) {
  const { globalData } = useContext(DataContext)
  /**
   * @param {FlexLayout.Model.Action} action - The actions passed on by the flexlayout-react library
   * @param {FlexLayout.Model} model - The model passed on by the flexlayout-react library
   * @returns It translates the actions passed on by the flexlayout-react library into actions that are understood by the rest of the application
   * @summary This function is called in the mainContainerFunctional component in its
   */
  const flexlayoutInterpreter = (action, model) => {
    // Logging for debugging purposes
    console.log("flexlayoutInterpreter", action)
    console.log("flexlayoutInterpreter Model", model)

    // When the function is called, the action is passed as a parameter like this: {type: "FlexLayout_AddTab", payload: {…}}
    switch (action.type) {
      case "FlexLayout_DeleteTab":
        Object.keys(model._idMap).map((key) => {
          // Here we go get the map of ids inside the flexlayout : model._idMap
          // We compare it to the node that is passed on by the action and call the remove function if we find a match
          console.log(key)
          if (key === action.data.node) {
            console.log("GOT IT", model._idMap[key])
            let target = model._idMap[key]
            remove({ type: "remove", payload: { name: target._attributes.name } })
          }
        })
        return console.log("FlexLayout_DeleteTab", action)
      case "FlexLayout_SelectTab":
        // Not implemented yet - Debbuging purposes and to see how the action is passed on
        document.getElementById(action.data.node)
        return console.log("FlexLayout_SelectTab", action)

      default:
        return console.log("FlexLayout_Default", action)
    }
  }
  // }

  /**
   * @param {Object} action - The action passed on by the components that use/modify the layout model
   * @description This function is used to dispatch the actions passed on by the components that use/modify the layout model - [Switch case] It dispaches the actions according to their type
   */
  const dispatchLayout = (action) => {
    switch (action.type) {
      case "open LEARNING":
        return openLearning(action)
      case "add":
        return add(action)
      case "remove":
        return remove(action)
      default:
        throw new Error(`Unhandled action type: ${action.type}`)
    }
  }

  /**
   * @summary Function that adds a new child to the layout model
   * @params {Object} action - The action passed on by the dispatchLayout function, it uses the payload in the action as a JSON object to add a new child to the layout model
   */
  const openLearning = (action) => {
    console.log("ACTION", action)
    let medObject = action.payload
    console.log("medObject", medObject)
    let textString = action.payload

    const newChild = {
      type: "tab",
      name: medObject.name,
      id: medObject.UUID,
      component: "learningPage",
      config: { path: medObject.path, uuid: medObject.UUID }
    }

    const nextlayoutModel = { ...layoutModel }
    // To add a new child to the layout model, we need to add it to the children array (layoutModel.layout.children[x].children)
    // ****IMPORTANT**** For the hook to work, we need to create a new array and not modify the existing one
    const newChildren = [...layoutModel.layout.children[0].children, newChild]
    nextlayoutModel.layout.children[0].children = newChildren
    setLayoutModel(nextlayoutModel)
    console.log("ADDING LEARNING PAGE", textString)
    console.dir(layoutModel)
  }

  /**
   * @summary Function that adds a new child to the layout model
   * @params {Object} action - The action passed on by the dispatchLayout function, it uses the payload in the action as a JSON object to add a new child to the layout model
   */
  const add = (action) => {
    let textString = action.payload

    const nextlayoutModel = { ...layoutModel }
    // To add a new child to the layout model, we need to add it to the children array (layoutModel.layout.children[x].children)
    // ****IMPORTANT**** For the hook to work, we need to create a new array and not modify the existing one
    const newChildren = [...layoutModel.layout.children[0].children, action.payload]
    nextlayoutModel.layout.children[0].children = newChildren
    setLayoutModel(nextlayoutModel)
    console.log("ADD TEST", textString)
    console.dir(layoutModel)
  }

  /**
   * @summary Function that removes a child from the layout model
   * @description
   * 1. remove is called by the dispatchLayout function from the components in the WorkspaceSidebar component
   * 2. remove is called by the flexlayoutInterpreter function from the mainContainerFunctional component - It is called when a tab is closed
   * @params {Object} action - The action passed on by the dispatchLayout function, it uses the payload in the action as a JSON object to remove a child from the layout model
   */
  const remove = (action) => {
    // Searches the layoutModel for the payload and removes it, iterates over the childen array (layoutModel.layout.children[x].children)
    // and removes the payload if it exists
    console.log("REMOVE TEST", action.payload)
    let textString = action.payload
    const nextlayoutModel = { ...layoutModel }
    /** Here, we iterate through the layout model children, then we filter out the ones specified
     * ****IMPORTANT**** For the hook to work, we need to create a new array and not modify the existing one
     */
    for (let i = 0; i < nextlayoutModel.layout.children.length; i++) {
      nextlayoutModel.layout.children[i].children = nextlayoutModel.layout.children[i].children.filter((child) => child.name !== textString.name)
    }
    // nextlayoutModel.layout.children[0].children = nextlayoutModel.layout.children[0].children.filter((child) => child !== action.payload);
    setLayoutModel(nextlayoutModel)
  }

  // Returns the LayoutModelContext.Provider with the layoutModel, the dispatchLayout function and the flexlayoutInterpreter function as values
  // The children are wrapped by the LayoutModelContext.Provider and will have access to the layoutModel, the dispatchLayout function and the flexlayoutInterpreter function
  return <LayoutModelContext.Provider value={{ layoutModel, dispatchLayout, flexlayoutInterpreter }}>{children}</LayoutModelContext.Provider>
}

export default LayoutContext
