import React from "react";
import { Accordion, Stack, InputGroup } from 'react-bootstrap';
import { ChevronRight, File, FileEarmark, Folder, Lamp, LightningFill, PlusSquare, PlusSquareFill, XSquare } from 'react-bootstrap-icons';
import {randomUUID} from 'crypto';
import { LayoutModelContext } from "../LayoutContext";


/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component 
 * @param {Object} props - Props passed from parent component  
 * @returns a sidebar item component that can be a file or a folder and that is rendered recursively
 */
const SidebarItem = (props) => { 

    function renderChildren(parent) { // This function is used to render the children of the parent component recursively
        console.log(parent.name);
        if (parent.children !== undefined) { // If the parent has children, then we render the children, otherwise we render the file
            return (
                <>
                    <Accordion defaultActiveKey={parent.name}  >
                        <Accordion.Item eventKey={parent.name}>
                            <Accordion.Header>
                                {parent.name}
                            </Accordion.Header>
                            <Accordion.Body>
                                <Stack direction="vertical" gap={0}>
                                    {parent.children.map((child, index) => {
                                        renderChildren(child);
                                        console.log(child);
                                    })}
                                </Stack>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </>
            );
        }
        else {
            return (
                <SidebarFile name={parent.name} />
            );
        }
    }

    return (
        <>
            {renderChildren(props)} 
        </>
    );
};




const SidebarFolder = (props) => { // This component is used to render a folder in the sidebar 

    return (
        <Accordion defaultActiveKey={props.name}  >
            <Accordion.Item eventKey={props.name}>
                <Accordion.Header>
                    <Stack  direction="horizontal" gap={1} style={{ padding: '0 0 0 0', alignContent: 'center' }}>
                        <Folder style={{marginLeft:'0.2rem'}} />{props.name}
                    </Stack>
                </Accordion.Header>
                <Accordion.Body className="sidebar-acc-body">
                    <Stack className='sidebar-folder-stack' direction="vertical" gap={0}>
                        {props.children.map((child, index) => {
                            if (child.children !== undefined) {
                                return (
                                    <SidebarFolder name={child.name} key={randomUUID()} children={child.children} />
                                );
                            }
                            else {
                                return (
                                    <SidebarFile name={child.name} key={randomUUID()} />
                                );
                            }
                        })}
                    </Stack>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );


};


const SidebarFile = (props) => { // This component is used to render a file in the sidebar
    const { dispatchLayout } = React.useContext(LayoutModelContext); // We use the layout context to dispatch the layout actions

    function handleclick(e, name) { // This function is used to handle the click on the file
        console.log('Clicked', name);
    }
    function OnClickAdd(e, name) {dispatchLayout({type: 'add', payload: { type:"tab", name: name, component: "grid" }});} // This function is used to handle the click on the add button
    function OnClickDelete(e, name) {dispatchLayout({type: 'remove', payload: { type:"tab", name: name, component: 'grid' }});} // This function is used to handle the click on the delete button

    let plus_icon = <button className="sidebar-file-button" onClick={(e) => OnClickAdd(e, props.name)} ><PlusSquare /></button>; // We define the plus icon
    let delete_icon = <button className="sidebar-file-button" onClick={(e) => OnClickDelete(e, props.name)} ><XSquare /></button>; // We define the delete icon
    let before = <></>;
    let after = <></>;

    return (
        <>
            <Stack className="sidebar-file-stack" direction="horizontal" gap={1} style={{ padding: '0 0 0 0', alignContent: 'center' }}>
                        <FileEarmark style={{marginLeft:'0.2rem'}} />
                
                {before}

                <button className='sidebar-file-main-button' onClick={(e) => handleclick(e, props.name)}>{props.name}</button>
                {after}
                <div style={{ flexGrow: '5' }}/>
                {props.add ? plus_icon : <></>}
                {props.delete ? delete_icon : <></>}

            </Stack>
        </>
    );
};

export { SidebarFile, SidebarFolder, SidebarItem };


