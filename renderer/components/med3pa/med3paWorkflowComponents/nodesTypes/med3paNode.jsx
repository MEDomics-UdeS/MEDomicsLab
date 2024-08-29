import React from "react"
import Node from "../../../flow/node"
import { Button } from "react-bootstrap"
import { PiFloppyDisk } from "react-icons/pi"

// MED3pa context
import { useMED3paContext } from "../../../workspace/med3paContext"

/**
 *
 * @param {string} id id of the node
 * @param {Object} data data of the node
 * @returns {JSX.Element} A MED3Pa node
 *
 *
 * @description
 * This component is used to display a Group Node: MED3pa.
 */
export default function MED3paNode({ id, data }) {
  // context
  const { med3paData, add3paData } = useMED3paContext()

  return (
    <>
      {/* build on top of the Node component */}
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        nodeBody={
          <>
            <div className="center">
              <Button
                onClick={() => {
                  add3paData({
                    ...med3paData,
                    configuration: {
                      name: "Welcome to MED3pa Configuration!"
                    }
                  })
                  console.log(med3paData)
                }}
                icon={<PiFloppyDisk size={"1.5rem"} />}
                rounded
                className="btn-secondary border  ms-auto"
              >
                Configure MED3pa
              </Button>
            </div>
          </>
        }
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={
          <>
            <div>{med3paData.configuration?.name}</div>
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={<></>}
      />
    </>
  )
}
