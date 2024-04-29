import React, { useContext, useState, useEffect, useRef } from "react"
import Card from "react-bootstrap/Card"
import { Col, Row } from "react-bootstrap"
import { toast } from "react-toastify"
import { FlowResultsContext } from "../context/flowResultsContext"
import { FlowInfosContext } from "../context/flowInfosContext"
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Image } from 'primereact/image';
import { Panel } from 'primereact/panel';
import { OverlayPanel  } from 'primereact/overlaypanel';
import { SelectButton } from "primereact/selectbutton"
import { Message } from 'primereact/message';
import { requestBackend } from "../../../utilities/requests"
import { WorkspaceContext } from "../../workspace/workspaceContext"


/**
 *
 * @returns {JSX.Element} A results pane accessed by using the menu tree
 *
 * @description
 * This component is used to display the results of the pipeline according to the selected nodes.
 *
 */
const ResultsPaneMEDimage = () => {
  const { selectedResultsId, setSelectedResultsId, flowResults, showResultsPane, setShowResultsPane, isResults } = useContext(FlowResultsContext)
  const [selectedResults, setSelectedResults] = useState([])
  const [selectedPipelines, setSelectedPipelines] = useState([])
  const [generatedPipelines, setGeneratedPipelines] = useState([])
  const { flowContent } = useContext(FlowInfosContext)
  const [expNames, setExpNames] = useState([])
  const [compareMode, setCompareMode] = useState(false)
  const [showMetrics, setShowMetrics] = useState(true)
  const [histogramImages, setHistogramImages] = useState([])
  const [heatMap, setHeatMap] = useState()
  const [treePlot, setTreePlot] = useState("")
  const { port } = useContext(WorkspaceContext)

  const op = useRef(null);

  const cleanResults = () => {
    setSelectedResults([])
    setExpNames([])
    setSelectedPipelines([])
    setHistogramImages([])
    setHeatMap("")
    setTreePlot("")
  }

  /*
  * @Description: This function is used to process the flow data
  */
  const processFlowData = (flowContent) => {
    try {
    // process nodes params
    const newFlow = structuredClone(flowContent);
    newFlow.nodes.forEach((node) => {
      node.data = node.data.internal.settings;
    });

    console.log("newFlow", newFlow)

    // extract selected pipelines
    let pipIndexes = generatedPipelines.map((pip) => pip.name.split(" ")[1] - 1)
    console.log("pipIndexes", pipIndexes)
    let pipsToGenerate = pipIndexes.map((pipIndex) => selectedPipelines[pipIndex])
    console.log("pipsToGenerate", pipsToGenerate)
    return {
      "nodes": newFlow.nodes,
      "pips": pipsToGenerate,
    };
  }
  catch (error) {
    toast.error("Error detected while processing the flow data", error)
  }
  };

  /*
  * @Description: This function is used to generate the code of the selected pipelines
  */
  const generateCode = () => {
    if (generatedPipelines.length == 0){
      toast.error("No pipeline selected");
      return;
    } else {
      // Process data
      let newFlow = processFlowData(flowContent)
      requestBackend(
        port,
        "/learning_MEDimage/generate_pips",
        null,
        newFlow,
        (response) => {
          console.log("received results:", response)
          if (!response.error) {
            console.log("Success response", response)
            toast.success("Notebooks generated successfully")

            // Open the notebook
            try{
              var pathNotebook = response.path_notebook;
              var portNotebook = port + 1;
              var exec = require('child_process').exec;
              exec(`jupyter notebook --port=${portNotebook} ${pathNotebook}`,
                  function (error, stdout, stderr) {
                      console.log('stdout: ' + stdout);
                      console.log('stderr: ' + stderr);
                      if (error !== null) {
                          console.log('exec error: ' + error);
                      }
                  });
                }
            catch (error) {
              console.log("Error detected while opening the notebook", error)
            }
            
          } else {
            toast.error(response.error)
            console.log("error", response.error)
          }
          },
          (error) => {
            toast.error("Error detected while running the experiment", error)
        }
      )
    }
  }

  /*
  * @Description: This function is used to render the results in a table (experiment by experiment)
  */
  const renderAccordions = (data, isResults) => {
    // if data is empty, display a warning
    if (!data || data.length === 0) {
      return (
        <Accordion style={{ maxWidth: '30px' }}>
          <AccordionTab key={`AccordionTab-${0}`} header={"No results to display"}>
            <div style={{ color: 'red' }}>Warning: Values are empty or undefined.</div>
          </AccordionTab>
        </Accordion>
      );
    }

    // Else
    try {    
      console.log("renderAccordions data", data)
      return data.map((pipelines, indexPip) => {
        return (
          <Accordion key={`AccordionPips-${indexPip}`}>
            <AccordionTab disabled={!isResults} key={`AccordionTab-${indexPip}`} header={Object.keys(pipelines)[0]}>
              {Object.entries(pipelines).map((item, index) => {
                return (
                  <Accordion key={`Accordion-${index+indexPip}`}>
                    <AccordionTab disabled={!isResults} key={`AccordionTab-${index+indexPip}`} header={Object.keys(item[1])[0]}>
                      {renderAccordionTabs(item[1], index, isResults)}

                      {/*Figures*/}
                      {/*Histograms*/}
                      <Accordion key={`AccordionTab-Histograms-${index+indexPip}`}>
                        <AccordionTab disabled={!isResults} key={`AccordionTab-Figures-${index+indexPip}`} header={"Analysis Plots"}>
                            <Image key={indexPip+index} src={histogramImages[indexPip+index]} alt="Image" width="300" preview/>
                        </AccordionTab>
                      </Accordion>

                    </AccordionTab>
                  </Accordion>
                );
              })
            }
            </AccordionTab>
          </Accordion>
      )});
    } catch (error) {
      toast.error("Invalid workflow", error)
    }
  };
  
  const renderAccordionTabs = (item, index, isResults) => {
    console.log("item renderAccordionTabs", item)
    console.log("index renderAccordionTabs", index)
    console.log("expNames", expNames)
    return Object.keys(item).map((currentExp, _) => {
      console.log("currentExp", currentExp)
      console.log("expNames[index]", expNames[index])
      if (expNames.includes(currentExp)){
        console.log("went it")
        return Object.keys(item[currentExp]).map((key, dataIdx) => {
          console.log("item[currentExp]", item[currentExp])
          let values = item[currentExp][key];
          console.log("values", values)

          let keysList = Object.keys(values);
          console.log("keysList", keysList)

          // Add experiment name to the list of keys
          if (expNames.length > 0) {
            if (!values.hasOwnProperty("Experiment")) {
              values["Experiment"] = currentExp;
            }
            if (keysList.includes("Experiment")){
              keysList.splice(keysList.indexOf("Experiment"), 1);
            }
            keysList.unshift("Experiment");
          }

          // If no metrics are found, display a warning
          if (!values || keysList.length === 0 || (expNames.length > 0 && keysList.length === 1)){
            return (
              <Accordion>
                <AccordionTab key={`AccordionTab-${index}`} header={key}>
                  <div style={{ color: 'red' }}>Warning: Values are empty or undefined.</div>
                </AccordionTab>
              </Accordion>
            );
          }
          
          // Display the metrics in a table
          return (
            <Accordion>
              <AccordionTab disabled={!isResults} key={`AccordionTab-${dataIdx+index+1}`} header={key}>
                <DataTable value={[values]}>
                  {keysList.map((key1, columnIndex) => (
                    <Column key={key1} field={key1} header={key1} style={columnIndex % 2 === 0 ? { backgroundColor: 'lightgray' } : { backgroundColor: 'lightblue' }}/>
                  ))}
                </DataTable>
              </AccordionTab>
            </Accordion>
          );
        });
      }
    });
  };

  /*
  * @Description: This function is used to render the results in a table in compare mode
  */
  const renderAccordionCompared = (data, isResults) => {

    try {
      // if data is empty, display a warning
      if (!data || data.length === 0) {
        return (
          <Accordion>
            <AccordionTab key={`AccordionTab-${0}`} header={"No results to display"}>
              <div style={{ color: 'red' }}>Warning: Values are empty or undefined.</div>
            </AccordionTab>
          </Accordion>
        );
      }
      let values = [[]]
      let MetricsKeysList = []
      let keysList = []

      // Find unique keys in both experiments
      for (let index = 0; index < data.length; index++) {
        let item = data[index];
        // loop through item
        Object.keys(item).map((key, _) => {
          if (Object.keys(item[key]).length > 1){
            Object.keys(item[key]).map((key1, _) => {
              if (expNames.includes(key1)){
                keysList.push(Object.keys(item[key][key1]));
              }
            });
          }
        });
        //keysList.push(Object.keys(item[expNames[index]]));
      }
      keysList = keysList.reduce((a, b) => a.filter(c => b.includes(c)));

      console.log("keysList 225", keysList)

      // Fill values for Data Table
      let keyIndex = 0;
      for (const key of keysList) {
        console.log("key 225", key)
        values[keyIndex] = []
        for (let index = 0; index < data.length; index++) {
            let item = data[index];
            // loop through item
            Object.keys(item).map((key1, _) => {
              if (Object.keys(item[key1]).length > 1){
                Object.keys(item[key1]).map((key2, _) => {
                  if (expNames.includes(key2)){
                    let currectKeys = Object.keys(item[key1][key2][key]);

                    if (currectKeys.length > 1){
                      values[keyIndex][index] = item[key1][key2][key];
                      MetricsKeysList = Object.keys(item[key1][key2][key]);

                      // Add experiment name to the list of keys
                      if (!values.hasOwnProperty("Experiment")) {
                        values[keyIndex][index]["Experiment"] = key1 + "_" + key2;
                      }
                      if (MetricsKeysList.includes("Experiment")){
                        MetricsKeysList.splice(MetricsKeysList.indexOf("Experiment"), 1);
                      }
                      MetricsKeysList.unshift("Experiment");
                    }
                  }
                });
              }
            });
          }

          /*const item = data[index];
          if (Object.keys(item[expNames[index]][key]).length > 1){
            console.log("keyIndex ", keyIndex)
            console.log("key ", key)
            console.log("item[expNames[index]][key]", item[expNames[index]][key])
            values[keyIndex][index] = item[expNames[index]][key];
            MetricsKeysList = Object.keys(item[expNames[index]][key]);*/
        
        keyIndex++;
      }

      // If no metrics are found, display a warning
      if (!values || MetricsKeysList.length === 0 || (expNames.length > 0 && MetricsKeysList.length === 1)) {
        return keysList.map((item, key) => {
          <Accordion key={`Accordion-${key}`}>
            <AccordionTab key={`AccordionTab-${key}`} header={item}>
              <div style={{ color: 'red' }}>Warning: Values are empty or undefined.</div>
            </AccordionTab>
          </Accordion>
        });
      }
      
      // Display the metrics in a table
      return <>
      {(showMetrics) && (<Card className="text-center">
        <Card.Title>Metrics</Card.Title>
        {keysList.map((item, key) => {
          return (
          <Accordion key={`Accordion-${key}`}>
            <AccordionTab disabled={!isResults} key={`AccordionTab-${key}`} header={item}>
                <DataTable value={values[key]} stripedRows>
                  {MetricsKeysList.map((key1, columnIndex) => (
                    <Column key={key1} field={key1} header={key1}/>
                  ))}
                </DataTable>
            </AccordionTab>
          </Accordion>
          );
        })}
      </Card>)}

      {/*Figures*/}
      <Card className="text-center">
        <Card.Title>Plots</Card.Title>
          <Accordion>
            <AccordionTab disabled={!isResults} key={`AccordionTab-Figures`} header={"Compare Analysis Plots"}>
              {(heatMap === undefined || heatMap === "") && (
                <div style={{ color: 'red' }}>No heatmap generated.</div>
              )}
              {(treePlot === undefined || treePlot === "") && (
                <div style={{ color: 'red' }}>No tree plot generated.</div>
              )}
              {(heatMap !== undefined && heatMap !== "") && (
                <Panel header="Heatmap" toggleable>
                  <Image key={"Heatmap"} src={heatMap} alt="Image" width="500" preview/>
                </Panel>
              )}
              {(treePlot !== undefined && treePlot !== "") && (
                <Panel header="Tree Plot" toggleable>
                  <Image key={"treePlot"} src={treePlot} alt="Image" width="500" preview/>
                </Panel>
              )}
            </AccordionTab>
        </Accordion>
      </Card>
    </>
    } catch (error) {
      toast.error("Invalid workflow for compare mode", error)
      return (
        <Accordion>
          <AccordionTab key={`AccordionTab-${0}`} header={"Error occured, no results to display"}>
            <div style={{ color: 'red' }}>Warning: Values are empty or undefined.</div>
          </AccordionTab>
        </Accordion>
      );
    }
  };

  const handleClose = () => setShowResultsPane(false)

  useEffect(() => {
    console.log("flowContent", flowContent)
    if (flowContent.nodes) {
      console.log("flowContent.nodes", flowContent.nodes)
      let experiments = []
      let histograms = []
      flowContent.nodes.map((node) => {
        if (node.type === "Analyze"){
          console.log("Found analyze node")
          // Images
          if (node.data.internal.results.hasOwnProperty("figures")){
            console.log("Found figures", node.data.internal.results.figures)
            // Heatmap
            if (node.data.internal.results.figures.hasOwnProperty("heatmap")){
              if (node.data.internal.results.figures.hasOwnProperty("heatmap")){
                if (node.data.internal.results.figures.heatmap.hasOwnProperty("path")){
                    setHeatMap(node.data.internal.results.figures.heatmap.path)
                    console.log("pushing heatMaps", node.data.internal.results.figures.heatmap.path)
                }
              }
            }
            // Tree Plot
            if (node.data.internal.results.figures.hasOwnProperty("treeplot")){
              if (node.data.internal.results.figures.hasOwnProperty("treeplot")){
                if (node.data.internal.results.figures.treeplot.hasOwnProperty("treeplot")){
                    setTreePlot(node.data.internal.results.figures.treeplot.path)
                    console.log("pushing treeplot", node.data.internal.results.figures.treeplot.path)
                }
              }
            }
          }
          // Results - Metrics
          if (node.data.internal.results.hasOwnProperty("results_avg")){
            console.log("Found results_avg", node.data.internal.results)
            setSelectedResults(node.data.internal.results.results_avg)
            /*node.data.internal.results.results_avg.map((result, index) => {
              console.log("result map", result)
              if (experiments.length > 0){
                console.log("HOW 1")
                if (!experiments.includes(Object.keys(result)[0])){
                  console.log("HOW 2")
                  experiments.push(Object.keys(result)[0])
                }
              }
              else {
                console.log("HOW 3")
                experiments.push(Object.keys(result)[0])
              }
            })*/
            // Histograms
            try{
              console.log("BEEN HERE")
              for (let index = 0; index < node.data.internal.results.results_avg.length; index++) {
                console.log("BEEN HERE 2")
                Object.entries(node.data.internal.results.results_avg[index]).map((item, _) => {
                  console.log("BEEN HERE 3")
                  console.log("item BEEN", item[1])
                  Object.entries(item[1]).map((itemAnalysis, _) => {
                    console.log("BEEN HERE 4")
                    console.log("BEEN itemAnalysis", itemAnalysis)
                    Object.entries(itemAnalysis[1]).map((resultAnalysis, _) => {
                      console.log("BEEN HERE 5")
                      console.log("BEEN resultAnalysis", resultAnalysis)
                      let result = resultAnalysis[1];
                      console.log("BEEN histogram test result", result)
                          if (result.hasOwnProperty("histogram")){
                            if (result.histogram.hasOwnProperty("path")){
                              if(!histograms.includes(result.histogram.path)){
                                console.log("BEENpushing histogram", result.histogram.path)
                                histograms.push(result.histogram.path)
                              }
                            }
                          }
                        })
                  });
                });
              }
            } catch (error) {
              console.log("Error detected while processing histograms", error)
            }
          }
          if (node.data.internal.results.hasOwnProperty("pips")){
            console.log("Found pip", node.data.internal.results.pips)
            setSelectedPipelines(node.data.internal.results.pips)
          }
          if (node.data.internal.results.hasOwnProperty("experiments")){
            console.log("Found experiments", node.data.internal.results.experiments)
            setExpNames(node.data.internal.results.experiments)
          }
        }
      })
      setHistogramImages(histograms)
    }
  }, [flowContent])

  const getPipelinesName = () => {
    console.log("expNames", expNames)
    if (selectedPipelines.length > 0){
      return selectedPipelines.map((_, index) => {
        console.log("option", "pipeline " + index)
        return { name: "pipeline " + (index + 1) };
      });
    }
  };


  return (
    <>
    {console.log("generated pipelines", generatedPipelines)}
      <Col className=" padding-0 results-Panel">
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div className="flex justify-content-center">
              <div className="gap-3 results-header">
                <div className="flex align-items-center">
                  <h5>Results</h5>
                </div>
              </div>
            </div>
            {/*Button to clean all results*/}
            <Button 
                  severity="danger"
                  rounded 
                  text
                  aria-label="Clean"
                  icon="pi pi-trash"
                  onClick={() => cleanResults()} 
                  style={{ width: 'fit-content', margin: 'auto' }}
                />
            <Button icon="pi pi-times" rounded text raised severity="danger" aria-label="Cancel" onClick={handleClose}/>
          </Card.Header>
          <Card.Body>
            {
              <Row className="form-group-box justify-content-center">
                {/*Button to compare*/}
                <Button 
                  label={compareMode? ("Compare Mode: ON") : ("Compare Mode: OFF")}
                  severity={compareMode? ("success") : ("danger")}
                  rounded 
                  raised 
                  icon="pi pi-power-off"
                  onClick={() => setCompareMode(!compareMode)} 
                  style={{ width: 'fit-content', margin: 'auto' }}
                />
                
                {/*Button to toggle metrics*/}
                {(compareMode) && (<Button 
                  label={showMetrics?  ("Hide Metrics") : ("Show Metrics")}
                  severity={showMetrics? ("info") : ("success")}
                  rounded 
                  raised 
                  icon={showMetrics? ("pi pi-eye-slash") : ("pi pi-eye")}
                  onClick={() => setShowMetrics(!showMetrics)} 
                  style={{ width: 'fit-content', margin: 'auto' }}
                />)}

                {/*Button to generate pipeline code*/}
                <Button 
                  label="Generate"
                  severity="secondary"
                  rounded 
                  raised 
                  icon="pi pi-code"
                  onClick={(e) => op.current.toggle(e)} 
                  style={{ width: 'fit-content', margin: 'auto' }}
                />
              </Row>
            }
            {compareMode ? (renderAccordionCompared(selectedResults, isResults)) : (renderAccordions(selectedResults, isResults))}
            {/*Code generation dialog*/}
            <OverlayPanel ref={op} showCloseIcon>
                {expNames.length > 0 ? (<div className="card justify-content-center gap-3">
                    <SelectButton
                      value={generatedPipelines} 
                      onChange={(e) => setGeneratedPipelines(e.value)} 
                      optionLabel="name" 
                      options={getPipelinesName()} 
                      multiple/>
                    
                    <Button 
                      label="Generate"
                      severity="secondary"
                      rounded 
                      raised 
                      onClick={() => generateCode()} 
                      style={{ width: 'fit-content', margin: 'auto' }}
                    /></div>) : 
                  (<Message severity="error" text="No pipelines detected"/>)}
            </OverlayPanel>
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}

export default ResultsPaneMEDimage
