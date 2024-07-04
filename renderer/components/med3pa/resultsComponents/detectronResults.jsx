import { Typography } from "@mui/material"
import { BiSearchAlt } from "react-icons/bi"
import React, { useEffect, useState } from "react"
import { Tab, Tabs } from "react-bootstrap"
import { Table } from "react-bootstrap" // Assuming you have react-bootstrap imported for better table design

const DetectronResults = ({ detectronResults }) => {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    console.log("DETECTRON RESULTS", detectronResults.detectron_results)
    if (detectronResults && detectronResults.length > 0) {
      setInitialized(true)
    }
  }, [detectronResults])

  if (!initialized) {
    return (
      <div className="card-paresults p-3">
        <Typography
          variant="h6"
          style={{
            color: "#868686",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center"
          }}
        >
          <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.6rem" }} /> Covariate Shift Detection
        </Typography>
        <hr
          style={{
            borderColor: "#868686",
            borderWidth: "0.5px",
            flex: "1",
            marginLeft: "0.5rem"
          }}
        />
        <div className="default-text-color-paresults">Loading...</div>
      </div>
    )
  }

  if (!detectronResults || detectronResults.length === 0) {
    return (
      <div className="card-paresults p-3">
        <Typography
          variant="h6"
          style={{
            color: "#868686",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center"
          }}
        >
          <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.6rem" }} /> Covariate Shift Detection
        </Typography>
        <hr
          style={{
            borderColor: "#868686",
            borderWidth: "0.5px",
            flex: "1",
            marginLeft: "0.5rem"
          }}
        />
        <div className="default-text-color-paresults">No results were found. You haven't Executed Detectron</div>
      </div>
    )
  }

  return (
    <div className="card-paresults p-3">
      <Typography
        variant="h6"
        style={{
          color: "#868686",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center"
        }}
      >
        <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.6rem" }} /> Covariate Shift Detection
      </Typography>
      <hr
        style={{
          borderColor: "#868686",
          borderWidth: "0.5px",
          flex: "1",
          marginLeft: "0.5rem"
        }}
      />

      {/* Render the Tabs component and map through detectronResults */}
      <Tabs defaultActiveKey="0" id="strategy-tabs" className="mb-3">
        {detectronResults.map((result, index) => (
          <Tab key={index} eventKey={index} title={result.Strategy}>
            <div style={{ marginTop: "1rem" }}>
              <Table bordered hover>
                <tbody>
                  {Object.entries(result).map(
                    ([key, value]) =>
                      key !== "Strategy" && (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>
                            {key === "significance_description" ? (
                              <Table bordered>
                                <tbody>
                                  {Object.entries(value).map(([descKey, descValue]) => (
                                    <tr key={descKey}>
                                      <td>{descKey}</td>
                                      <td>{typeof descValue === "number" ? `${descValue.toFixed(2)}%` : descValue}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            ) : typeof value === "number" ? (
                              key.endsWith("%") ? (
                                `${value.toFixed(2)}%`
                              ) : (
                                value.toFixed(4)
                              )
                            ) : (
                              value
                            )}
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  )
}

export default DetectronResults
