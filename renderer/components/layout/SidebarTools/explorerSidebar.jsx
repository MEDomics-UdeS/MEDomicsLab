import React, { useContext } from "react";
import { Accordion, Stack } from "react-bootstrap";
import { WorkspaceContext } from "../../workspace/WorkspaceContext";
import { ipcRenderer } from "electron";

const ExplorerSidebar = () => {
	useContext(WorkspaceContext);



	async function handleWorkspaceChange() {
		// console.log(e);
		ipcRenderer.send("messageFromNext", "requestDialogFolder");
		
		// ipcRenderer.send('messageFromNext', 'requestAppExit');



		// const dirHandle = await window.showDirectoryPicker();
		// console.log(dirHandle);
	}

	return (
		<>
			<Stack direction="vertical" gap={0}>
				<p style={{ color: "#a3a3a3", font: "Arial", fontSize: "12px", padding: "0.75rem 0.25rem 0.75rem 0.75rem", margin: "0 0 0 0" }}>EXPLORER - TO BE IMPLEMENTED</p>
				<Accordion defaultActiveKey={["0"]} alwaysOpen >
					<Accordion.Item eventKey="0">
						<Accordion.Header>
							<Stack direction="horizontal" style={{ flexGrow: "1" }}>
								<p>OPEN EDITORS</p>
								<div style={{ flexGrow: "10" }} />
							</Stack>
						</Accordion.Header>
						<Accordion.Body>

						</Accordion.Body>
					</Accordion.Item>
					<Accordion.Item eventKey="1">
						<Accordion.Header>WORKSPACE</Accordion.Header>
						<Accordion.Body>
							{/* <input onChange={handleFolderInput} directory="" webkitdirectory="" type="file"/> */}
							<button onClick={handleWorkspaceChange}>Change Workspace</button>
							{/* <button  */}
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</Stack>
		</>
	);
};

export default ExplorerSidebar;