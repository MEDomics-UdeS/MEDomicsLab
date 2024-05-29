import { SelectButton } from "primereact/selectbutton"
import React, { useContext, useEffect, useState } from "react"
import { Button, Card } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { FlowResultsContext } from "../flow/context/flowResultsContext"
import { ConfusionMatrix } from "react-confusion-matrix"
import FlInput from "./flInput"
import { DataTable } from "primereact/datatable"
import { Column } from "@blueprintjs/table"
import FlCompareResults from "./flCompareResults"

export default function FlResultsPane() {
  // state
  const [activeConfig, setActiveConfig] = useState("Config 1")
  const [resultsType, setResultsType] = useState("Global results")

  const [globalflresults, setglobalflresults] = useState({
    confusionMatrix: [
      [0, 0],
      [0, 0]
    ]
  })
  const [nodeflresults, setnodeflresults] = useState({
    confusionMatrix: [
      [0, 0],
      [0, 0]
    ]
  })

  const [selectedNode, setNode] = useState("Client 1")

  // context
  const { isResults, flowResults } = useContext(FlowResultsContext) // used to update the flow infos

  let res = {
    data: {
      results: [0.5599962207105064, 0.5599962207105064, 0.5599962207105064, 0.5599962207105064],
      test_results: [
        {
          node_name: "Client 1",
          classification_report:
            "{'confusion matrix': {'TP': 17, 'FP': 7, 'FN': 161, 'TN': 890}, 'Accuracy': 0.844, 'Sensitivity/Recall': 0.096, 'Specificity': 0.992, 'PPV/Precision': 0.708, 'NPV': 0.847, 'F1-score': 0.168, 'False positive rate': 0.008, 'True positive rate': 0.096, 'auc': 0.5479313066025328}"
        },
        {
          node_name: "Client 2",
          classification_report:
            "{'confusion matrix': {'TP': 13, 'FP': 3, 'FN': 167, 'TN': 892}, 'Accuracy': 0.842, 'Sensitivity/Recall': 0.072, 'Specificity': 0.997, 'PPV/Precision': 0.812, 'NPV': 0.842, 'F1-score': 0.133, 'False positive rate': 0.003, 'True positive rate': 0.072, 'auc': 0.5467349472377405}"
        },
        {
          node_name: "Client 3",
          classification_report:
            "{'confusion matrix': {'TP': 68, 'FP': 28, 'FN': 859, 'TN': 4416}, 'Accuracy': 0.835, 'Sensitivity/Recall': 0.073, 'Specificity': 0.994, 'PPV/Precision': 0.708, 'NPV': 0.837, 'F1-score': 0.133, 'False positive rate': 0.006, 'True positive rate': 0.073, 'auc': 0.5393507797381679}"
        }
      ]
    },
    stringFromBackend: "The configuration is set up"
  }
  const getGlobalresults = () => {
    let results = res["data"]["test_results"]

    let acc = 0
    let sensRec = 0
    let spec = 0
    let ppv = 0
    let npv = 0
    let f1score = 0
    let fpr = 0
    let tpr = 0
    let auc = 0

    let TP = 0
    let FP = 0
    let TN = 0
    let FN = 0

    results.map((result) => {
      let classReport = result["classification_report"]

      classReport = JSON.parse(classReport.replace(/'/g, '"'))
      TP += classReport["confusion matrix"]["TP"]
      FP += classReport["confusion matrix"]["FP"]
      TN += classReport["confusion matrix"]["TN"]
      FN += classReport["confusion matrix"]["FN"]

      acc += classReport["Accuracy"]
      sensRec += classReport["Sensitivity/Recall"]
      spec += classReport["Specificity"]
      ppv += classReport["PPV/Precision"]
      npv += classReport["NPV"]
      f1score += classReport["F1-score"]
      fpr += classReport["False positive rate"]
      tpr += classReport["True positive rate"]
      auc += classReport["auc"]
    })

    let confusionMatrix = [
      [TN, FP],
      [FN, TP]
    ]

    return {
      confusionMatrix: confusionMatrix,
      Accuracy: (acc / results.length).toFixed(4),
      SensitivityRecall: (sensRec / results.length).toFixed(4),
      Specificity: (spec / results.length).toFixed(4),
      PPV: (ppv / results.length).toFixed(4),
      NPV: (npv / results.length).toFixed(4),
      F1score: (f1score / results.length).toFixed(4),
      FPR: (fpr / results.length).toFixed(4),
      TPR: (tpr / results.length).toFixed(4),
      auc: (auc / results.length).toFixed(4)
    }
  }

  const getNodeResults = (nodeName) => {
    let results = res["data"]["test_results"]

    let confusionMatrix
    let acc = 0
    let sensRec = 0
    let spec = 0
    let ppv = 0
    let npv = 0
    let f1score = 0
    let fpr = 0
    let tpr = 0
    let auc = 0

    results.map((result) => {
      if (result["node_name"] == nodeName) {
        let classReport = result["classification_report"]
        classReport = JSON.parse(classReport.replace(/'/g, '"'))
        let TP = classReport["confusion matrix"]["TP"]
        let FP = classReport["confusion matrix"]["FP"]
        let TN = classReport["confusion matrix"]["TN"]
        let FN = classReport["confusion matrix"]["FN"]

        acc = classReport["Accuracy"]
        sensRec = classReport["Sensitivity/Recall"]
        spec = classReport["Specificity"]
        ppv = classReport["PPV/Precision"]
        npv = classReport["NPV"]
        f1score = classReport["F1-score"]
        fpr = classReport["False positive rate"]
        tpr = classReport["True positive rate"]
        auc = classReport["auc"]

        confusionMatrix = [
          [TN, FP],
          [FN, TP]
        ]
      }
    })

    return {
      confusionMatrix: confusionMatrix,
      Accuracy: acc.toFixed(4),
      SensitivityRecall: sensRec.toFixed(4),
      Specificity: spec.toFixed(4),
      PPV: ppv.toFixed(4),
      NPV: npv.toFixed(4),
      F1score: f1score.toFixed(4),
      FPR: fpr.toFixed(4),
      TPR: tpr.toFixed(4),
      auc: auc.toFixed(4)
    }
  }

  useEffect(() => {
    if (resultsType == "Global results") {
      setglobalflresults(getGlobalresults())
    } else {
      if (resultsType == "By node") {
        setnodeflresults(getNodeResults(selectedNode))
      }
    }
  }, [resultsType, activeConfig, selectedNode])

  return (
    <div>
      <Card>
        <Card.Header>
          <div className="flex justify-content-center">
            <div className="gap-3 results-header">
              <div className="flex align-items-center">
                <h5>FL Pipeline results</h5>
              </div>
            </div>
          </div>
          <Button variant="outline closeBtn closeBtn-resultsPane end-5" onClick={() => {}}>
            <Icon.X width="30px" height="30px" />
          </Button>
        </Card.Header>
        <Card.Body>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <SelectButton value={activeConfig} onChange={(e) => setActiveConfig(e.value)} options={["Config 1", "Config 2"]} />
            {resultsType == "By node" && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: "200px" }}>
                  <FlInput
                    name="select node"
                    settingInfos={{
                      type: "list",
                      tooltip: "Specify the number of federated rounds",
                      choices: res["data"]["test_results"].map((r) => {
                        return { name: r["node_name"] }
                      })
                    }}
                    currentValue={selectedNode}
                    onInputChange={(e) => {
                      setNode(e.value)
                    }}
                    setHasWarning={() => {}}
                  />
                </div>
              </div>
            )}{" "}
            <SelectButton value={resultsType} onChange={(e) => setResultsType(e.value)} options={["Global results", "By node", "Compare results"]} />
          </div>

          {resultsType == "Compare results" ? (
            <div className="my-3">
              <FlCompareResults data={res["data"]["test_results"]} />
            </div>
          ) : (
            <>
              <div style={{ marginTop: "30px" }}>
                {globalflresults["confusionMatrix"] && (
                  <ConfusionMatrix data={resultsType === "Global results" ? globalflresults["confusionMatrix"] : nodeflresults["confusionMatrix"]} labels={["True labels", "False labels"]} />
                )}
              </div>

              {globalflresults && (
                <DataTable value={resultsType === "Global results" ? [globalflresults] : [nodeflresults]} tableStyle={{ minWidth: "50rem" }}>
                  <Column field="auc" header="AUC"></Column>
                  <Column field="Accuracy" header="Accuracy"></Column>
                  <Column field="SensitivityRecall" header="Sensitivity Recall"></Column>
                  <Column field="Specificity" header="Specificity"></Column>
                  <Column field="PPV" header="PPV"></Column>
                  <Column field="NPV" header="NPV"></Column>
                  <Column field="F1score" header="F1score"></Column>
                  <Column field="FPR" header="FPR"></Column>
                  <Column field="TPR" header="TPR"></Column>
                </DataTable>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
