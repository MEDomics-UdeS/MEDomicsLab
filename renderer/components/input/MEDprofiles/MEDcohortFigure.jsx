import { loadJsonPath } from "../../../utilities/fileManagementUtils"
import React, { useEffect, useState } from "react"


const MEDcohortFigure = ({ jsonFilePath }) => {
    const [jsonData, setJsonData] = useState(null)


    useEffect(() => {
        setJsonData(loadJsonPath(jsonFilePath))
    }, [])

    useEffect(() => {
        console.log("JSON data", jsonData)
    }, [jsonData])
  
    return (
      <>
      MEDcohortFigure
      { jsonFilePath }
      </>
    )
  }
  
  export default MEDcohortFigure