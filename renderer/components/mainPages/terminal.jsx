import React, { useState, useEffect, useRef } from "react"
import { ipcRenderer } from "electron"
import ModulePage from "./moduleBasics/modulePage"

const TerminalPage = ({ pageId = "terminal", configPath = undefined }) => {
  const [terminalData, setTerminalData] = useState([])
  const terminalRef = useRef(null)

  ipcRenderer.on("log", (event, data) => {
    setTerminalData([...terminalData, data])
  })

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalData])

  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <div
          ref={terminalRef}
          style={{
            backgroundColor: "black",
            color: "white",
            fontFamily: "monospace",
            padding: "1em",
            overflowY: "auto",
            maxHeight: "300px"
          }}
        >
          {terminalData.map((data, index) => (
            <p key={index}>{data}</p>
          ))}
        </div>
      </ModulePage>
    </>
  )
}

export default TerminalPage
