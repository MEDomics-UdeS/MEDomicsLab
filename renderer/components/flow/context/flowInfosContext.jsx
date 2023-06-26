
import React, { createContext, useState } from "react";

const FlowInfosContext = createContext();

function FlowInfosProvider({ children }) {
	const [flowInfos, setFlowInfos] = useState({}); // Initial style

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