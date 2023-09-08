import React from "react"

import AceEditor from "react-ace"

import "ace-builds/src-noconflict/mode-python"
import "ace-builds/src-noconflict/theme-tomorrow"
import "ace-builds/src-noconflict/ext-language_tools"

/**
 *
 * @returns {JSX.Element} A code editor
 */
const CodeEditor = () => {
  function onChange(value) {
    console.log("here is the current model value:", value)
  }

  return (
    <AceEditor
      mode="python"
      theme="tomorrow"
      fontSize={16}
      onChange={onChange}
      name="UNIQUE_ID_OF_DIV"
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      value={`def test_description(self):
  # TODO: write code...
  print("test1")`}
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2
      }}
    />
  )
}

export default CodeEditor
