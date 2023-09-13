import React, {  useContext, useEffect } from "react";
import { Button, Stack } from "react-bootstrap";
import {  Plus } from "react-bootstrap-icons";
import DropzoneComponent from "../../mainPages/dataComponents/dropzoneComponent";
import { WorkspaceContext } from "../../workspace/workspaceContext";
import { WorkspaceDirectoryTree } from "./workspaceDirectoryTree";


/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component as the learning page 
 * @summary - It contains the dropzone component and the workspace directory tree filtered to only show the models and experiment folder and the model files
 * @returns {JSX.Element} - This component is the sidebar tools component that will be used in the sidebar component as the learning page 
 */
const LearningSidebar = () => {
	const { workspace } = useContext(WorkspaceContext); // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
	
	useEffect(() => {
		console.log(workspace);
	}, [workspace]); // We log the workspace when it changes


	return (
		<>
			<Stack direction="vertical" gap={0}>
				<p style={{ color: "#a3a3a3", font: "Arial", fontSize: "12px", padding: "0.75rem 0.25rem 0.75rem 0.75rem", margin: "0 0 0 0" }}>Input Module</p>
				<DropzoneComponent >
					<Button style={{alignItems: "flex-end",  marginInline:"2%"}}>
						<Plus size={"2rem"} />
					</Button>
				</DropzoneComponent>
				
				<WorkspaceDirectoryTree keepOnlyFolder={["MODELS"]}>
				</WorkspaceDirectoryTree>
				{/* We render the workspace only if it is set, otherwise it throws an error */}
				
			</Stack>
		</>
	);
};

export default LearningSidebar;