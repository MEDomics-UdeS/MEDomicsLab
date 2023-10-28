import React, { use, useContext, useEffect, useState } from "react"
import useInterval from "@khalidalansi/use-interval"
import ModulePage from "./moduleBasics/modulePage"
import { Button } from "primereact/button"
import { requestBackend } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import MedDataObject from "../workspace/medDataObject"
import { DataContext } from "../workspace/dataContext"
import { toast } from "react-toastify"
import { SelectButton } from "primereact/selectbutton"
import { Card } from "primereact/card"
import { ProgressBar } from "primereact/progressbar"
import { Tooltip } from "primereact/tooltip"
import MEDconfig from "../../../medomics.dev"

const ActiveElement = ({ activeElement }) => {
  const { globalData, setGlobalData } = useContext(DataContext)
  const [metadata, setMetadata] = useState({})

  useEffect(() => {
    if (globalData) {
      if (activeElement.id in globalData) {
        let element = globalData[activeElement.id]
        if (!("activities" in element)) {
          element.activities = []
        }
        let isActivityAlreadyIn = false
        element.activities.forEach((activity) => {
          if (activity["id"] == activeElement["id"]) {
            isActivityAlreadyIn = true
          }
        })
        !isActivityAlreadyIn && element.activities.push(activeElement)
        let metadata = {
          name: element.name,
          lastModified: element.lastModified,
          activities: element.activities,
          id: element.id,
          absPath: element.path,
          pid: activeElement.pid,
          processState: activeElement.ProcessState,

          isProgress: activeElement.progress != "" ? true : false,
          progress: activeElement.progress
        }
        setMetadata(metadata)
      } else {
        toast.error("No element with id: " + activeElement.id + " in globalData")
      }
    }
  }, [activeElement, globalData])

  useEffect(() => {
    console.log("metadata:", metadata)
  }, [metadata])

  return (
    <>
      {metadata && (
        <Card
          title={metadata.name}
          subTitle={
            <>
              <table>
                <tbody>
                  <tr>
                    <td style={{ paddingRight: "1rem" }}>Last modified date:</td>
                    <td>{metadata.lastModified ? metadata.lastModified : "test"}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: "1rem" }}>Path:</td>
                    <td>{metadata.absPath}</td>
                  </tr>
                </tbody>
              </table>
            </>
          }
        >
          {metadata.isProgress && metadata.progress ? (
            <>
              {metadata.progress.is_server && (
                <>
                  {metadata.progress.dashboard_url ? (
                    <>
                      <h5>
                        Opened webserver on url:{" "}
                        <a
                          className="web-server-link"
                          onClick={() => {
                            require("electron").shell.openExternal(metadata.progress.dashboard_url)
                          }}
                        >
                          {metadata.progress.dashboard_url}
                        </a>
                      </h5>
                    </>
                  ) : (
                    <>
                      <h5>Dashboard is building...</h5>
                      <ProgressBar value={metadata.progress.now} />
                    </>
                  )}
                </>
              )}
              {metadata.progress.now && metadata.progress.currentLabel && (
                <>
                  <ProgressBar className={"tooltip-progressBar-" + activeElement.id} value={metadata.progress.now} />
                  <Tooltip target={".tooltip-progressBar-" + activeElement.id} showDelay={200} position="top">
                    {metadata.progress.currentLabel ? metadata.progress.currentLabel : ""}
                  </Tooltip>
                </>
              )}
            </>
          ) : (
            <>{metadata && <h5>Nothing specific to show, this process is opened in server</h5>}</>
          )}
        </Card>
      )}
    </>
  )
}

const OutputPage = ({ pageId = "output", configPath = undefined }) => {
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const [activeElements, setActiveElements] = useState([])
  const [isUpdating, setIsUpdating] = useState(true)
  const options = [
    { action: "Play", icon: "pi pi-Play" },
    { action: "Pause", icon: "pi pi-Pause" }
  ]

  const [value, setValue] = useState(options[0])

  useEffect(() => {
    console.log("OutputPage mounted")
    setIsUpdating(true)
    return () => {
      console.log("OutputPage unmounted")
      setIsUpdating(false)
    }
  }, [])

  useInterval(
    () => {
      getHealthInfosGoServer()
    },
    isUpdating ? 1000 : null
  )

  const getHealthInfosGoServer = () => {
    requestBackend(
      port,
      "get_server_health",
      { pageId: pageId },
      (data) => {
        let activeElements = []
        Object.keys(data).forEach((key) => {
          data[key] = JSON.parse(data[key])
          data[key].progress = data[key].progress != "" ? JSON.parse(data[key].progress) : ""
          data[key].id = key
          activeElements.push(data[key])
        })
        setActiveElements(activeElements)
      },
      (error) => {
        console.error(error)
        setIsUpdating(false)
      }
    )
  }

  const btnTemplate = (option) => {
    return (
      <div className="p-d-flex p-ai-center btn-play-pause">
        <span className="p-text-bold">{option.action}</span>
        <i className={`${option.icon.toLowerCase()}`} />
      </div>
    )
  }

  const handleOnSelectBtnChange = (e) => {
    if (e.value && e.value != value) {
      setValue(e.value)
      console.log("e.value:", e.value)
      if (e.value.action == "Play") {
        setIsUpdating(true)
      } else {
        setIsUpdating(false)
      }
    }
  }

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath} additionnalClassName="outputPage" shadow>
        <div>
          <div className="header">
            <h1>Active processes - {MEDconfig.serverChoice} server</h1>
            <SelectButton value={value} onChange={handleOnSelectBtnChange} itemTemplate={btnTemplate} options={options} />
          </div>
          {activeElements.map((activeElement, index) => (
            <ActiveElement key={index} activeElement={activeElement} />
          ))}
        </div>
      </ModulePage>
    </>
  )
}

export default OutputPage
