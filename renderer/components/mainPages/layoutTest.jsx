import React from "react"
import test from "../../styles/test.module.css"
import MainFlexLayout from "../layout/mainContainerFunctional"
import crypto from "crypto"

function LayoutTestPage(props) {
  let innerJson = {
    global: { tabEnableClose: true },
    borders: [
      {
        type: "border",
        location: "bottom",
        size: 100,
        children: [
          {
            type: "tab",
            name: "four",
            component: "text"
          }
        ]
      }
    ],
    layout: {
      type: "row",
      weight: 100,
      children: [
        {
          type: "tabset",
          weight: 50,
          selected: 0,
          children: [
            {
              type: "tab",
              name: "Learning",
              component: "grid"
            }
          ]
        },
        {
          type: "tabset",
          weight: 50,
          selected: 0,
          children: [
            {
              type: "tab",
              name: "Discovery",
              enableClose: true,
              component: "grid"
            },
            {
              type: "tab",
              name: "Application",
              component: "grid"
            }
          ]
        }
      ]
    }
  }

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div className={test.Container}>
          <Main />
          {/* <MainFlexLayout model={innerJson}/> */}
        </div>
      </div>
    </>
  )
}

export default LayoutTestPage
