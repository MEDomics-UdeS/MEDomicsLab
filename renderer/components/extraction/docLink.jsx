import React from "react";
import { Image } from "react-bootstrap";
import { shell } from "electron";

const DocLink = ({ link, name, image }) => {
  const handleLinkClick = (event) => {
    event.preventDefault();
    shell.openExternal(link);
  };

  return (
    <>
      <p
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "10px",
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
        <a href={link} onClick={handleLinkClick}>
          {name}
        </a>
      </p>
    </>
  );
};

export default DocLink;
