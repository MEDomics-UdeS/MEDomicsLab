import React, { createContext, useState } from "react";

// This context is used to store the flowInfos (id and type of the workflow)
const FlowInfosContext = createContext();

/**
 * 
 * @param {*} children components that will use the context 
 * @description This component is used to provide the flowInfos context to all the components that need it.
 */
function FlowInfosProvider({ children }) {
	const [flowInfos, setFlowInfos] = useState({}); // Initial style

	// This function is used to update the flowInfos
	const updateFlowInfos = (newStyle) => {
		setFlowInfos(newStyle);
	};

	return (
		<FlowInfosContext.Provider value={{ flowInfos, updateFlowInfos }}>
			{children}
		</FlowInfosContext.Provider>
	);
}

export { FlowInfosContext, FlowInfosProvider };