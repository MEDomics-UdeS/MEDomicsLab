import React, { useEffect, useState, useRef } from "react"
import { toast } from "react-toastify"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism"
import ReactMarkdown from "react-markdown"
import fs from "fs"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-python"
import "ace-builds/src-noconflict/theme-tomorrow"
import { FaCopy, FaArrowUp, FaArrowDown, FaPlusCircle, FaPlusSquare, FaTrash } from "react-icons/fa"

const JupyterNotebookViewer = ({ path }) => {
  const [notebookContent, setNotebookContent] = useState(null)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState({})
  const editorRefs = useRef({})

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
    setEditMode((prev) => {
      const newEditMode = { ...prev, [index]: !prev[index] }
      if (!prev[index]) {
        // Focus the editor when entering edit mode
        setTimeout(() => {
          editorRefs.current[index]?.editor?.focus()
        }, 0)
      }
      return newEditMode
    })
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
              <AceEditor
                ref={(ref) => (editorRefs.current[index] = ref)} // Assign ref to the editor
                mode={isCodeCell ? "python" : "markdown"}
                theme="tomorrow"
                value={cellContent}
                onChange={(newContent) => handleCellChange(index, newContent)}
                onBlur={() => toggleEditMode(index)}
                name={`editor-${index}`}
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                  useWorker: false,
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true
                }}
                width="100%"
                height={`${Math.max(cellContent.split("\n").length * 1.5, 5)}em`}
                fontSize={14}
                style={{ border: "1px solid #ccc", borderRadius: "5px" }}
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
            padding: 2rem;
            overflow: auto;
            height: 100%;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 100%);
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
            background: rgba(255, 255, 255, 0.8);
            padding: 0.5rem;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            z-index: 1;
          }

          .cell-actions button {
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            padding: 0.25rem;
            border-radius: 3px;
            transition: background 0.3s, transform 0.3s;
          }

          .cell-actions button:hover {
            color: #333;
            background: #e0e0e0;
            transform: scale(1.05);
          }

          .cell {
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            position: relative;
            transition: box-shadow 0.3s;
          }

          .cell:hover {
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
            color: #d9534f;
            font-weight: bold;
            padding: 1rem;
            border: 1px solid #d9534f;
            border-radius: 5px;
            background-color: rgba(217, 83, 79, 0.1);
          }

          .loading-message {
            font-size: 1.2rem;
            color: #555;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
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
