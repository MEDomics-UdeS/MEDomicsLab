import React, { useContext, useEffect, useState } from "react";
import { SidebarFolder } from "./components";
import { WorkspaceContext } from "../../workspace/WorkspaceContext";
import { deepCopy } from "../../../utilities/staticFunctions";
import { ArrowClockwise } from "react-bootstrap-icons";
import { ipcRenderer } from "electron";

/**
 * @description This is an element that is displayed after the header of the workspace directory tree
 * @summary It contains a refresh button that will refresh the workspace directory tree
 * @returns HTML element
 */
const AfterHeader = () => {
	function handleRefreshClick(event) {
		event.stopPropagation();
		ipcRenderer.send("messageFromNext", "updateWorkingDirectory")
	}   
    
	return (<><div className='d-flex' style={{ flexGrow: "1" }} /><a type="button" className="buttonNoStyle" onClick={handleRefreshClick} style={{ display: "inline-block", marginInlineEnd: "1rem" }}><ArrowClockwise id={"test"} size={"1.2rem"}/></a></>)
}

/**
 * @description - This component contains the directory tree of the workspace
 * @param {*} props - It contains the props of the component which are the configurations of the component, such as which folders and files to display
 * @returns {JSX.Element} - This component contains the directory tree of the workspace
 */
const WorkspaceDirectoryTree = (props) => {
	const { workspace } = useContext(WorkspaceContext); // We get the workspace from the context to retrieve the directory tree of the workspace, thus retrieving the data files
	const [workspaceTree, setWorkspaceTree] = useState({ ...workspace });// We set the workspace tree to an empty object, this will be used to store the workspace tree
	
	let afterHeader = <AfterHeader/>;

	useEffect(() => {
		let newWorkspaceTree = deepCopy(workspace);
		if (Object.keys(props).length == 0) {
			setWorkspaceTree({ ...workspace });
		}
		else {
			if (props.keepOnlyFolder != undefined) {
				// Filter out everything that is not in props.keepOnlyFolder folder 
				newWorkspaceTree.workingDirectory.children = newWorkspaceTree.workingDirectory.children.filter((child) => {
					return props.keepOnlyFolder.includes(child.name);
				});
				setWorkspaceTree(newWorkspaceTree);
			}
		}
		
	}, [workspace]); // We log the workspace when it changes
    

	if (props.all == true) { // If the all prop is set to true, we display the whole workspace directory tree
		return (
			<>
				{workspaceTree.workingDirectory["name"] && SidebarFolder({ afterHeader: afterHeader , name: workspaceTree.workingDirectory["name"], children: workspaceTree.workingDirectory["children"]})}
			</>
		);
	}
    

	return ( // Otherwise we display only the data folder and the data files
		<>
			{workspaceTree.workingDirectory["name"] && SidebarFolder({ afterHeader: afterHeader, name: workspaceTree.workingDirectory["name"], children: workspaceTree.workingDirectory["children"]})}
		</>
	);
};

export { WorkspaceDirectoryTree, AfterHeader};