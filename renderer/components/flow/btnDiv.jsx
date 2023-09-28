import React from "react"
import { Button } from "react-bootstrap"
import * as Icon from "react-bootstrap-icons"
import { TfiSave } from "react-icons/tfi"

/**
 *
 * @param {List} buttonList List of buttons to display
 * @description This component is used to display a list of buttons
 * @example
 * <BtnDiv buttonsList={[{type: 'clear', onClick: () => {}}]}/>
 */
const BtnDiv = ({ buttonsList }) => {
  return (
    <>
      {buttonsList.map((button) => {
        return buttonType[button.type](button.onClick)
      })}
    </>
  )
}
export default BtnDiv

// This is the list of buttons that can be displayed
// Each button has a type and an onClick function
// You can add more buttons here
const buttonType = {
  clear: (onClear) => {
    return (
      <Button key="clear" variant="outline margin-left-10 padding-5" onClick={onClear}>
        <Icon.Trash width="30px" height="30px" />
      </Button>
    )
  },
  save: (onSave) => {
    return (
      <Button key="save" variant="outline margin-left-10 padding-5" onClick={onSave}>
        <TfiSave width="30px" height="30px" />
      </Button>
    )
  },
  download: (onDownload) => {
    return (
      <Button key="download" variant="outline margin-left-10 padding-5" onClick={onDownload}>
        <Icon.Upload width="30px" height="30px" />
      </Button>
    )
  },
  load: (onLoad) => {
    return (
      <Button key="load" variant="outline margin-left-10 padding-5" onClick={onLoad}>
        <Icon.Download width="30px" height="30px" />
      </Button>
    )
  },
  run: (onRun) => {
    return (
      <Button key="run" variant="outline margin-left-10 padding-5" onClick={onRun}>
        <Icon.PlayCircle width="30px" height="30px" />
      </Button>
    )
  },
  back: (onBack) => {
    return (
      <Button key="back" variant="outline margin-left-10 padding-5" onClick={onBack}>
        <Icon.Backspace width="30px" height="30px" />
      </Button>
    )
  }
}
