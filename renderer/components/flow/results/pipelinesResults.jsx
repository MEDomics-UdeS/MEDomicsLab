import React, { useEffect, useCallback, useState, useContext } from "react"
import { Accordion, AccordionTab } from "primereact/accordion"
import { deepCopy } from "../../../utilities/staticFunctions"
import DataParamResults from "../../learning/results/node/dataParamResults"
import ModelsResults from "../../learning/results/node/modelsResults"
import { SelectButton } from "primereact/selectbutton"
import MedDataObject from "../../workspace/medDataObject"
import { FlowResultsContext } from "../context/flowResultsContext"
import { FlowInfosContext } from "../context/flowInfosContext"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import * as Icon from "react-bootstrap-icons"
import { WorkspaceContext, EXPERIMENTS } from "../../workspace/workspaceContext"
import { loadJsonPath } from "../../../utilities/fileManagementUtils"

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
    console.log("selectedResultsId", selectedResultsId)
    setSelectedId(!selectedResultsId || selectionMode == "Compare Mode" ? selectedResultsId : selectedResultsId[pipeline.join("-")])
  }, [selectedResultsId])

  useEffect(() => {
    if (pipeline.length == 0) {
      setBody(<></>)
    } else {
      console.log("pipeline result update", pipeline)
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
          console.log("id " + selectedId + " not found in results")
          !selectedNode.data.internal.hasRun && (toReturn = <div className="pipe-name-notRun">Has not been run yet !</div>)
        }
      })
      console.log("selected results", selectedResults, selectedNode)
      if (selectedResults) {
        let type = selectedNode.data.internal.type
        if (type == "dataset" || type == "clean") {
          toReturn = <DataParamResults selectedResults={selectedResults} />
        } else if (type == "create_model" || type == "compare_models") {
          console.log("create model / compare models")
          toReturn = <ModelsResults selectedResults={selectedResults} />
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
  const { selectedResultsId, setSelectedResultsId, flowResults } = useContext(FlowResultsContext)
  const { getBasePath } = useContext(WorkspaceContext)
  const { sceneName, experimentName } = useContext(FlowInfosContext)

  const [accordionActiveIndex, setAccordionActiveIndex] = useState([])

  useEffect(() => {
    setSelectedResultsId(null)
    setAccordionActiveIndex([])
  }, [selectionMode])

  useEffect(() => {
    console.log("accordionActiveIndex", accordionActiveIndex)
  }, [accordionActiveIndex])

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

      const isChecked = (id) => {
        let node = flowContent.nodes.find((node) => node.id == id)
        return node && node.data.internal.results.checked
      }

      const hasRun = (id) => {
        let node = flowContent.nodes.find((node) => node.id == id)
        return node && node.data.internal.hasRun
      }

      const buttonTemplate = (option) => {
        return (
          <div className="pipeline-results-button">
            <span className={option.class}>{option.name}</span>
          </div>
        )
      }

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
            finalCode = nodeResults.results.code.content
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

      const createNoteBookDoc = (code, imports) => {
        let notebook = loadJsonPath([getBasePath(EXPERIMENTS), experimentName, sceneName, "notebooks", pipeline.map((id) => getName(id)).join("-")].join(MedDataObject.getPathSeparator()) + ".ipynb")
        // (notebook) ? (notebook = deepCopy(notebook)) : (notebook = deepCopy(loadJsonPath("./resources/emptyNotebook.ipynb")))
        notebook = notebook ? deepCopy(notebook) : deepCopy(loadJsonPath("./resources/emptyNotebook.ipynb"))
        notebook.cells = []

        console.log("baseNb", notebook)
        let lastType = "md"
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

        const addMarkdown = (markdown) => {
          let cell = {
            // eslint-disable-next-line camelcase
            cell_type: "markdown",
            metadata: {},
            source: markdown
          }
          notebook.cells.push(cell)
        }

        const compileLines = (lines) => {
          if (lastType == "code") {
            addCode(lines)
          } else if (lastType == "md") {
            addMarkdown(lines)
          }
        }
        // HEADER
        addMarkdown(["## Notebook automatically generated\n\n", "**Experiment:** " + experimentName + "\n\n", "**Scene:** " + sceneName + "\n\n", "**Pipeline:** " + pipeline.map((id) => getName(id)).join(" -> ") + "\n\n", "**Date:** " + new Date().toLocaleString() + "\n\n"])
        // IMPORTS

        addCode(imports.map((imp) => imp.content))
        // CODE
        let linesOfSameType = []
        code.forEach((line) => {
          console.log("lastType", lastType)
          if (line.type == lastType) {
            linesOfSameType.push(line.content)
          } else {
            compileLines(linesOfSameType)
            linesOfSameType = [line.content]
            lastType = line.type
          }
        })
        compileLines(linesOfSameType)

        console.log("notebook", notebook)
        MedDataObject.writeFileSync(notebook, [getBasePath(EXPERIMENTS), experimentName, sceneName, "notebooks"], pipeline.map((id) => getName(id)).join("-"), "ipynb").then((res) => {
          console.log("res", res)
          toast.success("Notebook generated !")
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
