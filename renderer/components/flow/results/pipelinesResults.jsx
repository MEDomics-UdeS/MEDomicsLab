import { randomUUID } from "crypto"
import Path from "path"
import { Accordion, AccordionTab } from "primereact/accordion"
import { Button } from "primereact/button"
import { SelectButton } from "primereact/selectbutton"
import process from "process"
import React, { useCallback, useContext, useEffect, useState } from "react"
import * as Icon from "react-bootstrap-icons"
import { toast } from "react-toastify"
import { getPathSeparator, loadJsonPath } from "../../../utilities/fileManagementUtils"
import { deepCopy } from "../../../utilities/staticFunctions"
import AnalyseResults from "../../learning/results/node/analyseResults"
import DataParamResults from "../../learning/results/node/dataParamResults"
import ModelsResults from "../../learning/results/node/modelsResults"
import SaveModelResults from "../../learning/results/node/saveModelResults"
import { connectToMongoDB, insertMEDDataObjectIfNotExists, updateMEDDataObjectUsedInList } from "../../mongoDB/mongoDBUtils"
import { MEDDataObject } from "../../workspace/NewMedDataObject"
import { EXPERIMENTS, WorkspaceContext } from "../../workspace/workspaceContext"
import { FlowInfosContext } from "../context/flowInfosContext"
import { FlowResultsContext } from "../context/flowResultsContext"

/**
 *
 * @param {Object} obj
 * @param {string} id
 * @returns the sub-object corresponding at the id in the obj
 * @description equivalent to obj[id] but the id can be a substring of the key
 */
const checkIfObjectContainsId = (obj, id) => {
  let res = false
  Object.keys(obj).forEach((key) => {
    if (key.includes(id)) {
      res = obj[key]
    }
  })
  return res
}

/**
 *
 * @param {Array} pipeline Pipeline to display
 * @param {string} selectionMode "Compare Mode" or "Normal Mode"
 * @param {Object} flowContent Content of the flow
 * @returns {JSX.Element} A PipelineResult component
 *
 * @description
 * This component takes a pipeline and displays the results related to the selected node.
 */
const PipelineResult = ({ pipeline, selectionMode, flowContent }) => {
  const { flowResults, selectedResultsId } = useContext(FlowResultsContext)
  const [body, setBody] = useState(<></>)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    setSelectedId(!selectedResultsId || selectionMode == "Compare Mode" ? selectedResultsId : selectedResultsId[pipeline.join("-")])
  }, [selectedResultsId])

  useEffect(() => {
    if (pipeline.length == 0) {
      setBody(<></>)
    } else {
      setBody(createBody())
    }
  }, [pipeline, selectedId])

  /**
   * @returns {JSX.Element} The body of the accordion tab
   *
   * @description
   * This function is used to create the body of the accordion tab.
   *
   * it is called when the pipeline, the selectedId, the flowContent or the flowResults change.
   */
  const createBody = useCallback(() => {
    let toReturn = <></>
    if (selectedId) {
      let selectedNode = flowContent.nodes.find((node) => node.id == selectedId)
      let resultsCopy = deepCopy(flowResults)
      let selectedResults = false
      pipeline.forEach((id) => {
        resultsCopy = checkIfObjectContainsId(resultsCopy, id)
        if (resultsCopy) {
          if (id == selectedId) {
            selectedResults = resultsCopy.results
          } else {
            resultsCopy = resultsCopy.next_nodes
          }
        } else {
          !selectedNode.data.internal.hasRun && (toReturn = <div className="pipe-name-notRun">Has not been run yet !</div>)
        }
      })
      console.log("selectedResults", selectedResults)
      if (selectedResults) {
        let type = selectedNode.data.internal.type
        console.log("type", type)
        if (type == "dataset" || type == "clean") {
          toReturn = <DataParamResults selectedResults={selectedResults} type={type}/>
        } else if (["train_model", "compare_models", "stack_models", "ensemble_model", "tune_model", "blend_models", "calibrate_model"].includes(type)) {
          toReturn = <ModelsResults selectedResults={selectedResults} />
        } else if (type == "analyze") {
          toReturn = <AnalyseResults selectedResults={selectedResults} />
        } else if (type == "save_model") {
          toReturn = <SaveModelResults selectedResults={selectedResults} />
        } else {
          toReturn = <div>Results not available for this node type</div>
        }
      } else {
        toReturn = <div className="pipe-name-notRun">Has not been run yet !</div>
      }
    }

    return toReturn
  }, [pipeline, flowResults, selectedId, flowContent])

  return <>{body}</>
}

/**
 *
 * @param {Array[Array]} pipelines Pipelines to display
 * @param {string} selectionMode "Compare Mode" or "Normal Mode"
 * @param {Object} flowContent Content of the flow
 * @returns {JSX.Element} A PipelinesResults component
 *
 * @description
 * This component takes all the selected pipelines and displays them in an accordion.
 */
const PipelinesResults = ({ pipelines, selectionMode, flowContent }) => {
  const { selectedResultsId, setSelectedResultsId, flowResults, showResultsPane, isResults } = useContext(FlowResultsContext)
  const { getBasePath } = useContext(WorkspaceContext)
  const { sceneName } = useContext(FlowInfosContext)

  const [accordionActiveIndexStore, setAccordionActiveIndexStore] = useState([])
  const [accordionActiveIndex, setAccordionActiveIndex] = useState([])
  const isProd = process.env.NODE_ENV === "production"

  //when the selectionMode change, reset the selectedResultsId and the accordionActiveIndex
  useEffect(() => {
    setSelectedResultsId(null)
    setAccordionActiveIndex([])
  }, [selectionMode])

  // When the showResultsPane change, save the state of accordionActiveIndex and set it to [] if showResultsPane is false for performance purpose
  useEffect(() => {
    if (!showResultsPane) {
      setAccordionActiveIndexStore(accordionActiveIndex)
      setAccordionActiveIndex([])
    } else {
      setAccordionActiveIndex(accordionActiveIndexStore)
    }
  }, [showResultsPane])

  /**
   * @param {Array} results The results of the pipeline
   * @param {string} notebookID The id of the notebook
   * @returns {boolean} true if the results are in the correct format, false otherwise
   * @description This function is used to lock the dataset to avoid the user to modify or delete it
   */
  const lockDataset = (results, notebookID) => {
    let datasetId = null
    if (!results) {
      // if results are null, return false
      toast.error("The results are not in the correct format")
      return false
    }
    // check if the results are in the correct format
    const isValidFormat = (results) => {
      let key = selectedResultsId ? selectedResultsId : Object.keys(results)[0]
      return results[key].results ? true : false
    }
    // get the dataset id
    if (isValidFormat(results)) {
      let key = selectedResultsId ? selectedResultsId : Object.keys(results)[0]
      if (results[key].results && results[key].results.data && results[key].results.data.paths) {
        if (results[key].results.data.paths[0].id) {
          datasetId = results[key].results.data.paths[0].id
        }
      }
    }
    // lock and update the dataset
    MEDDataObject.lockMedDataObject(datasetId)
    updateMEDDataObjectUsedInList(datasetId, notebookID)
  }

  /**
   * @returns {JSX.Element} The title of the accordion tab
   *
   * @description
   * This function is used to create the title of the accordion tab dynamically and with buttons control.
   */
  const createTitleFromPipe = useCallback(
    (pipeline) => {
      let pipelineId = pipeline.join("-")
      const getName = (id) => {
        let node = flowContent.nodes.find((node) => node.id == id)
        return node && node.data.internal.name
      }

      // check if the node is checked
      const isChecked = (id) => {
        let node = flowContent.nodes.find((node) => node.id == id)
        return node && node.data.internal.results.checked
      }

      // check if the node has run
      const hasRun = (id) => {
        let node = flowContent.nodes.find((node) => node.id == id)
        return node && node.data.internal.hasRun
      }

      // template for the button displayed in the select button
      const buttonTemplate = (option) => {
        return (
          <div className="pipeline-results-button">
            <span className={option.class}>{option.name}</span>
          </div>
        )
      }

      /**
       *
       * @param {Event} e click event
       * @returns {void}
       *
       * @description
       * This function is used to generate the notebook corresponding to the pipeline.
       * It first gets the code and the imports of each node in the pipeline and then call the createNoteBookDoc function.
       */
      const codeGeneration = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        let finalCode = []
        let finalImports = []
        console.log("code generation", pipeline)
        let resultsCopy = deepCopy(flowResults)
        console.log("resultsCopy", resultsCopy)
        pipeline.forEach((id) => {
          let nodeResults = checkIfObjectContainsId(resultsCopy, id)
          if (nodeResults) {
            finalCode = [...finalCode, ...Object.values(nodeResults.results.code.content)]
            console.log("imports", Object.values(nodeResults.results.code.imports))
            finalImports = [...finalImports, ...Object.values(nodeResults.results.code.imports)]
            resultsCopy = nodeResults.next_nodes
          } else {
            console.log("id " + id + " not found in results")
            toast.error("Id not found in results")
          }
        })
        console.log("final code:")
        console.log(finalImports)
        let notebookID = await createNoteBookDoc(finalCode, finalImports)
        lockDataset(flowResults, notebookID)  // Lock the dataset to avoid the user to modify or delete it
      }

      /**
       *
       * @param {List} code List of code lines
       * @param {List} imports List of imports
       * @returns {void}
       *
       * @description
       * This function is used to create the notebook document corresponding to the pipeline's code and imports.
       * It first loads the existing notebook or get an empty one and then fills it with the code and the imports.
       */
      const createNoteBookDoc = async (code, imports) => {
        let newLineChar = "\n" // before was process.platform === "linux" ? "\n" : ""
        let notebook = loadJsonPath([getBasePath(EXPERIMENTS), sceneName, "notebooks", pipeline.map((id) => getName(id)).join("-")].join(getPathSeparator()) + ".ipynb")
        notebook = notebook ? deepCopy(notebook) : deepCopy(loadJsonPath(isProd ? Path.join(process.resourcesPath, "baseFiles", "emptyNotebook.ipynb") : "./baseFiles/emptyNotebook.ipynb"))
        notebook.cells = []
        let lastType = "md"
        // This function is used to add a code cell to the notebook
        const addCode = (code) => {
          let cell = {
            // eslint-disable-next-line camelcase
            cell_type: "code",
            // eslint-disable-next-line camelcase
            execution_count: null,
            metadata: {},
            outputs: [],
            source: code
          }
          notebook.cells.push(cell)
        }

        // This function is used to add a markdown cell to the notebook
        const addMarkdown = (markdown) => {
          let cell = {
            // eslint-disable-next-line camelcase
            cell_type: "markdown",
            metadata: {},
            source: markdown
          }
          notebook.cells.push(cell)
        }

        // This function is used to compile the lines of the same type
        const compileLines = (lines) => {
          if (lastType == "code") {
            addCode(lines)
          } else if (lastType == "md") {
            addMarkdown(lines)
          }
        }
        // HEADER
        addMarkdown(["## Notebook automatically generated\n\n", "**Scene:** " + sceneName + "\n\n", "**Pipeline:** " + pipeline.map((id) => getName(id)).join(" ➡️ ") + "\n\n", "**Date:** " + new Date().toLocaleString() + "\n\n"])
        // IMPORTS
        addCode(imports.map((imp) => imp.content + newLineChar))
        // CODE
        let linesOfSameType = []
        code.forEach((line) => {
          if (line.type == lastType) {
            linesOfSameType.push(line.content + newLineChar)
          } else {
            compileLines(linesOfSameType)
            linesOfSameType = [line.content + newLineChar]
            lastType = line.type
          }
        })
        compileLines(linesOfSameType)

        // Save the notebook locally
        const pathToCreate = MEDDataObject.writeFileSync(
          notebook,
          [getBasePath(EXPERIMENTS), sceneName, "notebooks"],
          pipeline.map((id) => getName(id)).join("-"),
          "ipynb"
        )

        // Update the notebooks MEDDATAObject path
        const db = await connectToMongoDB()
        const collection = db.collection("medDataObjects")
        const notebooksFolder = await collection.findOne({ name: "notebooks", type: "directory" })
        await collection.updateOne({ id: notebooksFolder.id }, { $set: { path: pathToCreate } })

        // Save the notebook in the database
        const notebookObj = new MEDDataObject({
          id: randomUUID(),
          name: pipeline.map((id) => getName(id)).join("-") + ".ipynb",
          type: "ipynb",
          parentID: notebooksFolder.id,
          childrenIDs: [],
          path: pathToCreate,
          isLocked: false,
          inWorkspace: true
        })

        // Insert the notebook in the database
        let notebookID = await insertMEDDataObjectIfNotExists(notebookObj)
        MEDDataObject.updateWorkspaceDataObject()

        // If the file is written successfully, display the success toast
        toast.success("Notebook generated and saved locally!")

        return notebookID
      }

      return (
        <>
          <SelectButton
            className="results-select-button"
            value={selectionMode == "Compare Mode" ? selectedResultsId : selectedResultsId && selectedResultsId[pipelineId]}
            onChange={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (selectionMode == "Compare Mode") {
                setSelectedResultsId(e.value)
              } else {
                let newSelectedIds = { ...selectedResultsId }
                newSelectedIds[pipelineId] = e.value
                setSelectedResultsId(newSelectedIds)
              }
            }}
            optionLabel="name"
            options={pipeline.map((id) => {
              return {
                name: getName(id),
                value: id,
                class: `${isChecked(id) ? "checked" : "unchecked"} ${!hasRun(id) ? "pipe-name-notRun" : ""}`
              }
            })}
            itemTemplate={buttonTemplate}
          />
          <CodeGenBtn onClick={codeGeneration} />
        </>
      )
    },
    [selectedResultsId, setSelectedResultsId, selectionMode, flowContent]
  )

  /**
   *
   * @param {Function} onClick
   * @returns {JSX.Element} A CodeGenBtn component
   *
   * @description
   * This component is used to display a button to generate the notebook corresponding to the pipeline.
   */
  const CodeGenBtn = ({ onClick }) => {
    return (
      <Button className="code-generation-button" onClick={onClick}>
        <strong>
          Generate
          <Icon.CodeSlash style={{ marginLeft: "10px", fontSize: "1rem" }} />
        </strong>
      </Button>
    )
  }

  return (
    <Accordion multiple activeIndex={accordionActiveIndex} onTabChange={(e) => setAccordionActiveIndex(e.index)} className="pipeline-results-accordion">
      {pipelines.map((pipeline, index) => (
        <AccordionTab disabled={!isResults} key={index} header={createTitleFromPipe(pipeline)}>
          <PipelineResult key={index} pipeline={pipeline} selectionMode={selectionMode} flowContent={flowContent} />
        </AccordionTab>
      ))}
    </Accordion>
  )
}

export default PipelinesResults
