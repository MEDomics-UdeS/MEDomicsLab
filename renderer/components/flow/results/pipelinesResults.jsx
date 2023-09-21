import React, { useEffect, useCallback, useState, useContext } from "react"
import { Accordion, AccordionTab } from "primereact/accordion"
import { deepCopy } from "../../../utilities/staticFunctions"
import DataParamResults from "../../learning/results/node/dataParamResults"
import ModelsResults from "../../learning/results/node/modelsResults"
import { SelectButton } from "primereact/selectbutton"

import { FlowResultsContext } from "../context/flowResultsContext"

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
  const [body, setBody] = useState(<></>)
  const { flowResults, selectedResultsId } = useContext(FlowResultsContext)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    console.log("selectedResultsId", selectedResultsId)
    setSelectedId(
      !selectedResultsId || selectionMode == "Compare Mode"
        ? selectedResultsId
        : selectedResultsId[pipeline.join("-")]
    )
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
          !selectedNode.data.internal.hasRun &&
            (toReturn = (
              <div className="pipe-name-notRun">Has not been run yet !</div>
            ))
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
  const { selectedResultsId, setSelectedResultsId } =
    useContext(FlowResultsContext)
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

      if (selectionMode == "Compare Mode") {
        return (
          <SelectButton
            value={selectedResultsId}
            onChange={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSelectedResultsId(e.value)
            }}
            optionLabel="name"
            options={pipeline.map((id) => {
              return {
                name: getName(id),
                value: id,
                class: `${isChecked(id) ? "checked" : "unchecked"} ${
                  !hasRun(id) ? "pipe-name-notRun" : ""
                }`
              }
            })}
            itemTemplate={buttonTemplate}
          />
        )
      } else {
        return (
          <SelectButton
            value={selectedResultsId && selectedResultsId[pipelineId]}
            onChange={(e) => {
              e.preventDefault()
              e.stopPropagation()
              let newSelectedIds = { ...selectedResultsId }
              newSelectedIds[pipelineId] = e.value
              setSelectedResultsId(newSelectedIds)
            }}
            optionLabel="name"
            options={pipeline.map((id) => {
              return {
                name: getName(id),
                value: id,
                class: `${isChecked(id) ? "checked" : "unchecked"} ${
                  !hasRun(id) ? "pipe-name-notRun" : ""
                }`
              }
            })}
            itemTemplate={buttonTemplate}
          />
        )
      }
    },
    [selectedResultsId, setSelectedResultsId, selectionMode, flowContent]
  )

  return (
    <Accordion
      multiple
      activeIndex={accordionActiveIndex}
      onTabChange={(e) => setAccordionActiveIndex(e.index)}
      className="pipeline-results-accordion"
    >
      {pipelines.map((pipeline, index) => (
        <AccordionTab key={index} header={createTitleFromPipe(pipeline)}>
          <PipelineResult
            key={index}
            pipeline={pipeline}
            selectionMode={selectionMode}
            flowContent={flowContent}
          />
        </AccordionTab>
      ))}
    </Accordion>
  )
}

export default PipelinesResults
