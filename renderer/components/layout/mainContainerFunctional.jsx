import React, { useRef, useState, useEffect, useContext } from "react"
import test from "../../styles/test.module.css"
import DataTable from "../../components/dataTypeVisualisation/dataTableWrapper"
import * as Prism from "prismjs"
import { LayoutModelContext } from "./layoutContext"
import { Actions, CLASSES, Layout, Model, TabNode } from "flexlayout-react"
import LearningPage from "../mainPages/learning"
import { loadCSVPath } from "../../utilities/fileManagementUtils"

var fields = ["Name", "Field1", "Field2", "Field3", "Field4", "Field5"]

/**
 *
 * @param {Object} props - Set of parameters passed by the parent component
 * @returns A JSX element that is the main container for the application - See the flexlayout-react documentation for more information
 * @description - This component is the main container for the application. Each page will be a tab in this container. It is a functional component.
 * @warning - You should not be playing around with this component unless you know what you are doing.
 */
export default function MainFlexLayout() {
  // let inner_model = layoutmodel;
  const layoutRef = useRef(null) // Reference to the layout component
  const [mainState, setMainState] = useState({}) // State to keep track of the main state of the application/this component
  const [nextGridIndex, setNextGridIndex] = useState(0) // State to keep track of the next grid index
  // let contents; // Variable to hold the contents of the main container - Not used for now

  const { layoutModel, flexlayoutInterpreter } = useContext(LayoutModelContext) // Get the layout model and the flexlayout interpreter from the context

  const [myInnerModel, setMyInnerModel] = useState(layoutModel) // State to keep track of the inner model - Used to update the layout model - for debugging purposes mainly
  // setMyInnerModel(inner_model);

  const [model, setModel] = useState(Model.fromJson(layoutModel)) // State to keep track of the model - Used to update the layout model also

  useEffect(() => {
    // Use effect to update the model when the layout model changes
    if (myInnerModel !== layoutModel) {
      // If the inner model is not the same as the layout model, update the inner model
      setMyInnerModel(layoutModel)
    }
    console.log("MainFlexLayout useEffect", layoutModel)
    setMyInnerModel(layoutModel)
    setModel(Model.fromJson(layoutModel))
  }, [layoutModel]) // Update the model when the layout model changes

  // console.log("Inner model", inner_model);

  function handleNextGridIndex() {
    // Function to handle the next grid index
    setNextGridIndex(nextGridIndex + 1)
    return nextGridIndex - 1
  }

  let htmlTimer = null
  let showingPopupMenu = false

  function onModelChange() {
    // Function to handle model changes that uses a timer to update the model
    if (htmlTimer) {
      clearTimeout(htmlTimer)
    }
    // console.log("onModelChange", event);
    htmlTimer = setTimeout(() => {
      const jsonText = JSON.stringify(model && model.toJson(), null, "\t")
      const html = Prism.highlight(jsonText, Prism.languages.javascript, "javascript")
      setMainState({ ...mainState, json: html })
      htmlTimer = null
    }, 500)
  }

  function onAddFromTabSetButton(node) {
    // Function to handle the click event when adding a new tab and adding it to the tab set
    layoutRef.current.addTabToTabSet(node.getId(), {
      component: "grid",
      name: "Grid " + handleNextGridIndex()
    })
  }

  function onRenderDragRect(content) {
    // Function to handle the rendering of the drag rectangle
    if (mainState.layoutFile === "newfeatures") {
      return (
        <>
          {content}
          <div style={{ whiteSpace: "pre" }}>
            <br />
            This is a customized
            <br />
            drag rectangle
          </div>
        </>
      )
    } else {
      return undefined // use default rendering
    }
  }

  function onContextMenu(node, event) {
    // Function to handle the context menu event of the tabs
    if (!showingPopupMenu) {
      event.preventDefault()
      event.stopPropagation()
      console.log(node, event)
      showingPopupMenu = true
    }
  }

  function onAuxMouseClick(node, event) {
    console.log(node, event)
  }

  function onRenderFloatingTabPlaceholder(dockPopout, showPopout) {
    // Function to handle the rendering of the floating tab placeholder
    return (
      <div className={CLASSES.FLEXLAYOUT__TAB_FLOATING_INNER}>
        <div>Custom renderer for floating tab placeholder</div>
        <div>
          <a href="#" onClick={showPopout}>
            {"show the tab"}
          </a>
        </div>
        <div>
          <a href="#" onClick={dockPopout}>
            {"dock the tab"}
          </a>
        </div>
      </div>
    )
  }

  function onExternalDrag(e) {
    // Function to handle the external drag event of the tabs
    const validTypes = ["text/uri-list", "text/html", "text/plain"]
    if (e.dataTransfer.types.find((t) => validTypes.indexOf(t) !== -1) === undefined) return
    e.dataTransfer.dropEffect = "link"
    return {
      dragText: "Drag To New Tab",
      json: {
        type: "tab",
        component: "multitype"
      },
      onDrop: (node, event) => {
        if (!node || !event) return // aborted drag

        if (node instanceof TabNode && event instanceof DragEvent) {
          const dragEvent = event
          if (dragEvent.dataTransfer) {
            if (dragEvent.dataTransfer.types.indexOf("text/uri-list") !== -1) {
              const data = dragEvent.dataTransfer && dragEvent.dataTransfer.getData("text/uri-list")
              if (model) {
                model.doAction(
                  Actions.updateNodeAttributes(node.getId(), {
                    name: "Url",
                    config: { data, type: "url" }
                  })
                )
              }
            } else if (dragEvent.dataTransfer.types.indexOf("text/html") !== -1) {
              const data = dragEvent.dataTransfer && dragEvent.dataTransfer.getData("text/html")
              if (model) {
                model.doAction(
                  Actions.updateNodeAttributes(node.getId(), {
                    name: "Html",
                    config: { data, type: "html" }
                  })
                )
              }
            } else if (dragEvent.dataTransfer.types.indexOf("text/plain") !== -1) {
              const data = dragEvent.dataTransfer && dragEvent.dataTransfer.getData("text/plain")
              model &&
                model.doAction(
                  Actions.updateNodeAttributes(node.getId(), {
                    name: "Text",
                    config: { data, type: "text" }
                  })
                )
            }
          }
        }
      }
    }
  }

  function onTabDrag(dragging, over, x, y, location, refresh) {
    const tabStorageImpl = over.getExtraData()["tabStorage_onTabDrag"]
    if (tabStorageImpl) {
      return tabStorageImpl(dragging, over, x, y, location, refresh)
    }
    return undefined
  }

  function onTableClick() {}

  function onAction(action) {
    console.log("action: ", action)
    flexlayoutInterpreter(action, model)
    return action
  }

  function titleFactory(node) {
    if (node.getId() === "custom-tab") {
      return {
        titleContent: <div>(Added by titleFactory) {node.getName()}</div>,
        name: "the name for custom tab"
      }
    }
    return
  }

  function iconFactory(node) {
    if (node.getId() === "custom-tab") {
      return (
        <>
          <span style={{ marginRight: 3 }}></span>
        </>
      )
    }
    return
  }

  function onRenderTab() {
    // renderValues.content = (<InnerComponent/>);
    // renderValues.content += " *";
    // renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
    // renderValues.name = "tab " + node.getId(); // name used in overflow menu
    // renderValues.buttons.push(<img style={{width:"1em", height:"1em"}} src="images/folder.svg"/>);
  }

  function onRenderTabSet(node, renderValues) {
    if (mainState.layoutFile === "default") {
      renderValues.stickyButtons.push(<img src="images/add.svg" alt="Add" key="Add button" title="Add Tab (using onRenderTabSet callback, see Demo)" style={{ width: "1.1em", height: "1.1em" }} className="flexlayout__tab_toolbar_button" onClick={() => onAddFromTabSetButton(node)} />)
    }
  }

  function onTabSetPlaceHolder() {
    return <div>Drag tabs to this area</div>
  }

  // Utils functions ****************************************************
  function makeFakeData() {
    var data = []
    var r = Math.random() * 50
    for (var i = 0; i < r; i++) {
      var rec = {}
      rec.Name = randomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
      for (var j = 1; j < fields.length; j++) {
        rec[fields[j]] = (1.5 + Math.random() * 2).toFixed(2)
      }
      data.push(rec)
    }
    return data
  }

  function randomString(len, chars) {
    var a = []
    for (var i = 0; i < len; i++) {
      a.push(chars[Math.floor(Math.random() * chars.length)])
    }

    return a.join("")
  }
  // ****************************************************

  function factory(node) {
    var component = node.getComponent()

    if (component === "json") {
      return <pre style={{ tabSize: "20px" }}>{mainState.json ? <span dangerouslySetInnerHTML={{ __html: mainState.json }} /> : null}</pre>
    } else if (component === "grid") {
      if (node.getExtraData().data == null) {
        // create data in node extra data first time accessed
        node.getExtraData().data = makeFakeData()
      }
      return <SimpleTable fields={fields} onClick={onTableClick.bind(node)} data={node.getExtraData().data} />
    } else if (component === "text") {
      try {
        return <div dangerouslySetInnerHTML={{ __html: node.getConfig().text }} />
      } catch (e) {
        console.log(e)
      }
    } else if (component === "newfeatures") {
      return <></>
    } else if (component === "multitype") {
      try {
        const config = node.getConfig()
        if (config.type === "url") {
          return (
            <iframe
              title={node.getId()}
              src={config.data}
              style={{
                display: "block",
                border: "none",
                boxSizing: "border-box"
              }}
              width="100%"
              height="100%"
            />
          )
        } else if (config.type === "html") {
          return <div dangerouslySetInnerHTML={{ __html: config.data }} />
        } else if (config.type === "text") {
          return (
            <textarea
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                resize: "none",
                boxSizing: "border-box",
                border: "none"
              }}
              defaultValue={config.data}
            />
          )
        }
      } catch (e) {
        return <div>{String(e)}</div>
      }
    } else if (component === "tabstorage") {
      return <></>
    } else if (component === "dataTable") {
      if (node.getExtraData().data == null) {
        const config = node.getConfig()
        console.log("dataTable config", config)
        const whenDataLoaded = (data) => {
          node.getExtraData().data = data
          console.log("node", node)
          console.log("retrieve node in layoutModel", model.getNodeById(node.getId()))
          model.getNodeById(node.getId())._attributes.config["data"] = data
          // let layout = layoutModel.layout
          // layout.tabs[node.getId()].config.data = data
        }
        loadCSVPath(config.path, whenDataLoaded)
      }
      return (
        <DataTable
          data={node.getExtraData().data}
          tablePropsData={{
            paginator: true,
            rows: 10,
            scrollable: true,
            scrollHeight: "400px"
          }}
          tablePropsColumn={{
            sortable: true
          }}
        />
      )
    } else if (component === "learningPage") {
      if (node.getExtraData().data == null) {
        const config = node.getConfig()
        console.log("LearningPage config", config)
        return <LearningPage pageId={"test"} configPath={config.path} />
      }
    }

    return null
  }

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div className={test.Container}>
          <Layout
            ref={layoutRef}
            model={model}
            factory={factory}
            font={mainState.fontSize}
            onAction={onAction}
            onModelChange={onModelChange}
            titleFactory={titleFactory}
            iconFactory={iconFactory}
            onRenderTab={onRenderTab}
            onRenderTabSet={onRenderTabSet}
            onRenderDragRect={onRenderDragRect}
            onRenderFloatingTabPlaceholder={mainState.layoutFile === "newfeatures" ? onRenderFloatingTabPlaceholder : undefined}
            onExternalDrag={onExternalDrag}
            realtimeResize={mainState.realtimeResize}
            onTabDrag={mainState.layoutFile === "newfeatures" ? onTabDrag : undefined}
            onContextMenu={mainState.layoutFile === "newfeatures" ? onContextMenu : undefined}
            onAuxMouseClick={mainState.layoutFile === "newfeatures" ? onAuxMouseClick : undefined}
            onTabSetPlaceHolder={onTabSetPlaceHolder}
          />
        </div>
      </div>
    </>
  )
}

class SimpleTable extends React.Component {
  shouldComponentUpdate() {
    return true
  }

  render() {
    // if (Math.random()>0.8) throw Error("oppps I crashed");
    var headercells = this.props.fields.map(function (field) {
      return <th key={field}>{field}</th>
    })

    var rows = []
    for (var i = 0; i < this.props.data.length; i++) {
      var row = this.props.fields.map((field) => <td key={field}>{this.props.data[i][field]}</td>)
      rows.push(<tr key={i}>{row}</tr>)
    }

    return (
      <table className="simple_table" onClick={this.props.onClick}>
        <tbody>
          <tr>{headercells}</tr>
          {rows}
        </tbody>
      </table>
    )
  }
}
