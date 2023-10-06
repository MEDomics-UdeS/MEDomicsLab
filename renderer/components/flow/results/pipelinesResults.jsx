import React, { useEffect, useCallback, useState, useContext } from "react"
import { Accordion, AccordionTab } from "primereact/accordion"
import { deepCopy } from "../../../utilities/staticFunctions"
import DataParamResults from "../../learning/results/node/dataParamResults"
import ModelsResults from "../../learning/results/node/modelsResults"
import AnalyseResults from "../../learning/results/node/analyseResults"
import { SelectButton } from "primereact/selectbutton"
import MedDataObject from "../../workspace/medDataObject"
import { FlowResultsContext } from "../context/flowResultsContext"
import { FlowInfosContext } from "../context/flowInfosContext"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import * as Icon from "react-bootstrap-icons"
import { WorkspaceContext, EXPERIMENTS } from "../../workspace/workspaceContext"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import process from "process"

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

      if (selectedResults) {
        let type = selectedNode.data.internal.type
        if (type == "dataset" || type == "clean") {
          toReturn = <DataParamResults selectedResults={selectedResults} />
        } else if (type == "create_model" || type == "compare_models") {
          toReturn = <ModelsResults selectedResults={selectedResults} />
        } else if (type == "analyse") {
          toReturn = <AnalyseResults selectedResults={selectedResults} />
        }
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
  const { selectedResultsId, setSelectedResultsId, flowResults, showResultsPane } = useContext(FlowResultsContext)
  const { getBasePath } = useContext(WorkspaceContext)
  const { sceneName, experimentName } = useContext(FlowInfosContext)

  const [accordionActiveIndexStore, setAccordionActiveIndexStore] = useState([])
  const [accordionActiveIndex, setAccordionActiveIndex] = useState([])

  //when the selectionMode change, reset the selectedResultsId and the accordionActiveIndex
  useEffect(() => {
    setSelectedResultsId(null)
    setAccordionActiveIndex([])
  }, [selectionMode])

  // When the showResultsPane change, save the state of accordionActiveIndex and set it to [] if showResultsPane is false for performance purpose
  useEffect(() => {
    console.log("showResultsPane", showResultsPane)
    if (!showResultsPane) {
      setAccordionActiveIndexStore(accordionActiveIndex)
      setAccordionActiveIndex([])
    } else {
      setAccordionActiveIndex(accordionActiveIndexStore)
    }
  }, [showResultsPane])

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
      const codeGeneration = (e) => {
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
            finalCode = [...finalCode, ...nodeResults.results.code.content]
            console.log("imports", nodeResults.results.code.imports)
            finalImports = [...finalImports, ...nodeResults.results.code.imports]
            resultsCopy = nodeResults.next_nodes
          } else {
            console.log("id " + id + " not found in results")
            toast.error("Id not found in results")
          }
        })
        console.log("final code:")
        console.log(finalImports)
        createNoteBookDoc(finalCode, finalImports)
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
      const createNoteBookDoc = (code, imports) => {
        let newLineChar = process.platform === "linux" ? "\n" : ""
        let notebook = loadJsonPath([getBasePath(EXPERIMENTS), experimentName, sceneName, "notebooks", pipeline.map((id) => getName(id)).join("-")].join(MedDataObject.getPathSeparator()) + ".ipynb")
        notebook = notebook ? deepCopy(notebook) : deepCopy(loadJsonPath("./resources/emptyNotebook.ipynb"))
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
        addMarkdown(["## Notebook automatically generated\n\n", "**Experiment:** " + experimentName + "\n\n", "**Scene:** " + sceneName + "\n\n", "**Pipeline:** " + pipeline.map((id) => getName(id)).join(" ➡️ ") + "\n\n", "**Date:** " + new Date().toLocaleString() + "\n\n"])
        // IMPORTS
        addCode(imports.map((imp) => imp.content))
        // CODE
        let linesOfSameType = []
        code.forEach((line) => {
          if (line.type == lastType) {
            linesOfSameType.push(line.content + newLineChar)
          } else {
            compileLines(linesOfSameType)
            linesOfSameType = [line.content]
            lastType = line.type
          }
        })
        compileLines(linesOfSameType)

        MedDataObject.writeFileSync(notebook, [getBasePath(EXPERIMENTS), experimentName, sceneName, "notebooks"], pipeline.map((id) => getName(id)).join("-"), "ipynb").then(() => {
          toast.success("Notebook generated and saved !")
        })
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
        <AccordionTab key={index} header={createTitleFromPipe(pipeline)}>
          <PipelineResult key={index} pipeline={pipeline} selectionMode={selectionMode} flowContent={flowContent} />
        </AccordionTab>
      ))}
    </Accordion>
  )
}

export default PipelinesResults
