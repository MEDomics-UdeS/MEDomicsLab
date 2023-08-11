import React from "react"
import { Image } from "react-bootstrap"
import { shell } from "electron"

/**
 * @param {string} link - Link to the documentation
 * @param {string} name - Name of the documentation
 * @param {string} image - Image to display next to the documentation
 * @returns {JSX.Element} - A link to the documentation
 *
 * @description
 * This component is used to display a link to the documentation
 * of a specific extraction method.
 */
const DocLink = ({ linkString, name, image }) => {
  const handleLinkClick = (event) => {
    event.preventDefault()
    shell.openExternal(linkString)
  }

  return (
    <>
      <p
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "10px"
        }}
      >
        {image && (
          <Image
            src={image}
            width="20"
            height="20"
            style={{ marginRight: "10px" }}
          />
        )}
        <a href={linkString} onClick={handleLinkClick}>
          {name}
        </a>
      </p>
    </>
  )
}

export default DocLink
