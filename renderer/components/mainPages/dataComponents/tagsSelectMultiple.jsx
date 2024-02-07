import React, { useState, useEffect, useContext } from "react"
import { DataContext } from "../../workspace/dataContext"
import { Form } from "react-bootstrap"
import { MultiSelect } from 'primereact/multiselect';

/**
 * @typedef {React.FunctionComponent} WsSelectMultiple
 * @description This component is used to select a data file from the workspace (DataContext). The data file is then used in the flow.
 * @params props.selectedPath - The path of the selected data file
 * @params props.onChange - The function to call when the selected data file changes
 * @params props.name - The name of the component
 */
const TagsSelectMultiple = ({ key, onChange, selectedTags, selectedDatasets, disabled, placeholder }) => {
  const [tagsList, setTagsList] = useState([])
  const [localTags, setLocalTags] = useState([])

  useEffect(() => {
    console.log(selectedTags)
    if(selectedTags !== undefined && Array.isArray(selectedTags)) {
      setLocalTags(selectedTags)
    }
  }, [selectedTags])



  /**
   * @description This useEffect is used to generate the dataset list from the global data context if it's defined
   * @returns {void} calls the generateDatasetListFromDataContext function
   */
  useEffect(() => {
    if(Array.isArray(selectedDatasets) && selectedDatasets.length > 0) {
      let tags = []
      selectedDatasets.forEach((dataset) => {
        console.log("selectedDataset", dataset)
          tags = tags.concat(dataset.tags)
      })
      tags = [...new Set(tags)]
      let tagsToShow = tags.map((tag) => {
        return { name: tag, value: tag }
      })
      setTagsList(tagsToShow)
      console.log("tagsToShow", tagsToShow)
    } else {
      setTagsList([])
    }
    
  }, [selectedDatasets])

return (
  <>
    {
      
      <MultiSelect
        key={key}
        disabled={tagsList.length == 0 || disabled}
        placeholder={placeholder}
        value={localTags} 
        onChange={(e) => {
          console.log("tagsSelectMultiple", e)
          onChange(e.target.value)
        }} 
        options={tagsList} 
        optionLabel="name" display="chip"
      />
    }
  </>
)
    
}

export default TagsSelectMultiple
