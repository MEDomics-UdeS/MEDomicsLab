import React, { useContext } from "react";
import { Accordion, Button, Stack } from "react-bootstrap";
import { WorkspaceContext } from "../../workspace/WorkspaceContext";
import { ipcRenderer } from "electron";

const ExplorerSidebar = () => {
	// eslint-disable-next-line no-unused-vars
	const { workspace } = useContext(WorkspaceContext); // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files


	/**
	 * @description - This function is called when the user clicks on the change workspace button
	 * @summary - This function sends a message to the main process (Electron) to open a dialog box to change the workspace
	 */
	async function handleWorkspaceChange() { 
		ipcRenderer.send("messageFromNext", "requestDialogFolder");
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
						<Accordion.Header>
							<p style={{marginBottom: "0px", paddingLeft:"1rem"}}>WORKSPACE</p>
						</Accordion.Header>
						<Accordion.Body>
							<Button onClick={handleWorkspaceChange}>Change Workspace</Button>
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</Stack>
		</>
	);
};

export default ExplorerSidebar;