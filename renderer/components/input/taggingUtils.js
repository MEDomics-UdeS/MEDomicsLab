import React from "react"
import { Chips } from "primereact/chips"
import { Chip } from "primereact/chip"

/**
 * Generate random color
 * @returns {string} - Random color
 * @summary This function is used to generate a random color
 */
const generateRandomColor = () => {
  let color = "#" + Math.floor(Math.random() * 16777215).toString(16)
  return color
}

/**
 * Template for the chips being shown in the input field of the multiselect
 * @param {object} option - Option
 * @returns {JSX.Element} - JSX element - chip template
 */
const customChip = (option) => {
  let style = { padding: "0px 5px", backgroundColor: tagsDict[option].color, color: tagsDict[option].fontColor }

  return <Chip className="custom-token" label={option} style={style}></Chip>
}

export { generateRandomColor, customChip }
