import React, { useState, useEffect, useContext } from 'react';
import { Button, Container } from 'react-bootstrap';
import CloseButton from 'react-bootstrap/CloseButton';
import Card from 'react-bootstrap/Card';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { toast } from 'react-toastify'; // https://www.npmjs.com/package/react-toastify
import EditableLabel from 'react-simple-editlabel';
import Handlers from './handlers';
import { OffCanvasBackdropStyleContext } from './OffCanvasBackdropStyleContext';

/**
 *
 * @param {string} id used to identify the node
 * @param {object} data contains the data of the node. refer to renderer\components\flow\learning\workflow.jsx at function createNode for more information
 * @param {JSX.Element} nodeSpecific jsx element to display specific settings of the node inside the offcanvas
 * @param {JSX.Element} nodeBody jsx element to display the body of the node
 * @param {JSX.Element} defaultSettings jsx element to display default settings of the node inside the offcanvas
 *
 * @returns {JSX.Element} A node
 *
 * @description
 * This component is used to display a node.
 *
 * Note: all JSX.Element props are not mandatory
 * Note: see Powerpoint for additionnal
 */
const Node = ({ id, data, nodeSpecific, nodeBody, defaultSettings }) => {
	const [showOffCanvas, setShowOffCanvas] = useState(false);
	const handleOffCanvasClose = () => setShowOffCanvas(false);
	const handleOffCanvasShow = () => setShowOffCanvas(true);
	const [nodeName, setNodeName] = useState(data.internal.name);
	const [offcanvasComp, setOffcanvasComp] = useState(null);
	const { updateBackdropStyle } = useContext(OffCanvasBackdropStyleContext);

	/**
	 * @description
	 * This function is used to update the internal data of the node.
	 * It is called when the user changes the name of the node.
	 * It calls the parent function wich is defined in the workflow component
	 */
	useEffect(() => {
		data.internal.name = nodeName;
		data.parentFct.updateNode({
			id: id,
			updatedData: data.internal,
		});
	}, [nodeName]);

	/**
	 * @description
	 * This function is used to set the offcanvas container.
	 * It is called when the node is created.
	 * This is necessary because the offcanvas is not a child of the node, but it is controlled by the node.
	 * This is done for styling purposes (having the backdrop over the entire workflow).
	 */
	useEffect(() => {
		console.log(data.internal);
		setOffcanvasComp(
			document.getElementById(data.internal.workflowInfos.id)
		);
	}, [data.internal.worklowInfos]);

	/**
	 * @description
	 * This function is used to display the offcanvas.
	 * It is called when the user clicks on the node.
	 * by changing the z-index of the offcanvas, it appears over/under the workflow.
	 */
	useEffect(() => {
		let style = {};
		if (showOffCanvas) {
			style = { transition: 'none', zIndex: '2' };
		} else {
			style = { transition: 'z-index 0.5s ease-in', zIndex: '-1' };
		}
		updateBackdropStyle(style);
	}, [showOffCanvas]);

	/**
	 *
	 * @param {*} value new value of the node name
	 * @description
	 * This function is called when the user changes the name of the node (focus out of the input).
	 * It checks if the name is over 15 characters and if it is, it displays a warning message.
	 * It then updates the name of the node by calling setNodeName wich will call the corresponding useEffect above.
	 */
	const newNameHasBeenWritten = (value) => {
		let newName = value;
		if (value.length > 15) {
			newName = value.substring(0, 15);
			toast.warn(
				'Node name cannot be over 15 characters. Only the first 15 characters will be saved.',
				{
					position: 'bottom-right',
					autoClose: 2000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: 'light',
					toastId: 'customId',
				}
			);
		}
		setNodeName(newName);
	};

	return (
		<>
			<div>
				<div>
					<Handlers id={id} setupParam={data.setupParam} />
					<Card key={id} id={id} className="text-left node">
						<Card.Header onClick={handleOffCanvasShow}>
							<img
								src={
									`/icon/${data.internal.workflowInfos.type}/` +
									`${data.internal.img.replaceAll(' ', '_')}`
								}
								alt={data.internal.img}
								className="icon-nodes"
							/>
							{data.internal.name}
						</Card.Header>
						{nodeBody != undefined && (
							<Card.Body>{nodeBody}</Card.Body>
						)}
					</Card>
				</div>
				<Container>
					<Offcanvas
						show={showOffCanvas}
						onHide={handleOffCanvasClose}
						placement="end"
						scroll
						backdrop
						container={offcanvasComp}
					>
						<Offcanvas.Header closeButton>
							<Offcanvas.Title>
								<EditableLabel
									text={data.internal.name}
									labelClassName="node-editableLabel"
									inputClassName="node-editableLabel"
									inputWidth="20ch"
									inputHeight="25px"
									labelFontWeight="bold"
									inputFontWeight="bold"
									onFocusOut={(value) => {
										newNameHasBeenWritten(value);
									}}
								/>
							</Offcanvas.Title>
						</Offcanvas.Header>
						<Offcanvas.Body>
							<hr className="solid" />
							{defaultSettings}
							{nodeSpecific}
						</Offcanvas.Body>
					</Offcanvas>
				</Container>
				<CloseButton onClick={() => data.parentFct.deleteNode(id)} />
				{data.setupParam.classes.split(' ').includes('run') && (
					<Button
						variant="success"
						className="btn-runNode"
						onClick={() => data.parentFct.runNode(id)}
					>
						<img
							src={'/icon/run.svg'}
							alt="run"
							className="img-fluid"
						/>
					</Button>
				)}
			</div>
		</>
	);
};

export default Node;
