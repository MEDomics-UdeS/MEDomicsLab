import React from "react";
import { Image } from "react-bootstrap";

const DocLink = ({ link, name }) => {
  return (
    <>
      <p
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "10px",
        }}
      >
        <Image
          src="../icon/extraction/exclamation.svg"
          width="20"
          height="20"
          style={{ marginRight: "10px" }}
        />
        <a href={link} target="_blank" rel="noopener noreferrer">
          {name}
        </a>
      </p>
    </>
  );
};

export default DocLink;
