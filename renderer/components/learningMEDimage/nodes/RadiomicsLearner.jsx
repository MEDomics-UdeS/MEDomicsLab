import React from "react"
import Node from "../../flow/node"
import { Form, Row } from "react-bootstrap"
import { InputText } from 'primereact/inputtext';
import {useState} from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { updateHasWarning } from "../../flow/node";


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
const RadiomicsLearner = ({ id, data, type }) => {
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
            {/* Show segmentation warning when there is no roisList or the roisList is empty */}
            <Row className="form-group-box">
              {/* Model type */}
              <Form.Group controlId="algo">
              <Tooltip target=".algo"/>
              <Form.Label 
                  className="algo" 
                  data-pr-tooltip="Learning algorithm (only XGBoost is available for now)"
                  data-pr-position="bottom">
                      Algorithm
              </Form.Label>
                <Dropdown 
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.model}
                    options={[{ name: 'XGBoost' }]}
                    optionLabel="name" 
                    placeholder={data.setupParam.possibleSettings.defaultSettings.model}
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.model = event.target.value.name;
                      data.internal.settings.model = event.target.value.name;
                      updateHasWarning(data);
                      setReload(!reload);
                    }} 
                />
              </Form.Group>

              {/* varImportanceThreshold */}
              <Form.Group controlId="varImportanceThreshold">
              <Tooltip target=".varImportanceThreshold"/>
              <Form.Label 
                  className="varImportanceThreshold" 
                  data-pr-tooltip="Model's variable importance threshold. The higher the threshold, the less variables are kept."
                  data-pr-position="bottom">
                      Variable Importance Threshold
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.XGBoost.varImportanceThreshold}
                    onValueChange={(event) => {
                        data.setupParam.possibleSettings.defaultSettings.XGBoost.varImportanceThreshold = event.target.value;
                        data.internal.settings.XGBoost.varImportanceThreshold = event.target.value;
                        updateHasWarning(data);
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={0.01}
                    max={0.99}
                    step={0.01}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

              {/* optimalThreshold */}
              <Form.Group controlId="optimalThreshold">
              <Tooltip target=".optimalThreshold"/>
              <Form.Label 
                  className="optimalThreshold" 
                  data-pr-tooltip="Model's optimal threshold. Default value is 0.5. If 0, it will be calculated automatically."
                  data-pr-position="bottom">
                      Model's Optimal Threshold
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.XGBoost.optimalThreshold}
                    onValueChange={(event) => {
                        data.setupParam.possibleSettings.defaultSettings.optimalThreshold = event.target.value;
                        data.internal.settings.XGBoost.optimalThreshold = event.target.value;
                        updateHasWarning(data);
                        setReload(!reload);
                    }}
                    mode="decimal"
                    showButtons
                    min={0.00}
                    max={0.99}
                    step={0.01}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
              </Form.Group>

              {/* nameSave */}
              <Form.Group controlId="nameSave">
              <Tooltip target=".nameSave"/>
              <Form.Label 
                  className="nameSave" 
                  data-pr-tooltip="Name to use for saving the model."
                  data-pr-position="bottom">
                      Model's Save Name
              </Form.Label>
                <InputText
                    key="nameSaveModel"
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.XGBoost.nameSave}
                    placeholder={data.setupParam.possibleSettings.defaultSettings.XGBoost.nameSave}
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.XGBoost.nameSave = event.target.value;
                      console.log("data.internal.settings.XGBoost: ", data.internal.settings);
                      data.internal.settings.XGBoost.nameSave = event.target.value;
                      updateHasWarning(data);
                      setReload(!reload);
                    }}
                />
              </Form.Group>

              {/* optimizationMetric */}
              <Form.Group controlId="optimizationMetric">
              <Tooltip target=".optimizationMetric"/>
              <Form.Label
                  className="optimizationMetric" 
                  data-pr-tooltip="Model's optimization metric. Only valid when using PyCaret."
                  data-pr-position="bottom">
                      optimization Metric
              </Form.Label>
              <InputText
                    key="optimizationMetric"
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.XGBoost.optimizationMetric}
                    placeholder={data.setupParam.possibleSettings.defaultSettings.XGBoost.optimizationMetric}
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.XGBoost.optimizationMetric = event.target.value;
                      data.internal.settings.XGBoost.optimizationMetric = event.target.value;
                      updateHasWarning(data);
                      setReload(!reload);
                    }} 
                />
              </Form.Group>

              {/* method */}
              <Form.Group controlId="method">
              <Tooltip target=".method"/>
              <Form.Label 
                  className="method" 
                  data-pr-tooltip="Hyperparameters tuning method. Pycaret is automatic, while grid_search and random_search use pre-defined grids."
                  data-pr-position="bottom">
                      Parameters Tuning Method
              </Form.Label>
                <Dropdown 
                    style={{width: "300px"}}
                    value={data.setupParam.possibleSettings.defaultSettings.XGBoost.method}
                    options={[{ name: 'PyCaret' }, { name: 'grid_search' }, { name: 'random_search' }]}
                    optionLabel="name" 
                    placeholder={data.setupParam.possibleSettings.defaultSettings.XGBoost.method}
                    onChange={(event) => {
                      data.setupParam.possibleSettings.defaultSettings.XGBoost.method = event.target.value.name;
                      data.internal.settings.XGBoost.method = event.target.value.name;
                      updateHasWarning(data);
                      setReload(!reload);
                    }} 
                />
              </Form.Group>


              {/* Seed */}
              <Form.Group controlId="seed">
              <Tooltip target=".seed"/>
              <Form.Label 
                  className="seed" 
                  data-pr-tooltip="Seed for the random generator."
                  data-pr-position="bottom">
                      Random Seed
              </Form.Label>
                <InputNumber
                    style={{width: "300px"}}
                    buttonLayout="horizontal"
                    value={data.setupParam.possibleSettings.defaultSettings.XGBoost.seed}
                    onValueChange={(event) => {
                        data.setupParam.possibleSettings.defaultSettings.XGBoost.seed = event.target.value;
                        data.internal.settings.XGBoost.seed = event.target.value;
                        updateHasWarning(data);
                        setReload(!reload);
                    } }
                    mode="decimal"
                    min={1}
                />

              </Form.Group>
            </Row>
          </>
        }
      />
    </>
  )
}

export default RadiomicsLearner
