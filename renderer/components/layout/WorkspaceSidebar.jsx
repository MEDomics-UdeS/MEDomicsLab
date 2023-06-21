import React, { useState } from 'react';
import { Accordion, Stack } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import { ChevronRight, PlusSquare, PlusSquareFill } from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';


const WorkspaceSidebar = () => {
	return (
		<>
			<Stack direction="vertical" gap={0}>
				<p style={{ color: '#a3a3a3', font: 'Arial', fontSize: '15px', padding: '0.75rem 0.25rem 0.75rem 0.75rem', margin: '0 0 0 0' }}>EXPLORER</p>
				<Accordion defaultActiveKey={['0']} alwaysOpen >
					<Accordion.Item eventKey="0">
						<Accordion.Header>
							<Stack direction="horizontal" style={{flexGrow: '1'}}>
								<p>OPEN EDITORS</p>
								<div style={{flexGrow:'10'}}/>
								</Stack>
						</Accordion.Header>
						<Accordion.Body>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
						</Accordion.Body>
					</Accordion.Item>
					<Accordion.Item eventKey="1">
						<Accordion.Header>WORKSPACE</Accordion.Header>
						<Accordion.Body>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</Stack>
		</>
	);
};

export default WorkspaceSidebar;