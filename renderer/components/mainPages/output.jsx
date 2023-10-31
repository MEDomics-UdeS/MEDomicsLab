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
import { IoClose } from "react-icons/io5"
import { PageInfosContext } from "./moduleBasics/pageInfosContext"

const ActiveElement = ({ activeElement }) => {
  const { globalData, setGlobalData } = useContext(DataContext)
  const [metadata, setMetadata] = useState(undefined)
  const { port } = useContext(WorkspaceContext) // we get the port for server connexion
  const { pageId } = useContext(PageInfosContext) // we get the pageId to send to the server

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
          urlId: activeElement.urlId,
          absPath: element.path,
          pid: activeElement.pid,
          processState: activeElement.ProcessState,
          progress: activeElement.progress,
          isProgress: activeElement.progress != ""
        }
        setMetadata(metadata)
      } else {
        toast.error("No element with id: " + activeElement.id + " in globalData")
      }
    }
  }, [activeElement, globalData])

  const getOutput2Show = (metadata) => {
    if (!metadata) return <></>
    switch (metadata.progress.type) {
      case "dashboard":
        return (
          <>
            {metadata.progress.dashboard_url ? (
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
            ) : (
              <>
                <h5>Dashboard is building... </h5>
                <h6 className="margin-0.25">Approximate duration: {metadata.progress.duration} min</h6>
                <ProgressBar value={metadata.progress.now >= 100 ? 100 : metadata.progress.now} />
              </>
            )}
          </>
        )
      case "process":
        return (
          <>
            <ProgressBar className={"tooltip-progressBar-" + metadata.id} value={metadata.progress.now >= 100 ? 100 : metadata.progress.now} />
            <Tooltip target={".tooltip-progressBar-" + metadata.id} showDelay={200} position="top">
              {metadata.progress.currentLabel ? metadata.progress.currentLabel : ""}
            </Tooltip>
          </>
        )
      default:
        return (
          <>
            <h5>Gathering informations...</h5>
          </>
        )
    }
  }

  return (
    <>
      {metadata && (
        <Card
          title={
            <>
              {metadata.name}
              <IoClose
                className="btn-close-output-card"
                onClick={(e) => {
                  requestBackend(
                    port,
                    "removeId/" + metadata.urlId,
                    { pageId: pageId },
                    (data) => {
                      if (data.error) {
                        console.error(data)
                      }
                      console.log("closing", data, "with id:", pageId)
                    },
                    (error) => {
                      console.error(error)
                    }
                  )
                }}
              />
            </>
          }
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
          {getOutput2Show(metadata)}
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
      requestBackend(
        port,
        "get_server_health",
        { pageId: pageId },
        (data) => {
          let activeElements = []
          Object.keys(data).forEach((key) => {
            let element = JSON.parse(data[key])
            element.progress = element.progress != "" ? JSON.parse(element.progress) : ""
            element.urlId = key
            element.id = key.split("/")[key.split("/").length - 1]
            activeElements.push(element)
          })
          setActiveElements(activeElements)
        },
        (error) => {
          setIsUpdating(false)
        }
      )
    },
    isUpdating ? 1000 : null
  )

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
      <ModulePage pageId={pageId} configPath={configPath} additionnalClassName="outputPage" shadow scrollable={false}>
        <div>
          <div className="header">
            <h1>Active processes - {MEDconfig.serverChoice} server</h1>
            <SelectButton value={value} onChange={handleOnSelectBtnChange} itemTemplate={btnTemplate} options={options} />
          </div>
          <div className="eval-body">
            {activeElements.map((activeElement, index) => (
              <ActiveElement key={index} activeElement={activeElement} />
            ))}
          </div>
        </div>
      </ModulePage>
    </>
  )
}

export default OutputPage
