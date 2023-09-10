/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from "react";
import { read, utils } from "xlsx";


/**
 * @description - This component is a test component for the sheetjs library
 * @todo - Make it work with the workspace
 */
const SheetJSTable = (datafile) => {
	const [data, setData] = useState({});
	/* Fetch and update the state once */
	useEffect(() => { (async() => {
		/* Download file */
		const f = await (await fetch("https://sheetjs.com/pres.xlsx")).arrayBuffer();
		const wb = read(f); // parse the array buffer
		const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
		const newData = utils.sheet_to_json(ws); // generate objects
		setData(newData); // update state
	})(); }, []);

	let content = null;
	if (data.length > 0) {
		content = (
			<table>
				<thead>
					<tr>
						{Object.keys(data[0]).map((key) => (
							<th key={key}>{key}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((row, i) => (
						<tr key={i}>
							{Object.keys(row).map((key) => (
								<td key={key}>{row[key]}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		);
	}


	useEffect(() => {
		if (data) {
			console.log(data);
		}
	}, [data]);
    

	// eslint-disable-next-line no-unused-vars
	const convertToJson = () => {
		const file = datafile;
		const reader = new FileReader();
		reader.onload = (evt) => {
			const bstr = evt.target.result;
			const wb = read(bstr, { type: "binary" });
			const wsname = wb.SheetNames[0];
			const ws = wb.Sheets[wsname];
			const data = utils.sheet_to_json(ws);
			setData(data);
		};
		reader.readAsBinaryString(file);
	}


	return (
		<>
			{content}
		</>
	);
}

export default SheetJSTable;



