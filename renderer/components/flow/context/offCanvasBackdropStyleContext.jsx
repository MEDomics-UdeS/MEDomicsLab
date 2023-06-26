import React, { createContext, useState } from "react";

const OffCanvasBackdropStyleContext = createContext();

function OffCanvasBackdropStyleProvider({ children }) {
	const [backdropStyle, setBackdropStyle] = useState({}); // Initial style

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