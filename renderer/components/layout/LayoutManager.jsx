import React, { useState } from "react";

import test from '../../styles/test.module.css';
import ResizablePanel, { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import resizable from '../../styles/resizable.module.css';
import IconSidebar from '../layout/IconSidebar';
import WorkspaceSidebar from '../layout/WorkspaceSidebar';
import Home from '../mainPages/home';
import Input from '../mainPages/input';
import Learning from '../mainPages/learning';
import ExtractionPage from "../mainPages/extraction";
import DiscoveryPage from "../mainPages/discovery";
import ResultsPage from "../mainPages/results";
import ApplicationPage from "../mainPages/application";
import HomeSidebar from "./SidebarTools/homeSidebar";
import ExplorerSidebar from "./SidebarTools/explorerSidebar";
import SearchSidebar from "./SidebarTools/searchSidebar";
import LayoutTestPage from "../mainPages/layoutTest";
import LayoutTestSidebar from "./SidebarTools/layoutTestSidebar";
import MainFlexLayout from "./mainContainerFunctional";


const LayoutManager = (props) => {
	const [activeSidebarItem, setActiveSidebarItem] = useState('home'); // State to keep track of active nav item
	const [activeState, setActiveState] = useState('home'); // State to keep track of active nav item
	
	const handleSidebarItemSelect = (selectedItem) => {
		setActiveSidebarItem(selectedItem); // Update activeNavItem state with selected item
		
	};
	

	// Render content component based on activeNavItem state
	const renderContentComponent = ({props}) => {
		
		switch (activeSidebarItem) {
			case 'home':
				return <Home />;
			case 'input':
				return <Input />;
			case 'learning':
				return <Learning pageId='123'/>;
			case 'extraction':
				return <ExtractionPage pageId='1234'/>;
			case 'discovery':
				return <DiscoveryPage />;
			case 'results':
				return <ResultsPage />;
			case 'application':
				return <ApplicationPage />;
			case 'layoutTest':
				return <MainFlexLayout layoutmodel={props.layout} />;
			default:
				
				
		}
	};

	const renderSidebarComponent = () => {
		switch (activeSidebarItem) {
			case 'home':
				return <HomeSidebar />;
			case 'explorer':
				return <ExplorerSidebar />;
			case 'search':
				return <SearchSidebar />;
			case 'layoutTest':
				return <LayoutTestSidebar />;
			default:
				return <h5 style={{color:'#d3d3d3', marginLeft:'0.5rem'}}>{activeSidebarItem}</h5>;
		}
	};




	return (
		<>
			<div className="row" style={{ height: '100%' }}>
				<IconSidebar onSidebarItemSelect={handleSidebarItemSelect} activeSidebarItem={activeSidebarItem} />
				<div className='col' style={{ height: '100%', width: '98%', padding: '0px' }}>
					<PanelGroup autoSaveId="test" direction="horizontal">
						<Panel
							className={resizable.Panel}
							collapsible={true}
							defaultSize={20}
							order={1}
						>
							<div className={resizable.PanelContent} style={{ backgroundColor: 'rgb(0 0 0 / 80%)' }}>
								{renderSidebarComponent()}
							</div>
						</Panel>
						<PanelResizeHandle className={resizable.ResizeHandleOuter}>
							<div className={resizable.ResizeHandleInner} />
						</PanelResizeHandle> 
						<Panel className={resizable.Panel} collapsible={true} order={2}>
							{renderContentComponent({props})} {/* Render content component based on activeNavItem state */}
						</Panel>
					</PanelGroup>
				</div>
			</div>
		</>
	);
}


export default LayoutManager;
