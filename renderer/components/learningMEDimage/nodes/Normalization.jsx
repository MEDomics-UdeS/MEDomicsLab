import React from "react"
import Node from "../../flow/node"
import { Form, Row, Col } from "react-bootstrap"
import { InputText } from 'primereact/inputtext';
import {useState} from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';


/**
 * @param {string} id id of the node
 * @param {object} data data of the node
 * @param {string} type type of the node
 * @returns {JSX.Element} A SegmentationNode node
 *
 * @description
 * This component is used to display a SegmentationNode node.
 * it handles the display of the node and the modal
 */
const Normalization = ({ id, data, type }) => {  
  const [reload, setReload] = useState(false);

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        type={type}
        setupParam={data.setupParam}
        nodeSpecific={
          <>
            <Row className="form-group-box">
              {/* Method */}
              <Form.Group controlId="normMethod">
              <Tooltip target=".normMethod"/>
              <Form.Label 
                  className="normMethod" 
                  data-pr-tooltip="Normalization method."
                  data-pr-position="bottom">
                      Normalization Method
              </Form.Label>
                <Dropdown 
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.method}
                    options={[{ name: 'combat' }]}
                    optionLabel="name" 
                    placeholder={data.setupParam.possibleSettings.defaultSettings.method}
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.method = event.target.value.name;
                      data.internal.settings.method = event.target.value.name;
                      setReload(!reload);
                    }} 
                />
              </Form.Group>
            </Row>
          </>
        }
      />
    </>
  )
}

export default Normalization
