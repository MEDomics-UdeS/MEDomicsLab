import React from "react";
import Node from "../../flow/node";

export default function Det3paNode({ id, data }) {
  // context

  return (
    <>
      {/* build on top of the Node component */}
      <Node
        key={id}
        id={id}
        data={data}
        setupParam={data.setupParam}
        // the body of the node is a form select (particular to this node)
        nodeBody={<></>}
        // default settings are the default settings of the node, so mandatory settings
        defaultSettings={
          <>
            <p>A special node that combines the strengths of MED3pa and Detectron</p>
          </>
        }
        // node specific is the body of the node, so optional settings
        nodeSpecific={<></>}
      />
    </>
  );
}
