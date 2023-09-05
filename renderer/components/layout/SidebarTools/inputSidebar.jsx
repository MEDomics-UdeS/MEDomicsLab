import React, { useState, useContext } from 'react';
import { Accordion, Button, Stack } from 'react-bootstrap';
import { ChevronRight, PlusSquare, PlusSquareFill, Plus } from 'react-bootstrap-icons';
import DropzoneComponent from '../../mainPages/dataComponents/dropzoneComponent';
import { SidebarFolder } from './components';
import { WorkspaceContext } from '../../workspace/WorkspaceContext';
import { useEffect } from 'react';
import { SidebarDirectoryTree } from './sidebarDirectoryTree';

const InputSidebar = (props) => {
	const { workspace, setWorkspace } = useContext(WorkspaceContext);
	
	useEffect(() => {
		console.log(workspace);
		
	}, [workspace]);

	return (
		<>
			<Stack direction="vertical" gap={0}>
				<p style={{ color: '#a3a3a3', font: 'Arial', fontSize: '12px', padding: '0.75rem 0.25rem 0.75rem 0.75rem', margin: '0 0 0 0' }}>Input Module</p>
				<DropzoneComponent >
					<Button style={{alignItems: 'flex-end',  marginInline:'2%'}}>
						<Plus size={'2rem'} />
					</Button>
				</DropzoneComponent>
				{workspace['name'] && SidebarFolder({ name: workspace['name'], children: workspace['children']})}
				
			</Stack>
		</>
	);
};

export default InputSidebar;