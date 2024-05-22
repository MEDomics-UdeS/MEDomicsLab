import React, { useState } from "react";
import Node from "../../flow/node";
import FlInput from "../paInput";

export default function PaPipelineNode({ id, data }) {
  const [description, setDescription] = useState(data.internal.description || "");

  const handleInputChange = (value) => {
    setDescription(value);
    data.internal.description = value; // Ensure this updates the data object properly
    // If there is a need to propagate this change, you might need an onUpdate function from the parent
    // Example: if (onUpdate) onUpdate(id, data);
  };

  return (
    <Node
      key={id}
      id={id}
      data={data}
      setupParam={data.setupParam}
      nodeBody={<></>}
      defaultSettings={
        <>
          <FlInput
            name="Pipeline description"
            settingInfos={{
              type: "string",
              tooltip: "Specify the description of the evaluation setup"
            }}
            currentValue={description}
            onInputChange={(e) => handleInputChange(e.value)}
            setHasWarning={() => {}}
          />
        </>
      }
      nodeSpecific={<></>}
    />
  );
}
