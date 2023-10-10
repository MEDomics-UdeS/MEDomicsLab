import React,  { useEffect } from "react"

/**
 * 
 * @param {Djanfojs Dataframe} dataframe data to extract
 * @param {Function} setExtractionJsonData function setting data to send to the extraction_ts server
 * @param {Function} setMayProceed function setting the boolean variable mayProceed, telling if the process can be executed
 * @returns {JSX.Element} sub-component of the ExtractionTabularData component
 * 
 * @description 
 * This component is displayed in the ExtractionTabularData component when the user choose "BioBERT"
 * extraction type. It is used to prepare text notes extraction using BioBERT pre-trained model.
 * 
 */
const ExtractionBioBERT = ({setMayProceed}) => {

  /**
   * 
   * @description
   * This function enable the extraction button.
   * 
   */
   useEffect(() => {
    setMayProceed(true)
  }, [])


  return (
    <>
    biobert
    </>
  )
}

export default ExtractionBioBERT