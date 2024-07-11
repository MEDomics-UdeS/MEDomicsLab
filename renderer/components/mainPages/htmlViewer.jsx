import React, { useEffect, useState } from "react"
import { connectToMongoDB } from "../mongoDB/mongoDBUtils"

/**
 * @param config currently a MEDDataObject
 * @returns a page that shows the html content
 */
const HtmlViewer = ({ config }) => {
  //const [localPath, setLocalPath] = useState(undefined)
  const [htmlContent, setHtmlContent] = useState("")

  useEffect(() => {
    console.log(htmlContent)
  }, [htmlContent])

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const db = await connectToMongoDB()
        const collection = db.collection(config.id)
        const document = await collection.findOne({})

        if (document) {
          setHtmlContent(document.htmlContent)
        }
      } catch (error) {
        console.error("Error fetching HTML content:", error)
      }
    }
    fetchHtmlContent()
  }, [config])

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} width="100%" height="100%" />
    </>
  )
}

export default HtmlViewer
