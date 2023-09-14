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

const PipelineResult = ({ pipeline, selectedId }) => {
  const [body, setBody] = useState(<></>)
  const [what2show, setWhat2show] = useState("")
  const { flowResults } = useContext(FlowResultsContext)
  const { flowContent } = useContext(FlowInfosContext)

  useEffect(() => {
    if (pipeline.length == 0) {
      setBody(<></>)
    } else {
      console.log("pipeline result update", pipeline)
      setBody(createBody())
    }
  }, [pipeline])

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

      let selectedResults = deepCopy(flowResults)
      pipeline.forEach((id) => {
        selectedResults = checkIfObjectContainsId(selectedResults, id)
        if (selectedResults) {
          if (id == selectedId) {
            selectedResults = selectedResults.results
          } else {
            selectedResults = selectedResults.next_nodes
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
  }, [pipeline, flowResults, selectedId])

  return <>{body}</>
}

const PipelinesResults = ({ pipelines }) => {
  const { flowContent } = useContext(FlowInfosContext)
  const [selectedId, setSelectedId] = useState(null)

  const createTitleFromPipe = (pipeline) => {
    const getName = (id) => {
      let node = flowContent.nodes.find((node) => node.id == id)
      return node.data.internal.name
    }
    let items = []
    pipeline.forEach((id) => {
      items.push({ name: getName(id), value: id })
    })
    return (
      <SelectButton
        value={selectedId}
        onChange={(e) => setSelectedId(e.value)}
        optionLabel="name"
        options={items}
      />
    )
  }

  return (
    <Accordion multiple>
      {pipelines.map((pipeline, index) => (
        <AccordionTab key={index} header={createTitleFromPipe(pipeline)}>
          <PipelineResult
            key={index}
            pipeline={pipeline}
            selectedId={selectedId}
          />
        </AccordionTab>
      ))}
    </Accordion>
  )
}

export default PipelinesResults
