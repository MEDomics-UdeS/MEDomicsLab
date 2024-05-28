import React, { useContext } from "react"
import { Accordion, Stack } from "react-bootstrap"
import { Tree } from "primereact/tree"
import { MongoDBContext } from "../../../mongoDB/mongoDBContext"

const SidebarDBTree = () => {
  const { DBData } = useContext(MongoDBContext)

  return (
    <Accordion.Item eventKey="DBTree">
      <Accordion.Header>
        <Stack direction="horizontal" style={{ flexGrow: "1" }}>
          <p>
            <strong>DATABASE</strong>
          </p>
        </Stack>
      </Accordion.Header>
      <Accordion.Body>
        <Tree value={DBData}></Tree>
      </Accordion.Body>
    </Accordion.Item>
  )
}

export default SidebarDBTree
