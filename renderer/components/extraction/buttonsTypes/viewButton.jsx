import React, { useState, useEffect, useCallback, useRef } from "react";
import Button from "react-bootstrap/Button";

const ViewButton = ({ id, data, type }) => {
  //  Hook for disabling the button
  const [isDisabled, setIsDisabled] = useState(true);

  // Update the disabled state whenever the data.internal.enableView changes
  useEffect(() => {
    setIsDisabled(data.internal.enableView == false);
  }, [data.internal.enableView]);

  // Function to send a POST request to /extraction/view
  const viewImage = () => {
    console.log("Viewing image for node " + id);

    // Construction of form data to send to /extraction/view. If the node is input, the name of the file is needed
    let form_data;
    if (type === "input") {
      form_data = JSON.stringify({
        id: id,
        name: type,
        file_loaded: data.filepath,
      });
    } else {
      form_data = JSON.stringify({
        id: id,
        name: type,
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
    <div className="test">
      <Button
        type="button"
        className="viewButton"
        onClick={viewImage}
        disabled={isDisabled}
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
