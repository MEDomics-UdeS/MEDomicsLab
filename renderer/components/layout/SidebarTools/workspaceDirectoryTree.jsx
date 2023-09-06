import React, { useContext, useEffect, useState } from "react";
import { SidebarFolder } from "./components";
import { WorkspaceContext } from "../../workspace/WorkspaceContext";
import { deepCopy } from "../../../utilities/staticFunctions";
import { ArrowClockwise } from "react-bootstrap-icons";
import { ipcRenderer } from "electron";


const AfterHeader = () => {
	function handleRefreshClick(event) {
		event.stopPropagation();
		ipcRenderer.send("messageFromNext", "updateWorkingDirectory")
	}   
    
	return (<><div className='d-flex' style={{ flexGrow: "1" }} /><a type="button" className="buttonNoStyle" onClick={handleRefreshClick} style={{ display: "inline-block", marginInlineEnd: "1rem" }}><ArrowClockwise id={"test"} size={"1.2rem"}/></a></>)
}

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
    

	if (props.all == true) {
		return (
			<>
				{workspaceTree.workingDirectory["name"] && SidebarFolder({ afterHeader: afterHeader , name: workspaceTree.workingDirectory["name"], children: workspaceTree.workingDirectory["children"]})}
			</>
		);
	}
    

	return (
		<>
			{workspaceTree.workingDirectory["name"] && SidebarFolder({ afterHeader: afterHeader, name: workspaceTree.workingDirectory["name"], children: workspaceTree.workingDirectory["children"]})}
		</>
	);
};

export { WorkspaceDirectoryTree, AfterHeader};