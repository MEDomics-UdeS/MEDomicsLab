import React from "react";
import DropzoneComponent from "./dataComponents/dropzoneComponent";
// import Datatable from "./dataComponents/datatable"; // Imports are commented for the moment to avoid errors
// import SheetJSTable from "./dataComponents/sheetjsTest";
import { Button } from "react-bootstrap";

/**
 * @description - This component is the input page of the application
 * @returns the input page component
 */
const InputPage = () => {
	// eslint-disable-next-line no-unused-vars
	const [data, setData] = React.useState([]);
	return (
		<>
			<h1>INPUT MODULE</h1>
			<DropzoneComponent setData={setData}>
				<Button style={{alignItems: "flex-end",  marginInline:"2%"}}/>	
			</DropzoneComponent>
			<div style={{ display:"flex", overflow:"scroll"}}>
				{/* <Datatable /> */} 
				{/* <SheetJSTable /> */}
			</div>
		</>
	);
};


export default InputPage;