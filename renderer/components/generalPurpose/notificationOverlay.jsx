import React, { useState, useContext, useEffect, useRef } from "react"
import ProgressBar from "react-bootstrap/ProgressBar"
import useInterval from "@khalidalansi/use-interval"
import { requestBackend } from "../../utilities/requests"
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Badge } from "primereact/badge";
import { WorkspaceContext } from "../workspace/workspaceContext"
import { toast } from "react-toastify"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { NotificationContext } from "./notificationContext";
import { ipcRenderer } from "electron";
import { parse } from "papaparse";

/**
 * @description - This component is the notification overlay component that will be used in the main layout component
 * 
 */
const NotificationOverlay = () => {
  const { port } = useContext(WorkspaceContext) // used to get the port
  const { notifications, setNotifications } = useContext(NotificationContext) // used to get the notifications
  const op = useRef(null);
  const [ notificationCards, setNotificationCards ] = useState([])
  
  useEffect(() => {
    ipcRenderer.on("notification", (event, arg) => {
      setNotifications([...notifications, arg])
    })
  }, [])

  useEffect(() => {
    ipcRenderer.invoke("getInstalledPythonPackages").then((res) => {
      console.log("Installed Python Packages: ", res);
    })
  }, [])

  useEffect(() => {
    parseNotifications()
  } , [notifications])

  const parseNotifications = () => {
    let cards = []
    notifications.forEach((notification, index) => {
      cards.push(
        <div key={index}>
          <p>{notification}</p>
        </div>
      )
    })
    setNotificationCards(cards)
  }
    

  const style = {
    position: "absolute",
    right: "5px",
    bottom: "5px",
    padding: "0rem",
   }

  const style2 = {
    position: "absolute",
    right: "10px",
    bottom: "10px",
    maxWidth: "30rem",
    maxHeight: "20rem",
  }

  const styleCard = {
    backgroundColor: "red"
  }

  return (
    <>
      <div className="notification-overlay" style={styleCard}>
        {/*  */}
        <Button icon="pi pi-bell" text aria-label="Notification" onClick={(e) => op.current.toggle(e)}  style={style}/>
        <OverlayPanel ref={op} style={style2} dismissable={false} >
        <p
          style={{
            color: "#a3a3a3",
            font: "Arial",
            fontSize: "12px",
            padding: "0.75rem 0.25rem 0.75rem 0.75rem",
            margin: "0 0 0 0",
            position: "relative",
            top: "-10px",
            left: "-10px"
          }}
        >
          Notifications
        </p>
        {notifications.length == 0 && <h3 style={{ color: "white", paddingInline: "1rem" }}>No notifications</h3>}
        {notifications.length != 0 && (
        {notificationCards}
        )}
          
        </OverlayPanel>
      </div>
    </>
  )
}

export default NotificationOverlay
