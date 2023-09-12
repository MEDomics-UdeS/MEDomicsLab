import React, { useEffect, useState, useContext, use } from "react"
import { Accordion, Stack } from "react-bootstrap"
import { FileEarmark, Folder, PlusSquare, XSquare } from "react-bootstrap-icons"
import { randomUUID } from "crypto"
import { LayoutModelContext } from "../LayoutContext"
import { DataContext } from "../../workspace/dataContext"
import MedDataObject from "../../workspace/medDataObject"
import EditableLabel from "react-simple-editlabel"
/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component
 * @param {Object} props - Props passed from parent component
 * @returns a sidebar item component that can be a file or a folder and that is rendered recursively
 */
const SidebarItem = (props) => {
	function renderChildren(parent) {
		// This function is used to render the children of the parent component recursively
		console.log(parent.name)
		if (parent.children !== undefined) {
			// If the parent has children, then we render the children, otherwise we render the file
			return (
				<>
					<Accordion defaultActiveKey={parent.name}>
						<Accordion.Item eventKey={parent.name}>
							<Accordion.Header>{parent.name}</Accordion.Header>
							<Accordion.Body>
								<Stack direction="vertical" gap={0}>
									{parent.children.map((child) => {
										renderChildren(child)
										console.log(child)
									})}
								</Stack>
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
				</>
			)
		} else {
			return <SidebarFile name={parent.name} />
		}
	}

	return <>{renderChildren(props)}</>
}

const SidebarFolder = (props) => {

	// const { globalData } = useContext(DataContext)

	// console.log("GlobalData", props.globalData)



	return (
		<Accordion defaultActiveKey={props.name}>
			<Accordion.Item eventKey={props.name}>
				<Accordion.Header>
					<Stack
						className="sidebar-file-stack"
						direction="horizontal"
						gap={1}
						style={{ padding: "0 0 0 0", alignContent: "center" }}
					>
						<Folder size={"1rem"} style={{ marginLeft: "0.2rem" }} />
						{props.name}
						{props.afterHeader}
					</Stack>
				</Accordion.Header>
				<Accordion.Body className="sidebar-acc-body">
					<Stack className="sidebar-folder-stack" direction="vertical" gap={0}>
						{props.children.map((child) => {
							console.log("child", child)
							if (child.children !== undefined) {
								return (
									<SidebarFolder name={child.name} key={randomUUID()}>
										{child.children}
									</SidebarFolder>
								)
							} else {
								let UUID = ""
								try {
									UUID = child.metadata.UUID
									console.log("UUID", UUID)
								} catch (error) {
									UUID = randomUUID()
									// console.log("globalData", props)
								}
								return <SidebarFile name={child.name} key={UUID} />
							}
						})}
					</Stack>
				</Accordion.Body>
			</Accordion.Item>
		</Accordion>
	)
}


const SidebarFile = (props) => {

	const [isRenaming, setIsRenaming] = useState(false);
	const [newName, setNewName] = useState(props.name);

	const [showContextMenu, setShowContextMenu] = useState(false)
	const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })

	const { dispatchLayout } = useContext(LayoutModelContext);
	const { globalData, setGlobalData } = useContext(DataContext)

	const handleRename = () => {
		setIsRenaming(true);
	};

	const handleRenameCancel = () => {
		setIsRenaming(false);
		// setNewName(props.name);
	};

	function handleNameChange(event) {
		console.log("event", event)
		console.log("props", props)
		console.log("globalData", globalData)
		console.log("props.name", props.name)
		let uuid = MedDataObject.checkIfMedDataObjectInContextbyName(props.name, globalData)
		console.log("uuid", uuid)
		let dataObject = globalData[uuid]

		let renamedDataObject = MedDataObject.rename(dataObject, event, globalData)
		let globalDataCopy = { ...globalData }
		globalDataCopy[uuid] = renamedDataObject
		setGlobalData(globalDataCopy)

		// MedDataObject.updateDataObjectInContext(renamedDataObject, globalData, setGlobalData)
		// setNewName(event.target.innerText);
	}



	function OnClickAdd(e, name) { dispatchLayout({ type: "add", payload: { type: "tab", name: name, component: "grid" } }); } // This function is used to handle the click on the add button
	function OnClickDelete(e, name) { dispatchLayout({ type: "remove", payload: { type: "tab", name: name, component: "grid" } }); } // This function is used to handle the click on the delete button
	function onOpen(name) {
		let dataObjectUUID = MedDataObject.checkIfMedDataObjectInContextbyName(name, globalData)
		console.log("dataObjectUUID", dataObjectUUID)
		let path = globalData[dataObjectUUID].path
		dispatchLayout({ type: "add", payload: { type: "tab", name: name, component: "dataTable", config: { "path": path } } })
	}

	function onRename(name) {

	}




	function handleClick(event, name) {
		console.log(`Clicked on file ${name}`)
	}

	function handleContextMenu(event, name) {
		// console.log(`Context - Right clicked on file ${name}`)
		event.preventDefault()
		setShowContextMenu(true)
		setContextMenuPosition({ x: event.clientX, y: event.clientY })
	}

	function handleContextMenuAction(action, name) {
		console.log(`Clicked on action ${action} of the file ${name}`)
		switch (action) {
			case "Open":
				onOpen(name)
				break
			case "Rename":
				handleRename()
				// onRename(name)
				break
			case "Delete":
				break
			default:
				break
		}
		setShowContextMenu(false)
	}

	function handleFocusOut(event) {
		// console.log(`Focus Out`, event)
		setShowContextMenu(false)
	}

	function handleKeyDown(event) {
		if (event.key === "Escape") {
			setShowContextMenu(false)
			handleRenameCancel();
		}
	}

	function handleClickOutside(event) {
		if (showContextMenu && !event.target.closest(".context-menu-overlay")) {
			setShowContextMenu(false)
		}
	}

	function handleContextMenuOutside(event) {
		if (props.name !== event.target.innerText) {
			setShowContextMenu(false)
		}
	}

	// useEffect(() => {
	// 	window.addEventListener("keydown", handleKeyDown)
	// 	return () => {
	// 		window.removeEventListener("keydown", handleKeyDown)
	// 	}
	// }, [isRenaming])


	useEffect(() => {
		window.addEventListener("click", handleClickOutside)
		window.addEventListener("keydown", handleKeyDown)
		window.addEventListener("focusout", handleFocusOut)
		window.addEventListener("contextmenu", handleContextMenuOutside)

		return () => {
			window.removeEventListener("click", handleClickOutside)
			window.removeEventListener("keydown", handleKeyDown)
			window.removeEventListener("focusout", handleFocusOut)
			window.removeEventListener("contextmenu", handleContextMenuOutside)
		}
	}, [showContextMenu])

	let plusIcon = (
		<button
			className="sidebar-file-button"
			onClick={(e) => OnClickAdd(e, props.name)}
		>
			<PlusSquare />
		</button>
	)
	let deleteIcon = (
		<button
			className="sidebar-file-button"
			onClick={(e) => OnClickDelete(e, props.name)}
		>
			<XSquare />
		</button>
	)
	let before = <></>
	let after = <></>

	return (
		<>
			<Stack
				className="sidebar-file-main-button"
				onClick={(e) => handleClick(e, props.name)}
				onContextMenu={(e) => handleContextMenu(e, props.name)}
				direction="horizontal"
				gap={1}
				style={{ padding: "0 0 0 0", alignContent: "center" }}
			>
				<FileEarmark style={{ marginLeft: "0.2rem" }} />

				{before}
				<EditableLabel
					className="sidebar-file-editable-label"
					labelClassName="file-editable-label"
					inputClassName="file-editable-input"
					text={newName}
					isEditing={isRenaming}
					inputWidth="20ch"
					inputHeight="25px"
					labelFontWeight="bold"
					inputFontWeight="bold"
					// raiseOnFocusOutOnEsc={true}
					onFocusOut={(e) => handleNameChange(e, props._UUID)}
					onFocus={handleRename}
				/>
				{after}

				<div style={{ flexGrow: "5" }} />
				{props.add ? plusIcon : <></>}
				{props.delete ? deleteIcon : <></>}
				{/* Here above we render the add and delete icons if the props are set to true */}
			</Stack>

			{showContextMenu && (
				<div
					className="context-menu-overlay"
					style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
				>
					<ul className="context-menu">
						<li onClick={(e) => handleContextMenuAction("Open", props.name)}>Open</li>
						<li onClick={(e) => handleContextMenuAction("Rename", props.name)}>Rename</li>
						<li onClick={(e) => handleContextMenuAction("Delete", props.name)}>Delete</li>
					</ul>
				</div>
			)}
		</>
	)
}



export { SidebarFile, SidebarFolder, SidebarItem }
