import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism"
import ReactMarkdown from "react-markdown"
import fs from "fs"
import { FaCopy, FaArrowUp, FaArrowDown, FaPlusCircle, FaPlusSquare, FaTrash } from "react-icons/fa"

const JupyterNotebookViewer = ({ path }) => {
  const [notebookContent, setNotebookContent] = useState(null)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState({})

  useEffect(() => {
    if (!path) return

    const readNotebook = () => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading notebook:", err)
          setError("Failed to load the notebook. Please check the path.")
          return
        }

        try {
          const jsonContent = JSON.parse(data)
          setNotebookContent(jsonContent)
          setError(null)
        } catch (err) {
          console.error("Error parsing notebook:", err)
          setError("Failed to parse the notebook. Please check the file.")
        }
      })
    }

    readNotebook()
  }, [path])

  const handleCellChange = (index, newContent) => {
    const updatedCells = [...notebookContent.cells]
    updatedCells[index].source = newContent.split("\n")
    setNotebookContent({ ...notebookContent, cells: updatedCells })
  }

  const saveNotebook = (cells = notebookContent?.cells) => {
    if (!notebookContent) return
    const data = JSON.stringify({ ...notebookContent, cells: cells || notebookContent.cells }, null, 2)
    fs.writeFile(path, data, (err) => {
      if (err) {
        console.error("Error saving notebook:", err)
        return
      }
      toast.success("Saved file successfully")
    })
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault()
        saveNotebook()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [notebookContent])

  const toggleEditMode = (index) => {
    setEditMode((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  // Cell operations
  const duplicateCell = (index) => {
    const newCells = [...notebookContent.cells]
    newCells.splice(index, 0, deepCopy(newCells[index]))
    setNotebookContent({ ...notebookContent, cells: newCells })
    saveNotebook(newCells)
  }

  const moveCellUp = (index) => {
    if (index === 0) return
    const newCells = [...notebookContent.cells]
    const temp = newCells[index - 1]
    newCells[index - 1] = newCells[index]
    newCells[index] = temp
    setNotebookContent({ ...notebookContent, cells: newCells })
    saveNotebook(newCells)
  }

  const moveCellDown = (index) => {
    if (index === notebookContent.cells.length - 1) return
    const newCells = [...notebookContent.cells]
    const temp = newCells[index + 1]
    newCells[index + 1] = newCells[index]
    newCells[index] = temp
    setNotebookContent({ ...notebookContent, cells: newCells })
    saveNotebook(newCells)
  }

  const insertCellAbove = (index, cellType = "code") => {
    const newCells = [...notebookContent.cells]
    newCells.splice(index, 0, {
      cell_type: cellType,
      metadata: {},
      source: [cellType === "code" ? "# New code cell" : "New markdown cell"]
    })
    setNotebookContent({ ...notebookContent, cells: newCells })
    saveNotebook(newCells)
  }

  const insertCellBelow = (index, cellType = "code") => {
    const newCells = [...notebookContent.cells]
    newCells.splice(index + 1, 0, {
      cell_type: cellType,
      metadata: {},
      source: [cellType === "code" ? "# New code cell" : "New markdown cell"]
    })
    setNotebookContent({ ...notebookContent, cells: newCells })
    saveNotebook(newCells)
  }

  const deleteCell = (index) => {
    if (notebookContent.cells.length <= 1) return
    const newCells = [...notebookContent.cells]
    newCells.splice(index, 1)
    setNotebookContent({ ...notebookContent, cells: newCells })
    saveNotebook(newCells)
  }

  const renderCells = () => {
    if (!notebookContent || !notebookContent.cells) return null

    return notebookContent.cells.map((cell, index) => {
      const cellContent = cell.source.join("\n")
      const isCodeCell = cell.cell_type === "code"

      return (
        <div key={index} className="cell-container">
          <div className="cell-actions">
            <button title="Duplicate cell" onClick={() => duplicateCell(index)}>
              <FaCopy />
            </button>
            <button title="Move cell up" onClick={() => moveCellUp(index)}>
              <FaArrowUp />
            </button>
            <button title="Move cell down" onClick={() => moveCellDown(index)}>
              <FaArrowDown />
            </button>
            <button title="Insert cell above" onClick={() => insertCellAbove(index)}>
              <FaPlusCircle />
            </button>
            <button title="Insert cell below" onClick={() => insertCellBelow(index)}>
              <FaPlusSquare />
            </button>
            <button title="Delete cell" onClick={() => deleteCell(index)}>
              <FaTrash />
            </button>
          </div>

          <div className={`cell ${isCodeCell ? "code-cell" : "markdown-cell"}`}>
            {editMode[index] ? (
              <textarea
                value={cellContent}
                onChange={(e) => handleCellChange(index, e.target.value)}
                onBlur={() => toggleEditMode(index)}
                className="cell-editor"
                autoFocus
                style={{ height: `${cellContent.split("\n").length * 1.5}rem` }} // Dynamically adjust height
              />
            ) : isCodeCell ? (
              <div onClick={() => toggleEditMode(index)}>
                <SyntaxHighlighter language="python" style={coy}>
                  {cellContent}
                </SyntaxHighlighter>
              </div>
            ) : (
              <div onClick={() => toggleEditMode(index)} className="markdown-render">
                <ReactMarkdown>{cellContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="notebook-viewer">
      <style>
        {`
          .notebook-viewer {
            padding: 1rem;
            overflow: auto;
            height: 100%;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
          }

          .notebook-content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .cell-container {
            position: relative;
            padding-top: 2rem;
          }

          .cell-actions {
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            gap: 0.5rem;
            background: #f5f5f5;
            padding: 0.5rem; /* Add padding for spacing */
            border: 1px solid #ddd; /* Add a subtle border */
            border-radius: 5px; /* Match the cell's border radius */
            z-index: 1;
          }

          .cell-actions button {
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            padding: 0.25rem;
            border-radius: 3px;
          }

          .cell-actions button:hover {
            color: #333;
            background: #e0e0e0;
          }

          .cell {
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            position: relative;
          }

          .code-cell {
            background-color: #f9f9f9;
          }

          .markdown-cell {
            background-color: #fefefe;
          }

          .cell-editor {
            width: 100%;
            min-height: 100px;
            margin-top: 0.5rem;
            font-family: monospace;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 0.5rem;
            resize: vertical;
          }

          .markdown-render {
            padding: 0.5rem;
            background-color: #fefefe;
            border: 1px solid #ddd;
            border-radius: 5px;
          }

          .error-message {
            color: red;
            font-weight: bold;
          }

          .loading-message {
            font-size: 1.2rem;
            color: #555;
          }
        `}
      </style>
      {error && <p className="error-message">{error}</p>}
      {notebookContent ? <div className="notebook-content">{renderCells()}</div> : <p className="loading-message">Loading Jupyter Notebook...</p>}
    </div>
  )
}

// Helper function to deep copy objects
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default JupyterNotebookViewer
