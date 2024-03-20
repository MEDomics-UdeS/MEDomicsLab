import React from "react"
import Node from "../../flow/node"
import { Form, Row, Col } from "react-bootstrap"
import { InputText } from 'primereact/inputtext';
import {useState} from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';


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
const Analyze = ({ id, data, type }) => {

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
            {console.log("internal Analyze", data.internal.settings)}
            {
              <Row className="form-group-box">
              <Row className="form-group-box">
                {/* Analyze methods */}
                <Form.Group controlId="analysisMeth">
                  <Form.Label className="analysisMeth">
                      Analysis Methods
                  </Form.Label>
                    <div key={"HistogramMeth"} style={{display: 'flex', justifyContent:'flex-start'}}>
                      <Checkbox
                        onChange={(event) => {
                          // check if the file is already in the list if yes remove it
                          if (data.internal.settings.histogram) {
                            console.log("remove")
                            data.internal.settings.histogram = false;
                          } else {
                            data.internal.settings.histogram = true;
                          }
                          setReload(!reload);
                        }}
                        checked={data.internal.settings.histogram}
                      />
                      <label htmlFor={"HistogramMeth"} className="ml-2">Histogram</label>
                    </div>
                    <div key={"HeatMapMeth"} style={{display: 'flex', justifyContent:'flex-start'}}>
                      <Checkbox
                        onChange={(event) => {
                          // check if the file is already in the list if yes remove it
                          if (data.internal.settings.heatmap) {
                            console.log("remove")
                            data.internal.settings.heatmap = false;
                          } else {
                            data.internal.settings.heatmap = true;
                          }
                          setReload(!reload);
                        }}
                        checked={data.internal.settings.heatmap}
                      />
                      <label htmlFor={"HeatMapMeth"} className="ml-2">Heatmap</label>
                    </div>
                    <div key={"ImpTreeMeth"} style={{display: 'flex', justifyContent:'flex-start'}}>
                      <Checkbox
                        onChange={(event) => {
                          // check if the file is already in the list if yes remove it
                          if (data.internal.settings.tree) {
                            console.log("remove")
                            data.internal.settings.tree = false;
                          } else {
                            data.internal.settings.tree = true;
                          }
                          setReload(!reload);
                        }}
                        checked={data.internal.settings.tree}
                      />
                      <label htmlFor={"ImpTreeMeth"} className="ml-2">Importance Tree</label>
                    </div>
                </Form.Group>

                  {/* P-value yes or no */}
                  <Form.Group controlId="findOptimalLvl">
                  <Tooltip target=".findOptimalLvl"/>
                  <Form.Label
                      className="findOptimalLvl">
                          Find Optimal Level
                  </Form.Label>
                    <br></br>
                    <InputSwitch 
                        checked={data.setupParam.possibleSettings.defaultSettings.optimalLevel}
                        onChange={(event) => {
                            data.setupParam.possibleSettings.defaultSettings.optimalLevel = event.target.value;
                            data.internal.settings.optimalLevel = event.target.value;
                            setReload(!reload);
                        }}
                    />
                  </Form.Group>

                </Row>
                
                {/*Histogram method parameters*/}
                {(data.internal.settings.histogram) && (
                  <Row className="form-group-box">
                    <Form.Group controlId="histPlotParams">
                    <Tooltip target=".histPlotParams"/>
                    <Form.Label 
                        className="histPlotParams" 
                        data-pr-tooltip="Option used to sort the features. Either by importance, by times selected over the splits or both."
                        data-pr-position="bottom">
                            Histogram Sort Option
                    </Form.Label>
                      <Dropdown 
                          style={{width: "200px"}}
                          value={data.setupParam.possibleSettings.defaultSettings.histParams.sortOption}
                          options={[{ name: 'importance' }, { name: 'times_selected' }, { name: 'both' }]}
                          optionLabel="name" 
                          placeholder={data.setupParam.possibleSettings.defaultSettings.histParams.sortOption}
                          onChange={(event) => {
                            data.setupParam.possibleSettings.defaultSettings.histParams.sortOption = event.target.value.name;
                            data.internal.settings.histParams.sortOption = event.target.value.name;
                            setReload(!reload);
                          }} 
                      />
                    </Form.Group>
                    </Row>
                )}

                {/*Heatmap method parameters*/}
                {(data.internal.settings.heatmap) && (
                  <Row className="form-group-box">
                    <Form.Group controlId="heatmapPlotParams">
                    <Tooltip target=".heatmapPlotParams"/>
                    <Form.Label
                        className="heatmapPlotParams">
                            Heatmap Options
                    </Form.Label>

                      {/* Main heatmap metric */}
                      <Form.Group controlId="mainMetric">
                      <Tooltip target=".mainMetric"/>
                      <Form.Label 
                        className="mainMetric"
                        data-pr-tooltip="It is recommended to add '_mean' to the metric name to get the mean of the metric over the splits."
                        data-pr-position="bottom"
                      >
                        Main Heatmap Metric
                      </Form.Label>
                        <InputText
                          style={{width: "300px"}}
                          value={data.setupParam.possibleSettings.defaultSettings.heatmapParams.metric}
                          placeholder={data.setupParam.possibleSettings.defaultSettings.heatmapParams.metric}
                          onChange={(event) => {
                            data.setupParam.possibleSettings.defaultSettings.heatmapParams.metric = event.target.value;
                            data.internal.settings.heatmapParams.metric = event.target.value;
                            setReload(!reload);
                          }}
                      />
                      </Form.Group>

                      {/* P-value yes or no */}
                      <Form.Group controlId="plotPvalues">
                      <Tooltip target=".plotPvalues"/>
                      <Form.Label
                          className="plotPvalues">
                              Plot p-values
                      </Form.Label>
                        <br></br>
                        <InputSwitch 
                            checked={data.setupParam.possibleSettings.defaultSettings.heatmapParams.pValues}
                            onChange={(event) => {
                                data.setupParam.possibleSettings.defaultSettings.heatmapParams.pValues = event.target.value;
                                data.internal.settings.heatmapParams.pValues = event.target.value;
                                setReload(!reload);
                            }}
                        />
                      </Form.Group>

                      {/* P-value method */}
                      {(data.internal.settings.heatmapParams.pValues) && (<Form.Group controlId="pValueMethod">
                      <Tooltip target=".pValueMethod"/>
                      <Form.Label
                          className="pValueMethod">
                              P-value Method
                      </Form.Label>
                        <Dropdown 
                            style={{width: "200px"}}
                            value={data.setupParam.possibleSettings.defaultSettings.heatmapParams.pValuesMethod}
                            options={[{ name: 'delong' }, { name: 'ttest' }, { name: 'wilcoxon' }, { name: 'bengio' }]}
                            optionLabel="name" 
                            placeholder={data.setupParam.possibleSettings.defaultSettings.heatmapParams.pValuesMethod}
                            onChange={(event) => {
                              data.setupParam.possibleSettings.defaultSettings.heatmapParams.pValuesMethod = event.target.value.name;
                              data.internal.settings.heatmapParams.pValuesMethod = event.target.value.name;
                              setReload(!reload);
                            }} 
                        />
                      </Form.Group>)}

                      {/* Extra metrics */}
                      <Form.Group controlId="extraMetics">
                      <Tooltip target=".extraMetics"/>
                      <Form.Label 
                        className="extraMetics"
                        data-pr-tooltip="Use ',' for separation. Add '_mean' to the metric name to get the mean of the metric over the splits."
                        data-pr-position="bottom"
                      >
                        Extra metrics
                      </Form.Label>
                        <InputText
                          style={{width: "300px"}}
                          value={data.setupParam.possibleSettings.defaultSettings.heatmapParams.extraMetrics}
                          placeholder={data.setupParam.possibleSettings.defaultSettings.heatmapParams.extraMetrics}
                          onChange={(event) => {
                            data.setupParam.possibleSettings.defaultSettings.heatmapParams.extraMetrics = event.target.value;
                            data.internal.settings.heatmapParams.extraMetrics = event.target.value;
                            setReload(!reload);
                          }}
                      />
                      </Form.Group>

                      {/* Title */}
                      <Form.Group controlId="plotTitle">
                      <Tooltip target=".plotTitle"/>
                      <Form.Label className="plotTitle">
                          Plot Title (Optional)
                      </Form.Label>
                        <InputText
                          style={{width: "300px"}}
                          value={data.setupParam.possibleSettings.defaultSettings.heatmapParams.title}
                          placeholder="Ex: 'Glioma IDH classificaion: mean AUC heatmap'"
                          onChange={(event) => {
                            data.setupParam.possibleSettings.defaultSettings.heatmapParams.title = event.target.value;
                            data.internal.settings.heatmapParams.title = event.target.value;
                            setReload(!reload);
                          }}
                      />
                      </Form.Group>
                    </Form.Group>
                    </Row>
                )}
              
              </Row>
            }
          </>
        }
      />
    </>
  )
}

export default Analyze
