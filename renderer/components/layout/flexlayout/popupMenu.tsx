import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { DragDrop } from "flexlayout-react"

/** @hidden @internal */
/**
 * Shows a popup menu
 * @param title the title of the popup
 * @param layoutDiv the div that the popup is attached to
 * @param x the x coordinate of the popup
 * @param y the y coordinate of the popup
 * @param items the list of menu items
 * @param onSelect the callback when a menu item is selected 
 */
export function showPopup(title: string, layoutDiv: HTMLDivElement, x: number, y: number, items: string[], onSelect: (item: string | undefined) => void) {
  const currentDocument = layoutDiv.ownerDocument
  const layoutRect = layoutDiv.getBoundingClientRect()

  const elm = currentDocument.createElement("div")
  elm.className = "popup_menu_container"
  // Check if the popup is in the left half of the screen
  if (x < layoutRect.left + layoutRect.width / 2) {
    elm.style.left = x - layoutRect.left + "px"
  } else {
    elm.style.right = layoutRect.right - x + "px"
  }
  // Check if the popup is in the top half of the screen
  if (y < layoutRect.top + layoutRect.height / 2) {
    elm.style.top = y - layoutRect.top + "px"
  } else {
    elm.style.bottom = layoutRect.bottom - y + "px"
  }

  // add glass pane
  DragDrop.instance.addGlass(() => onHide(undefined))
  DragDrop.instance.setGlassCursorOverride("default")
  layoutDiv.appendChild(elm)

  // hide popup when item is selected
  const onHide = (item: string | undefined) => {
    DragDrop.instance.hideGlass()
    onSelect(item)
    layoutDiv.removeChild(elm)
    root.unmount()
    elm.removeEventListener("mousedown", onElementMouseDown)
    currentDocument.removeEventListener("mousedown", onDocMouseDown)
  }

  // prevent drag drop from occurring
  const onElementMouseDown = (event: Event) => {
    event.stopPropagation()
  }

  // hide if clicked on doc
  const onDocMouseDown = (event: Event) => {
    onHide(undefined)
  }

  elm.addEventListener("mousedown", onElementMouseDown)
  currentDocument.addEventListener("mousedown", onDocMouseDown)

  const root = ReactDOM.createRoot(elm)
  root.render(<PopupMenu currentDocument={currentDocument} onHide={onHide} title={title} items={items} />)
}


/** @hidden @internal */
/**
 * Interface for the PopupMenu props
 * @internal
 * @param title the title of the popup
 * @param items the list of menu items
 * @param currentDocument the current document
 * @param onHide the callback when a menu item is selected
 * @returns An interface for the PopupMenu props
 */
interface IPopupMenuProps {
  title: string
  items: string[]
  currentDocument: Document
  onHide: (item: string | undefined) => void
}

/** @hidden @internal */
/**
 * PopupMenu React component
 * @internal
 * @param props Contains the title, items, and onHide callback
 * @returns A React component
 */
const PopupMenu = (props: IPopupMenuProps) => {
  const { title, items, onHide } = props

  const onItemClick = (item: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    onHide(item)
    event.stopPropagation()
  }

  const itemElements = items.map((item) => (
    <div key={item} className="popup_menu_item" onClick={(event) => onItemClick(item, event)}>
      {item}
    </div>
  ))

  return (
    <div className="popup_menu">
      <div className="popup_menu_title">{title}</div>
      {itemElements}
    </div>
  )
}
