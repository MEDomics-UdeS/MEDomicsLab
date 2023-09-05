import React, { useState } from 'react';
import { Accordion, Button, Stack } from 'react-bootstrap';
import { ChevronRight, PlusSquare, PlusSquareFill, Plus } from 'react-bootstrap-icons';
import DropzoneComponent from '../../mainPages/dataComponents/dropzoneComponent';

const InputSidebar = (props) => {
	return (
		<>
			<Stack direction="vertical" gap={0}>
				<p style={{ color: '#a3a3a3', font: 'Arial', fontSize: '12px', padding: '0.75rem 0.25rem 0.75rem 0.75rem', margin: '0 0 0 0' }}>Input Module</p>
				<DropzoneComponent >
					<Button style={{alignItems: 'flex-end',  marginInline:'2%'}}>
						<Plus size={'2rem'} />
					</Button>
				</DropzoneComponent>

				<Accordion defaultActiveKey={['0']} alwaysOpen >
					<Accordion.Item eventKey="0">
						<Accordion.Header>
							<Stack direction="horizontal" style={{ flexGrow: '1' }}>
								<p></p>
								<div style={{ flexGrow: '10' }} />
							</Stack>
						</Accordion.Header>
						<Accordion.Body>

						</Accordion.Body>
					</Accordion.Item>
					<Accordion.Item eventKey="1">
						<Accordion.Header></Accordion.Header>
						<Accordion.Body>

						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</Stack>
		</>
	);
};

export default InputSidebar;