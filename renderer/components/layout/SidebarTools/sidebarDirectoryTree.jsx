import React from "react";
import { Accordion, Stack, InputGroup } from 'react-bootstrap';
import { ChevronRight, File, FileEarmark, Folder, Lamp, LightningFill, PlusSquare, PlusSquareFill, XSquare } from 'react-bootstrap-icons';
import {randomUUID} from 'crypto';
import { LayoutModelContext } from "../LayoutContext";
import { SidebarFolder, SidebarFile } from "./components";

/**
 * @description - This component is the sidebar tools component that will be used in the sidebar component 
 * @param {Object} props - Props passed from parent component  
 * @returns a sidebar item component that can be a file or a folder and that is rendered recursively
 */


const SidebarDirectoryTree = (props) => { // This component is used to render a directory tree in the sidebar
    console.log('PROPS', props);
    return (
        <>
            <Accordion defaultActiveKey={props.name}  >
                <Accordion.Item eventKey={props.name}>
                    <Accordion.Header>
                        <Stack direction="horizontal" gap={1} style={{ padding: '0 0 0 0', alignContent: 'center' }}>
                            <Folder style={{marginLeft:'0.2rem'}} />{props.name}
                        </Stack>
                    </Accordion.Header>
                    <Accordion.Body className="sidebar-acc-body">
                        <Stack className='sidebar-folder-stack' direction="vertical" gap={0}>
                            {props['children'].map((child, index) => {
                                if (child['children'] !== undefined) {
                                    return (

                                        <SidebarFolder name={child.name} children={child.children} />
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
        </>
    );
};




export { SidebarDirectoryTree };


