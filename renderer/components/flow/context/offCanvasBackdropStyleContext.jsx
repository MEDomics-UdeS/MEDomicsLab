import React, { createContext, useState } from "react";

// This context is used to store the style of the backdrop
const OffCanvasBackdropStyleContext = createContext();

/**
 * 
 * @param {*} children components that will use the context 
 * @description This component is used to provide the backdrop style context to all the components that need it.
 */
function OffCanvasBackdropStyleProvider({ children }) {
	const [backdropStyle, setBackdropStyle] = useState({}); // Initial style

	// This function is used to update the backdrop style
	const updateBackdropStyle = (newStyle) => {
		setBackdropStyle(newStyle);
	};

	return (
		<OffCanvasBackdropStyleContext.Provider value={{ backdropStyle, updateBackdropStyle }}>
			{children}
		</OffCanvasBackdropStyleContext.Provider>
	);
}

export { OffCanvasBackdropStyleContext, OffCanvasBackdropStyleProvider };