import React, { useState, useEffect, useContext } from "react"
import { Message } from "primereact/message"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { toast } from "react-toastify"
import { connectToMongoDB } from "../../mongoDB/mongoDBUtils"
import { DataContext } from "../../workspace/dataContext"
import { Card } from "primereact/card"

const ConvertCategoricalColumnIntoNumericDB = ({ currentCollection }) => {
  const { globalData } = useContext(DataContext)
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [categoricalColumns, setCategoricalColumns] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [originalData, setOriginalData] = useState([])
  const [modifiedColumns, setModifiedColumns] = useState([])
  const [highlightedColumns, setHighlightedColumns] = useState([])
  const [previousData, setPreviousData] = useState(null)
  const [previousColumns, setPreviousColumns] = useState(null)

  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoadingData(true)
    if (!currentCollection) {
      toast.warn("No collection selected.")
      return
    }

    try {
      const db = await connectToMongoDB()
      const collection = db.collection(globalData[currentCollection].id)

      const documents = await collection.find({}).limit(10).toArray()
      const cleanedDocuments = cleanData(documents) // Nettoyer les données

      setData(cleanedDocuments)
      setOriginalData(cleanedDocuments) // Stocker les données originales

      const allKeys = Object.keys(cleanedDocuments[0] || {}).filter((key) => key !== "_id")
      const columnStructure = allKeys.map((key) => ({
        field: key,
        header: key.charAt(0).toUpperCase() + key.slice(1)
      }))

      setColumns(columnStructure)
      identifyCategoricalColumns(allKeys, cleanedDocuments)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("An error occurred while fetching data.")
    } finally {
      setLoadingData(false)
    }
  }

  // Fonction pour nettoyer les données (convertir les objets complexes en chaînes)
  const cleanData = (documents) => {
    return documents.map((doc) => {
      const cleanedDoc = { ...doc }

      Object.keys(cleanedDoc).forEach((key) => {
        if (typeof cleanedDoc[key] === "object" && cleanedDoc[key] !== null) {
          cleanedDoc[key] = JSON.stringify(cleanedDoc[key])
        }
      })

      return cleanedDoc
    })
  }

  const markColumnAsModified = (column) => {
    setModifiedColumns((prev) => [...new Set([...prev, column])]) // Ajoute la colonne de manière unique
  }

  const isDataModified = () => {
    // Compare les deux tableaux pour vérifier les modifications
    return JSON.stringify(data) !== JSON.stringify(originalData)
  }

  // Identifier les colonnes catégoriques
  const identifyCategoricalColumns = (allKeys, documents) => {
    const detectedColumns = allKeys.filter((key) => {
      const uniqueValues = [...new Set(documents.map((doc) => doc[key]))]
      return uniqueValues.length <= 10 && uniqueValues.some((val) => isNaN(parseFloat(val)))
    })

    setCategoricalColumns(detectedColumns)
    toast.info(`${detectedColumns.length} categorical columns detected.`)
  }

  // Effectuer le One-Hot Encoding sur une colonne
  const oneHotEncodeColumn = (data, column) => {
    const uniqueValues = [...new Set(data.map((row) => row[column]))]

    return data.map((row) => {
      const encodedRow = { ...row }

      uniqueValues.forEach((value) => {
        encodedRow[`${value}`] = row[column] === value ? 1 : 0
      })

      delete encodedRow[column] // Supprimer la colonne originale si nécessaire
      return encodedRow
    })
  }

  // Convertir une colonne catégorique en One-Hot Encoding
  const convertColumnToOneHot = async (column) => {
    try {
      setPreviousData([...data]) // Copie des données actuelles
      setPreviousColumns([...columns]) // Copie des colonnes actuelles

      const encodedData = oneHotEncodeColumn(data, column)

      const uniqueValues = [...new Set(data.map((row) => row[column]))]
      const newColumns = uniqueValues.map((value) => ({
        field: `${value}`,
        header: `${value}`
      }))

      // Mettre à jour l'état des colonnes et des données
      setColumns((prevColumns) => [
        ...prevColumns.filter((col) => col.field !== column), // Supprime la colonne d'origine
        ...newColumns // Ajoute les colonnes encodées
      ])

      setData(encodedData)
      setHighlightedColumns(newColumns.map((col) => col.field))

      markColumnAsModified(column) // Marquer la colonne comme modifiée

      toast.success(`Column "${column}" has been one-hot encoded.`)
    } catch (error) {
      console.error("Error during One-Hot Encoding:", error)
      toast.error("An error occurred while encoding the column.")
    }
  }

  const undoChanges = () => {
    if (previousData && previousColumns) {
      setData(previousData) // Restaurer les données
      setColumns(previousColumns) // Restaurer les colonnes
      setHighlightedColumns([]) // Réinitialiser les colonnes mises en évidence
      setModifiedColumns([])
      toast.info("Changes have been undone.")
    } else {
      toast.warn("No changes to undo.")
    }
  }

  // Sauvegarder les données encodées dans MongoDB
  const saveEncodedDataToDB = async () => {
    try {
      const db = await connectToMongoDB()
      const collection = db.collection(globalData[currentCollection].id)

      // Supprimer les anciennes données et insérer les nouvelles
      await collection.deleteMany({})
      await collection.insertMany(data)

      toast.success("Encoded data has been saved to the database!")
    } catch (error) {
      console.error("Error saving encoded data:", error)
      toast.error("An error occurred while saving the data.")
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentCollection])

  // Rendu du composant
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px"
      }}
    >
      {loadingData && <Message severity="info" text="Loading..." style={{ marginBottom: "15px" }} />}
      <Message severity="info" text="This tool identifies categorical columns in your dataset and converts them to numeric using One-Hot Encoding." style={{ marginBottom: "15px" }} />
      <Message severity="success" text={`Current Collection: ${globalData[currentCollection]?.name || "None"}`} style={{ marginBottom: "15px" }} />
      {data.length > 0 && (
        <Card style={{ width: "900px" }}>
          <DataTable value={data} paginator rows={5} rowsPerPageOptions={[5, 10, 15]} className="p-datatable-gridlines">
            {columns.map((col) => (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                sortable
                style={{
                  color: categoricalColumns.includes(col.field) ? "red" : "inherit", // Rouge si catégorique
                  color: highlightedColumns.includes(col.field) ? "red" : "inherit"
                }}
                bodyStyle={{
                  color: highlightedColumns.includes(col.field) ? "red" : "inherit",
                  background: categoricalColumns.includes(col.field) ? "red" : "inherit" // Rouge pour les cellules si catégorique
                }}
              />
            ))}
          </DataTable>
        </Card>
      )}
      {categoricalColumns.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Categorical Columns</h4>
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px"
            }}
          >
            {modifiedColumns.length == 0 && (
              <span>
                {" "}
                {categoricalColumns.map((col, index) => (
                  <li key={index} style={{ marginBottom: "10px" }}>
                    <span style={{ marginRight: "10px" }}>Convert Categorical Column into Numeric :</span>
                    <Button label={col} onClick={() => convertColumnToOneHot(col)} style={{ marginLeft: "10px", marginTop: "5px", display: "inline-block" }} />
                  </li>
                ))}
              </span>
            )}
          </ul>
        </div>
      )}
      {modifiedColumns.length > 0 && <Button label={`Undo Changes:  ${modifiedColumns}`} className="p-button-danger" onClick={undoChanges} style={{ marginTop: "20px", marginRight: "10px" }} />}
      {isDataModified() && <Button label="Save Modified Date into MongoDB" className="p-button-success" onClick={saveEncodedDataToDB} style={{ marginTop: "20px" }} />}{" "}
    </div>
  )
}

export default ConvertCategoricalColumnIntoNumericDB
