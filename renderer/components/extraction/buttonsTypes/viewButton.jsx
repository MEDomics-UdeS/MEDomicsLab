import React, { useState, useEffect, useCallback, useRef } from "react";
import Button from "react-bootstrap/Button";

const ImageViewer = ({ node_id, node_data, node_type }) => {
  const viewImage = () => {
    console.log("Viewing image for node " + node_id);

    // Construction of form data to send to /extraction/view. If the node is input, the name of the file is needed
    let form_data;
    if (node_type === "input") {
      form_data = JSON.stringify({
        id: node_id,
        name: node_type,
        file_loaded: node_data.filepath,
      });
    } else {
      form_data = JSON.stringify({
        id: node_id,
        name: node_type,
      });
    }

    // POST request to /extraction/view for current node by sending form_data
    fetch("/extraction/view", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
      },
      body: form_data,
    })
      .then(function (response) {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
        console.log(error.message);
      }); // TODO: Error message
  };

  return (
    <div>
      <Button
        type="button"
        variant="primary"
        className="viewButton"
        onClick={viewImage}
        disabled
      >
        <img
          src="../icon/extraction/view.png"
          width="20"
          height="20"
          alt="View button"
        />
        View image
      </Button>
    </div>
  );
};

export default ImageViewer;
