import React from "react"
import { Card, CardContent, Typography } from "@mui/material"
import { MdStar } from "react-icons/md" // Icon to highlight the best option
import Tooltip from "@mui/material/Tooltip"
import { formatValue } from "../../tabFunctions"
import { transformKey } from "../objSettings"
import { MdOutlineAnalytics } from "react-icons/md"

/**
 *
 * @param {Object} title The title of the card component.
 * @param {Object} data The data to display within the card.
 * @returns {JSX.Element} A React element representing the comparison card.
 *
 *
 * @description
 * The `ComparisonCard` component renders a card with a title and a list of data entries.
 * The best entry, if specified, is highlighted.
 * An analytics icon is placed on the right side of the title.
 */
const ComparisonCard = ({ title, data }) => {
  // Destructure 'best' from data and keep the rest in 'results'
  const { best, ...results } = data

  return (
    <Card
      style={{
        margin: "10px",
        flex: 1,
        border: "1px solid #ddd", // Light border for cards
        borderRadius: "4px", // Rounded corners
        boxShadow: "none"
      }}
    >
      <CardContent>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", color: "#777" }}>
          <Typography variant="h6" style={{ fontWeight: "bold", flex: 1 }}>
            {transformKey(title)}
          </Typography>
          <MdOutlineAnalytics style={{ marginRight: "5px", fontSize: "20px" }} />
        </div>
        <hr
          style={{
            borderColor: "#868686",
            borderWidth: "0.5px"
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Map through results and display each key-value pair */}
          {Object.entries(results).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "5px",
                backgroundColor: best === key ? "#e0f7fa" : "transparent", // Highlight best option
                padding: "5px",
                borderRadius: "4px"
              }}
            >
              <Typography variant="subtitle1" style={{ flex: 1, color: "#555" }}>
                {transformKey(key)}:
              </Typography>
              <Tooltip title={formatValue(value)}>
                <Typography variant="subtitle1" style={{ flex: 1, textAlign: "right", color: "#555" }}>
                  {formatValue(value)}
                </Typography>
              </Tooltip>
              {/* Display star icon if this is the best option */}
              {best === key && best !== null && <MdStar style={{ marginLeft: "10px", color: "#ffab00" }} />} {/* Highlight icon if best is not null */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 *.
 * @param {Object} data The data to display, where each top-level key is a card title.
 * @returns {JSX.Element} A React element representing the collection of comparison cards.
 *
 *
 * @description
 * The `ComparisonCards` component maps over the data object and renders a `ComparisonCard`
 * for each top-level key-value pair. The cards are displayed in a flexible, wrapping layout.
 * It is the main component
 */
const ComparisonCards = ({ data }) => {
  // Render cards for each top-level key in data
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
      {/* Map through the data object and render a ComparisonCard for each entry */}
      {Object.entries(data).map(([key, value]) => (
        <ComparisonCard key={key} title={key} data={value} />
      ))}
    </div>
  )
}

export default ComparisonCards
