import React, { useState, useEffect, useCallback, useRef } from "react";
import Button from "react-bootstrap/Button";
import { axiosPostJson } from "../../../utilities/requests";

const ViewButton = ({ id, data, type }) => {
  // Function to send a POST request to /extraction/view
  const viewImage = () => {
    console.log("Viewing image for node " + id);

    // Construction of form data to send to /extraction/view. If the node is input, the name of the file is needed
    let form_data;
    if (type === "input") {
      form_data = JSON.stringify({
        id: id,
        name: type,
        file_loaded: data.internal.settings.filename,
      });
    } else {
      form_data = JSON.stringify({
        id: id,
        name: type,
      });
    }

    // POST request to /extraction/view for current node by sending form_data
    axiosPostJson(form_data, "extraction/view")
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.warn("Could not open view.");
      });
  };

  return (
    <div className="test">
      <Button
        type="button"
        className="viewButton"
        onClick={viewImage}
        disabled={!data.internal.enableView}
      >
        <img
          src="../icon/extraction/eye.svg"
          className="viewImage"
          alt="View button"
        />
        View image
      </Button>
    </div>
  );
};

export default ViewButton;
