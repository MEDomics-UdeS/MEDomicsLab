import React, { useEffect, useCallback, useState, useContext } from "react"
import Parameters from "./utilities/parameters"
import DataTablePath from "./utilities/dataTablePath"
import { Accordion, AccordionTab } from "primereact/accordion"
import { ScrollPanel } from "primereact/scrollpanel"
import { deepCopy } from "../../../utilities/staticFunctions"
import DataParamResults from "./node/dataParamResults"
import ModelsResults from "./node/modelsResults"
import { SelectButton } from "primereact/selectbutton"

import { FlowInfosContext } from "../../flow/context/flowInfosContext"
import { FlowResultsContext } from "../../flow/context/flowResultsContext"

const PipelineResult = ({ pipeline, selectionMode }) => {
  const [body, setBody] = useState(<></>)
  const { flowResults, selectedResultsId } = useContext(FlowResultsContext)
  const { flowContent } = useContext(FlowInfosContext)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    console.log("selectedResultsId", selectedResultsId)
    // let pipelineId = pipeline.join("-")
    // if (selectedResultsId) {
    //   if (selectedResultsId[pipelineId]) {
    //     setSelectedId(selectedResultsId[pipelineId])
    //   } else {
    //     setSelectedId(selectedResultsId)
    //   }
    // } else {
    //   setSelectedId(null)
    // }

    setSelectedId(
      !selectedResultsId || selectionMode == "Compare Mode"
        ? selectedResultsId
        : selectedResultsId[pipeline.join("-")]
    )
  }, [selectedResultsId])

  useEffect(() => {
    console.log("selectedId", selectedId)
  }, [selectedId])

  useEffect(() => {
    if (pipeline.length == 0) {
      setBody(<></>)
    } else {
      console.log("pipeline result update", pipeline)
      setBody(createBody())
    }
  }, [pipeline, selectedId])

  // check if object render
  useEffect(() => {
    console.log("rendered")
  }, [])

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
    console.log("selectedId", selectedId)
    if (selectedId) {
      // let selectedId = what2show.split("/")[what2show.split("/").length - 1]
      let selectedNode = flowContent.nodes.find((node) => node.id == selectedId)
      console.log("selectedId", selectedId)
      console.log("selectedNode", selectedNode)
      console.log("flowResults", flowResults)
      let resultsCopy = deepCopy(flowResults)
      let selectedResults = false
      pipeline.forEach((id) => {
        console.log("id", id)
        resultsCopy = checkIfObjectContainsId(resultsCopy, id)
        console.log("resultsCopy", resultsCopy)
        if (resultsCopy) {
          if (id == selectedId) {
            selectedResults = resultsCopy.results
          } else {
            resultsCopy = resultsCopy.next_nodes
          }
        } else {
          console.log("id " + selectedId + " not found in results")
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

const PipelinesResults = ({ pipelines, selectionMode }) => {
  const { flowContent } = useContext(FlowInfosContext)
  // const [selectedId, setSelectedId] = useState(null)
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

  const createTitleFromPipe = useCallback(
    (pipeline) => {
      let pipelineId = pipeline.join("-")
      const getName = (id) => {
        let node = flowContent.nodes.find((node) => node.id == id)
        return node.data.internal.name
      }

      const isChecked = (id) => {
        let node = flowContent.nodes.find((node) => node.id == id)
        return node.data.internal.results.checked
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
                class: isChecked(id) ? "checked" : "unchecked"
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
                class: isChecked(id) ? "checked" : "unchecked"
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
    // <ScrollPanel style={{ width: "100%", height: "60vh" }}>
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
          />
        </AccordionTab>
      ))}
    </Accordion>
    // </ScrollPanel>
  )
}

export default PipelinesResults
