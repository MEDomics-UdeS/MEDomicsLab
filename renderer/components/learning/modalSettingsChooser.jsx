import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CheckOption from './checkOption';
import { useState, useEffect } from 'react';


/**
 * 
 * @param {object} props
 * @returns {JSX.Element} A ModalSettingsChooser modal
 * 
 * @description
 * This component is used to display a ModalSettingsChooser modal.
 * it handles the display of the modal and the options
 */
const ModalSettingsChooser = ({show, onHide, options, id, data}) => {
    const [checkedUpdate, setCheckedUpdate] = useState(null);

	// update the node when a setting is checked or unchecked from the modal
	useEffect(() => {
        if(checkedUpdate != null) {
			if(checkedUpdate.checked) {
				!data.internal.checkedOptions.includes(checkedUpdate.optionName) &&
					data.internal.checkedOptions.push(checkedUpdate.optionName)
			} else {
				data.internal.checkedOptions = data.internal.checkedOptions.filter(optionName => optionName != checkedUpdate.optionName)
			}
            data.parentFct.updateNode({
                id: id,
                updatedData: data.internal
            })
        }
        
    }, [checkedUpdate])
    
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {data.setupParam.title + ' options'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    Object.entries(options).map(([optionName, optionInfos], i) => {
                        return (<CheckOption
                            key={optionName + i}
                            optionName={optionName}
                            optionInfos={optionInfos}
                            updateCheckState={setCheckedUpdate}
                            defaultState={data.internal.checkedOptions.includes(optionName)}
                        />);
                    })
                }
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalSettingsChooser;