import React, { useContext, useState } from 'react';
import { Accordion, Stack, InputGroup } from 'react-bootstrap';
import { ChevronRight, Folder, PlusSquare, PlusSquareFill } from 'react-bootstrap-icons';
import { SidebarFile, SidebarFolder, SidebarItem } from './components';
import { LayoutModelContext } from "../LayoutContext";
import { useEffect } from 'react';

const LayoutTestSidebar = () => {
	var recursiveChildrenTest = {
		name: 'Test page',
		children: [
			{
				name: 'Input page',
				children: [
					{
						name: 'Extraction page',
						children: [
							{
								name: 'Discovery page',
								children: [
									{
										name: 'Learning page',
										children: [
											{
												name: 'Results page',
												children: [
													{
														name: 'Application page',
													},
													{
														name: 'Application page2',
													}
												],
											},
											{
												name: 'Results page2',
												children: [
													{
														name: 'Application page3',
													},
													{
														name: 'Application page4',
													}
												],
											},
											{
												name: 'Results page3',
											}
										],
									},
									{
										name: 'Learning page2',
									}
								],
							},
							{
								name: 'Discovery page2',
								children: [
									{
										name: 'Learning page3',
									},
									{
										name: 'Learning page4',
									}
								],
							},
							{
								name: 'Discovery page3',
							}
						],
					},
				],
			},
		],
	};

	const { layoutModel } = useContext(LayoutModelContext) // Here we retrieve the layoutModel from the LayoutContext
	const delete_bool = true; // This is a boolean that will be passed to the SidebarFile component to enable the delete button, for development purposes
	const add_bool = true; // This is a boolean that will be passed to the SidebarFile component to enable the add button, for development purposes
	const [tabsList, setTabsList] = useState(layoutModel); // This is the list of tabs that will be displayed in the sidebar
	useEffect(() => {
		console.log('TABS LIST', tabsList);
		setTabsList(layoutModel);
	}, [layoutModel]);

	return (
		<>
			<Stack direction="vertical" gap={0}>
				<Accordion defaultActiveKey={['0']} alwaysOpen >
					<Accordion.Item eventKey="0">
						<Accordion.Header>
							Add page
						</Accordion.Header>
						<Accordion.Body>
							<Stack direction="vertical" gap={0}>
								<SidebarFile name='Test page' add={add_bool} delete={delete_bool} />
								<SidebarFile name='Input page' add={add_bool} delete={delete_bool} />
								<SidebarFile name='Extraction page' add={add_bool} delete={delete_bool} />
								<SidebarFile name='Discovery page' add={add_bool} delete={delete_bool} />
								<SidebarFile name='Learning page' add={add_bool} delete={delete_bool} />
								<SidebarFile name='Results page' add={add_bool} delete={delete_bool} />
								<SidebarFile name='Application page' add={add_bool} delete={delete_bool} />
							</Stack>
						</Accordion.Body>
					</Accordion.Item>
					<Accordion.Item eventKey="1">
						<Accordion.Header>
							<Stack direction="horizontal" gap={1} style={{ padding: '0 0 0 0', alignContent: 'center' }}>
								<Folder style={{marginLeft:'0.2rem'}} />Tabs explorer
							</Stack>
						</Accordion.Header>
						<Accordion.Body className='sidebar-acc-body'>
							<Stack direction="vertical" gap={0}>
								<SidebarFolder name={'Workspace #1'} children={tabsList.layout.children} />
							</Stack>
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</Stack>
		</>
	);
};

export default LayoutTestSidebar;