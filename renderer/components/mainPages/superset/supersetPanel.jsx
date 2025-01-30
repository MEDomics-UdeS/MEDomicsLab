import { shell } from "electron";
import { Button } from "primereact/button";
import React, { useContext, useState } from 'react';
import { SiApachesuperset } from "react-icons/si";
import { LayoutModelContext } from "../../layout/layoutContext";
import { SupersetRequestContext } from "./supersetRequestContext";


/**
 *
 * @returns the superset panel
 */
const Panel = () => {
  const [toggle, setToggle] = useState(true)
  const { dispatchLayout } = useContext(LayoutModelContext)
  const { supersetPort, launched } = useContext(SupersetRequestContext)
  const cardStyle = {
    display: "flex", 
    flexDirection: "column", 
    alignItems: "flex-start", 
    border: "0px", 
    textColor: "white",
    backgroundColor: "rgb(53, 53, 53)" 
  }

  const toggleSuperset = () => {
    setToggle(!toggle)
  }

  return (
    <>
    <div className="flex-container" style={{ gap: "5px", maxHeight:"5px", paddingBottom: "45px"}}>
      <hr color="white" style={{border: "2px solid white", width:"7vw", alignItems: "left"}}></hr>
      <button onClick={toggleSuperset} style={{border: "0px"}}>
        {toggle ? 
          (<i className="pi pi-chevron-down" style={{color: "gray", fontSize: "2rem"}}></i>) 
          : (<i className="pi pi-chevron-up" style={{color: "gray", fontSize: "2rem"}}></i>)}
      </button>
      <hr color="white" style={{border: "2px solid white", width:"7vw", alignItems: "right"}}></hr>
    </div>
    {toggle && (
    <div style={{textAlign: "center", backgroundColor: "rgb(53, 53, 53)", padding: "5px"}}>
      <div style={{display: "flex", justifyContent: "center"}}>
        <SiApachesuperset style={{color:"white", fontSize: "50px", marginRight:"5px"}}/>
        <header style={{textAlign: "center", fontSize: "1.5rem", color: "white"}}>
          <h1>Superset</h1>
        </header>
      </div>
      <div className="card flex justify-content-center flex-column gap-1" style={{borderWidth: "0px", backgroundColor: "rgb(53, 53, 53)"}}>
        <Button label="Open" severity="info"  onClick={() => dispatchLayout({ type: "openSupersetFrameModule"})}/>
        {(launched && supersetPort) && (
          <div
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <span color="#4CAF50">🟢 Running on port {supersetPort}</span>
        </div>
      )}
        <span className="p-inputgroup-addon" style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i style={{color: "white"}} className="pi pi-check"></i>
            <label style={{color: "white"}}>Connect to Other Databases</label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i style={{color: "white"}} className="pi pi-check"></i>
            <label style={{color: "white"}} >Explore & Visualize</label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i style={{color: "white"}} className="pi pi-check"></i>
            <label style={{color: "white"}}>Create Dashboards</label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i style={{color: "white"}} className="pi pi-check"></i>
            <a><u style={{color: "white"}} onClick={() => {shell.openExternal("https://medomics-udes.gitbook.io/medomicslab-docs")}}>Export Data to Workspace</u></a>
          </div>
        </span>
        <Button label="Dashboard Viewer" severity="info" onClick={() => dispatchLayout({ type: "openSupersetModule"})}/>
        <span className="p-inputgroup-addon" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", border: "0px", backgroundColor: "rgb(53, 53, 53)"}}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i style={{color: "white"}} className="pi pi-check"></i>
            <label style={{color: "white"}}>Explore & Visualize</label>
          </div>
        </span>
      </div>
    </div>
    )}
    </>
  )
}

/**
 *
 * @param {String} pageId The page id
 * @returns the superset page with the module page
 */
const SupersetPanel = () => {
  return (
    <Panel />
  )
}

export default SupersetPanel
