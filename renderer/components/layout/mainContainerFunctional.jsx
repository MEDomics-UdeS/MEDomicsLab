import React, { useRef, useState, useEffect, useContext} from 'react';
import test from '../../styles/test.module.css';
import Home from '../mainPages/home';
import StorageManager from "../../utilities/storageManager";
import { downloadFile } from '../../utilities/requests';
import * as Prism from "prismjs";
import { NewFeatures } from "./flexlayoutComponents/NewFeatures";
import { showPopup } from "./flexlayoutComponents/PopupMenu";
import { TabStorage } from "./flexlayoutComponents/TabStorage";
import { LayoutModelContext } from './LayoutContext';
import {
	Action,
	Actions,
	BorderNode,
	CLASSES,
	DockLocation,
	DragDrop,
	DropInfo,
	IJsonTabNode,
	ILayoutProps,
	ITabRenderValues,
	ITabSetRenderValues,
	Layout,
	Model,
	Node,
	TabNode,
	TabSetNode
} from 'flexlayout-react';


var fields = ["Name", "Field1", "Field2", "Field3", "Field4", "Field5"];

const ContextExample = React.createContext('');

function useForceUpdate() {
	const [value, setValue] = useState(0); // integer state
	return () => setValue(value => value + 1); // update state to force render
	// A function that increment the previous state like here 
	// is better than directly setting `setValue(value + 1)`
}


/**
 * 
 * @param {Object} props - Set of parameters passed by the parent component 
 * @returns A JSX element that is the main container for the application - See the flexlayout-react documentation for more information
 * @description - This component is the main container for the application. Each page will be a tab in this container. It is a functional component.
 * @warning - You should not be playing around with this component unless you know what you are doing.
 */
export default function MainFlexLayout(props) {
	// let inner_model = layoutmodel;
	const layoutRef = useRef(null); // Reference to the layout component
	const storageManager = new StorageManager(); // Storage manager to save and load layouts - For future use, for now we are using local storage
	const [mainState, setMainState] = useState({}); // State to keep track of the main state of the application/this component
	const [nextGridIndex, setNextGridIndex] = useState(0); // State to keep track of the next grid index
	// let contents; // Variable to hold the contents of the main container - Not used for now
	
	const { layoutModel, flexlayoutInterpreter } = useContext(LayoutModelContext); // Get the layout model and the flexlayout interpreter from the context

	
	const [myInnerModel, setMyInnerModel] = useState(layoutModel); // State to keep track of the inner model - Used to update the layout model - for debugging purposes mainly
	// setMyInnerModel(inner_model);
	
	
	const [model, setModel] = useState(Model.fromJson(layoutModel)); // State to keep track of the model - Used to update the layout model also

	useEffect(() => { // Use effect to update the model when the layout model changes
		if (myInnerModel !== layoutModel) { // If the inner model is not the same as the layout model, update the inner model
			setMyInnerModel(layoutModel);
		}
		console.log("MainFlexLayout useEffect", layoutModel);
		setMyInnerModel(layoutModel);
		setModel(Model.fromJson(layoutModel));
	}, [layoutModel]); // Update the model when the layout model changes


	// console.log("Inner model", inner_model);

	const [activeSidebarItem, setActiveSidebarItem] = useState('home'); // State to keep track of active nav item
	const handleSidebarItemSelect = (selectedItem) => {
		setActiveSidebarItem(selectedItem); // Update activeNavItem state with selected item

	};

	function handleNextGridIndex() { // Function to handle the next grid index
		setNextGridIndex(nextGridIndex + 1);
		return nextGridIndex - 1;
	}

	var last_state = <Home />; // Variable to hold the last state of the application - Not used for now


	let loadingLayoutName = null; 
	let htmlTimer = null;
	let showingPopupMenu = false;



	function onModelChange(event) { // Function to handle model changes that uses a timer to update the model
		if (htmlTimer) { 
			clearTimeout(htmlTimer);
		}
		// console.log("onModelChange", event);
		htmlTimer = setTimeout(() => {
			const jsonText = JSON.stringify(model && model.toJson(), null, "\t");
			const html = Prism.highlight(jsonText, Prism.languages.javascript, 'javascript');
			setMainState({ ...mainState, json: html });
			htmlTimer = null;
		}, 500);
	};

	function save() { // Function to save the layout in the local storage
		var jsonStr = JSON.stringify(model && model.toJson(), null, "\t");
		localStorage.setItem(mainState.layoutFile || '', jsonStr || '');
	}

	function loadLayout(layoutName, reload) { // Function to load the layout from the local storage or from the layouts folder
		if (mainState.layoutFile !== null) {
			save();
		}

		loadingLayoutName = layoutName;
		let loaded = false;
		if (!reload) {
			var json = localStorage.getItem(layoutName);
			if (json != null) {
				load(json);
				loaded = true;
			}
		}

		if (!loaded) {
			downloadFile("layouts/" + layoutName + ".layout", load, error);
		}
	}

	function load(jsonText) { // Function to load the layout from the JSON passed as a parameter
		let json = JSON.parse(jsonText);
		let model = Model.fromJson(json);
		const html = Prism.highlight(jsonText, Prism.languages.javascript, 'javascript');
		setMainState({ ...mainState, mainState: loadingLayoutName ? loadingLayoutName : null, model: model, json: html });
	}

	function allowDrop(dragNode, dropInfo) { // Function to allow dropping of tabs in the layout - Not used for now
		let dropNode = dropInfo.node;

		// prevent non-border tabs dropping into borders
		if (dropNode.getType() === "border" && (dragNode.getParent() == null || dragNode.getParent().getType() != "border"))
			return false;

		// prevent border tabs dropping into main layout
		if (dropNode.getType() !== "border" && (dragNode.getParent() != null && dragNode.getParent().getType() == "border"))
			return false;

		return true;
	}

	function error(reason) { // Function to handle errors when loading the layout
		alert("Error loading json config file: " + this.loadingLayoutName + "\n" + reason);
	}

	function onAddDragMouseDown(event) { // Function to handle the mouse down event when dragging a tab to add a new tab
		event.stopPropagation();
		event.preventDefault();
		(layoutRef.current).addTabWithDragAndDrop(undefined, {
			component: "grid",
			icon: "images/article.svg",
			name: "Grid " + handleNextGridIndex()
		}, onAdded);
		// this.setState({ adding: true });
	}

	function onAddActiveClick(event) { // Function to handle the click event when adding a new tab and adding it to the active tab set - Not used for now
		(layoutRef.current).addTabToActiveTabSet({
			component: "grid",
			icon: "images/article.svg",
			name: "Grid " + handleNextGridIndex()
		});
	}

	function onAddActiveClickFromJson(event, json) { // Function to handle the click event when adding a new tab and adding it to the active tab set from a JSON passed as a parameter - Not used for now
		(layoutRef.current).addTabToActiveTabSet({ json });
	}

	function onAddFromTabSetButton(node) { // Function to handle the click event when adding a new tab and adding it to the tab set 
		(layoutRef.current).addTabToTabSet(node.getId(), {
			component: "grid",
			name: "Grid " + handleNextGridIndex()
		});
	}

	function onAddIndirectClick(event) { // Function to handle the click event when adding a new tab and adding it to the tab set - Not used for now
		if (this.layoutRef) {
			this.layoutRef.current.addTabWithDragAndDropIndirect("Add grid\n(Drag to location)", {
				component: "grid",
				name: "Grid " + handleNextGridIndex()
			}, this.onAdded);
			this.setState({ adding: true });
		}
	}

	function onRealtimeResize(event) { // Function to handle the realtime resize event of the tabs - Not used for now
		setMainState({
			...mainState,
			realtimeResize: event.target.checked
		});
	}

	function onRenderDragRect(content, node, json) { // Function to handle the rendering of the drag rectangle 
		if (mainState.layoutFile === "newfeatures") {
			return (<>
				{content}
				<div style={{ whiteSpace: "pre" }}>
					<br />
					This is a customized<br />
					drag rectangle
				</div>
			</>
			);
		} else {
			return undefined; // use default rendering
		}
	}

	function onContextMenu(node, event) { // Function to handle the context menu event of the tabs 
		if (!showingPopupMenu) {
			event.preventDefault();
			event.stopPropagation();
			console.log(node, event);
			showPopup(
				node instanceof TabNode ? "Tab: " + node.getName() : "Type: " + node.getType(),
				layoutRef && layoutRef.current && layoutRef.current.getRootDiv(),
				event.clientX, event.clientY,
				["Option 1", "Option 2"],
				(item) => {
					console.log("selected: " + item);
					showingPopupMenu = false;
				});
			showingPopupMenu = true;
		}
	}


	function onAuxMouseClick(node, event) {
		console.log(node, event);
	}

	function onRenderFloatingTabPlaceholder(dockPopout, showPopout) { // Function to handle the rendering of the floating tab placeholder
		return (
			<div className={CLASSES.FLEXLAYOUT__TAB_FLOATING_INNER}>
				<div>Custom renderer for floating tab placeholder</div>
				<div>
					<a href="#" onClick={showPopout}>
						{"show the tab"}
					</a>
				</div>
				<div>
					<a href="#" onClick={dockPopout}>
						{"dock the tab"}
					</a>
				</div>
			</div>
		);
	}

	function onExternalDrag(e) { // Function to handle the external drag event of the tabs 
		const validTypes = ["text/uri-list", "text/html", "text/plain"];
		if (e.dataTransfer.types.find(t => validTypes.indexOf(t) !== -1) === undefined) return;
		e.dataTransfer.dropEffect = "link";
		return {
			dragText: "Drag To New Tab",
			json: {
				type: "tab",
				component: "multitype"
			},
			onDrop: (node, event) => {
				if (!node || !event) return;  // aborted drag

				if (node instanceof TabNode && event instanceof DragEvent) {
					const dragEvent = event;
					if (dragEvent.dataTransfer) {
						if (dragEvent.dataTransfer.types.indexOf("text/uri-list") !== -1) {
							const data = dragEvent.dataTransfer && dragEvent.dataTransfer.getData("text/uri-list");
							if (model) {
								model.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Url", config: { data, type: "url" } }));
							}
						}
						else if (dragEvent.dataTransfer.types.indexOf("text/html") !== -1) {
							const data = dragEvent.dataTransfer && dragEvent.dataTransfer.getData("text/html");
							if (model) {
								model.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Html", config: { data, type: "html" } }));
							}
						}
						else if (dragEvent.dataTransfer.types.indexOf("text/plain") !== -1) {
							const data = dragEvent.dataTransfer && dragEvent.dataTransfer.getData("text/plain");
							model && model.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Text", config: { data, type: "text" } }));
						}
					}
				}
			}
		}
	};

	function onTabDrag(dragging, over, x, y, location, refresh) {
		const tabStorageImpl = over.getExtraData()['tabStorage_onTabDrag'];
		if (tabStorageImpl) {
			return tabStorageImpl(dragging, over, x, y, location, refresh)
		}
		return undefined
	};

	function onShowLayoutClick(event) {
		console.log(JSON.stringify(model.toJson(), null, "\t"));
	}

	function onAdded() {
		setMainState({ ...mainState, adding: false });
	}

	function onTableClick(node, event) {
	}

	function onAction(action) {
		console.log("action: ", action);
		flexlayoutInterpreter(action, model);
		return action;
	};

	function titleFactory(node) {
		if (node.getId() === "custom-tab") {
			return {
				titleContent: <div>(Added by titleFactory) {node.getName()}</div>,
				name: "the name for custom tab"
			};
		}
		return;
	}

	function iconFactory(node) {
		if (node.getId() === "custom-tab") {
			return <><span style={{ marginRight: 3 }}>:)</span></>
		}
		return;
	}

	function onSelectLayout(event) {
		var target = event.target;
		loadLayout(target.value);
	}

	function onReloadFromFile(event) {
		if (mainState.layoutFile) {
			loadLayout(mainState.layoutFile, true);
		}
	}

	function onThemeChange(event) {
		var target = event.currentTarget;
		let flexlayout_stylesheet = window.document.getElementById("flexlayout-stylesheet");
		let index = flexlayout_stylesheet.href.lastIndexOf("/");
		let newAddress = flexlayout_stylesheet.href.substr(0, index);
		flexlayout_stylesheet.setAttribute("href", newAddress + "/" + target.value + ".css");
		let page_stylesheet = window.document.getElementById("page-stylesheet");
		if (page_stylesheet) {
			page_stylesheet.setAttribute("href", target.value + ".css");
		}
		useForceUpdate();
	}

	function onSizeChange(event) {
		var target = event.target;
		setMainState({ ...mainState, fontSize: target.value });
	}

	function onRenderTab(node, renderValues) {
		// renderValues.content = (<InnerComponent/>);
		// renderValues.content += " *";
		// renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
		// renderValues.name = "tab " + node.getId(); // name used in overflow menu
		// renderValues.buttons.push(<img style={{width:"1em", height:"1em"}} src="images/folder.svg"/>);
	}

	function onRenderTabSet(node, renderValues) {
		if (mainState.layoutFile === "default") {
			renderValues.stickyButtons.push(
				<img
					src="images/add.svg"
					alt="Add"
					key="Add button"
					title="Add Tab (using onRenderTabSet callback, see Demo)"
					style={{ width: "1.1em", height: "1.1em" }}
					className="flexlayout__tab_toolbar_button"
					onClick={() => onAddFromTabSetButton(node)}
				/>
			);
		}
	};

	function onTabSetPlaceHolder(node) {
		return <div>Drag tabs to this area</div>;
	}

	// Utils functions ****************************************************
	function makeFakeData() {
		var data = [];
		var r = Math.random() * 50;
		for (var i = 0; i < r; i++) {
			var rec = {};
			rec.Name = randomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
			for (var j = 1; j < fields.length; j++) {
				rec[fields[j]] = (1.5 + Math.random() * 2).toFixed(2);
			}
			data.push(rec);
		}
		return data;
	}

	function randomString(len, chars) {
		var a = [];
		for (var i = 0; i < len; i++) {
			a.push(chars[Math.floor(Math.random() * chars.length)]);
		}

		return a.join("");
	}
	// ****************************************************


	function factory(node) {


		var component = node.getComponent();

		if (component === "json") {
			return (
				<pre style={{ tabSize: "20px" }}>
					{mainState.json ? (
						<span dangerouslySetInnerHTML={{ __html: mainState.json }} />
					) : null}
				</pre>
			);
		}
		else if (component === "grid") {
			if (node.getExtraData().data == null) {
				// create data in node extra data first time accessed
				node.getExtraData().data = makeFakeData();
			}

			return <SimpleTable fields={fields} onClick={onTableClick.bind(node)} data={node.getExtraData().data} />;
		}
		else if (component === "text") {
			try {
				return <div dangerouslySetInnerHTML={{ __html: node.getConfig().text }} />;
			} catch (e) {
				console.log(e);
			}
		}
		else if (component === "newfeatures") {
			return <NewFeatures />;
		}
		else if (component === "multitype") {
			try {
				const config = node.getConfig();
				if (config.type === "url") {
					return <iframe title={node.getId()} src={config.data} style={{ display: "block", border: "none", boxSizing: "border-box" }} width="100%" height="100%" />;
				} else if (config.type === "html") {
					return (<div dangerouslySetInnerHTML={{ __html: config.data }} />);
				} else if (config.type === "text") {
					return (
						<textarea style={{ position: "absolute", width: "100%", height: "100%", resize: "none", boxSizing: "border-box", border: "none" }}
							defaultValue={config.data}
						/>);
				}
			} catch (e) {
				return (<div>{String(e)}</div>);
			}
		}
		else if (component === "tabstorage") {
			return <TabStorage tab={node} layout={layoutRef && layoutRef.current} />;
		}

		return null;
	};

	return (
		<>
			<div style={{ position: 'relative', width: '100%', height: '100%' }}>
				<div className={test.Container}>
					<Layout
						ref={layoutRef}
						model={model}
						factory={factory}
						font={mainState.fontSize}
						onAction={onAction}
						onModelChange={onModelChange}
						titleFactory={titleFactory}
						iconFactory={iconFactory}
						onRenderTab={onRenderTab}
						onRenderTabSet={onRenderTabSet}
						onRenderDragRect={onRenderDragRect}
						onRenderFloatingTabPlaceholder={mainState.layoutFile === "newfeatures" ? onRenderFloatingTabPlaceholder : undefined}
						onExternalDrag={onExternalDrag}
						realtimeResize={mainState.realtimeResize}
						onTabDrag={mainState.layoutFile === "newfeatures" ? onTabDrag : undefined}
						onContextMenu={mainState.layoutFile === "newfeatures" ? onContextMenu : undefined}
						onAuxMouseClick={mainState.layoutFile === "newfeatures" ? onAuxMouseClick : undefined}
						onTabSetPlaceHolder={onTabSetPlaceHolder}
					/>
				</div>
			</div>
		</>
	);
}




class SimpleTable extends React.Component {

	shouldComponentUpdate() {
		return true;
	}

	render() {
		// if (Math.random()>0.8) throw Error("oppps I crashed");
		var headercells = this.props.fields.map(function (field) {
			return <th key={field}>{field}</th>;
		});

		var rows = [];
		for (var i = 0; i < this.props.data.length; i++) {
			var row = this.props.fields.map((field) => <td key={field}>{this.props.data[i][field]}</td>);
			rows.push(<tr key={i}>{row}</tr>);
		}

		return <table className="simple_table" onClick={this.props.onClick}>
			<tbody>
				<tr>{headercells}</tr>
				{rows}
			</tbody>
		</table>;
	}
}


