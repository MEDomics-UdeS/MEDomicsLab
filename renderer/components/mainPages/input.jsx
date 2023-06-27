import React from 'react';
import DropzoneComponent from './dataComponents/dropzoneComponent';
import Datatable from './dataComponents/datatable';
const InputPage = () => {


	return (
		<>
			<h1>INPUT MODULE</h1>
			<DropzoneComponent />
			<div style={{ display:'flex', overflow:'scroll'}}>
			<Datatable />
			</div>
		</>
	);
};


export default InputPage;