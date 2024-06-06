import React, { useContext } from "react"
import { Accordion, Stack } from "react-bootstrap"
import { MongoDBContext } from "../../../mongoDB/mongoDBContext"
import SidebarDBTree from "../DBTree/sidebarDBTree"

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component as the home page
 *
 */
const HomeSidebar = () => {
  const { DB } = useContext(MongoDBContext)

  return (
    <>
      <Stack direction="vertical" gap={0}>
        <p
          style={{
            color: "#a3a3a3",
            font: "Arial",
            fontSize: "12px",
            padding: "0.75rem 0.25rem 0.75rem 0.75rem",
            margin: "0 0 0 0"
          }}
        >
          Home
        </p>
        {DB.hasBeenSet && (
          <Accordion defaultActiveKey={["DBTree"]} alwaysOpen>
            <SidebarDBTree />
          </Accordion>
        )}
      </Stack>
    </>
  )
}

export default HomeSidebar
