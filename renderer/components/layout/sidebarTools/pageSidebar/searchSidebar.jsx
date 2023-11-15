import React from "react"
import { Accordion, Stack } from "react-bootstrap"

/**
 * @description - This component is the search sidebar component that will be used in the sidebar tools component
 * @param {props} props - Props passed from parent component if we need to pass any
 * @returns {JSX.Element} - Returns the search sidebar component
 */
const SearchSidebar = () => {
  return (
    <>
      <Stack direction="vertical" gap={0}>
        <p style={{ color: "#a3a3a3", font: "Arial", fontSize: "12px", padding: "0.75rem 0.25rem 0.75rem 0.75rem", margin: "0 0 0 0" }}>SEARCH - TO BE IMPLEMENTED</p>
        <input type="text" placeholder="Search" style={{ width: "95%", height: "30px", padding: "0.25rem 0.25rem 0.25rem 0.25rem", margin: "0 0 0 0.5rem" }} />
        <Accordion defaultActiveKey={["0"]} alwaysOpen>
          {" "}
          {/** Here, we use an accordion bootstrap component to  */}
          <Accordion.Item eventKey="0">
            <Accordion.Header></Accordion.Header>
            <Accordion.Body></Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </>
  )
}

export default SearchSidebar
