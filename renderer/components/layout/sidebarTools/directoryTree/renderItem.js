import React, { useRef } from "react"
import { Folder } from "react-bootstrap-icons"
import DropzoneComponent from "../../../mainPages/dataComponents/dropzoneComponent"

/**
 * @param {string[]} classNames - list of class names
 * @returns {string} - concatenated class names
 * @abstract - filters out any falsy values and concatenates the rest
 */
const cx = (...classNames) => classNames.filter((cn) => !!cn).join(" ")

/**
 * @abstract - renders a single item in the tree
 * @param {Object} props
 * @param {Object} props.item - the item to render
 * @param {number} props.depth - the depth of the item in the tree
 * @param {React.ReactNode} props.children - the children of the item
 * @param {React.ReactNode} props.title - the title of the item
 * @param {React.ReactNode} props.arrow - the arrow of the item
 * @param {React.ReactNode} props.info - the info of the item
 * @param {Object} props.context - the context object passed by react-contexify
 * @param {Object} additionalParams - additional parameters passed by the tree
 * @param {Function} additionalParams.displayMenu - function to display the context menu
 * @returns {React.ReactNode} - the rendered item
 */
const renderItem = (
  { item, depth, children, title, context, arrow, info, ...test },
  additionalParams
) => {
  const InteractiveComponent = context.isRenaming ? "div" : "button"

  const type = context.isRenaming ? undefined : "button"

  return (
    <>
      {/* If the item is a folder, we render it as a dropzone */}
      {item.isFolder && (
        <DropzoneComponent item={item} noClick={true}>
          <li
            {...context.itemContainerWithChildrenProps}
            className={cx(
              "rct-tree-item-li",
              item.isFolder && "rct-tree-item-li-isFolder",
              context.isSelected && "rct-tree-item-li-selected",
              context.isExpanded && "rct-tree-item-li-expanded",
              context.isFocused && "rct-tree-item-li-focused",
              context.isDraggingOver && "rct-tree-item-li-dragging-over",
              context.isSearchMatching && "rct-tree-item-li-search-match"
            )}
          >
            <div
              {...context.itemContainerWithoutChildrenProps}
              style={{ paddingLeft: `${(depth + 1) * 8}px` }}
              className={cx(
                "rct-tree-item-title-container",
                item.isFolder && "rct-tree-item-title-container-isFolder",
                context.isSelected && "rct-tree-item-title-container-selected",
                context.isExpanded && "rct-tree-item-title-container-expanded",
                context.isFocused && "rct-tree-item-title-container-focused",
                context.isDraggingOver &&
                  "rct-tree-item-title-container-dragging-over",
                context.isSearchMatching &&
                  "rct-tree-item-title-container-search-match"
              )}
            >
              {arrow}

              <InteractiveComponent
                type={type}
                {...context.interactiveElementProps}
                className={cx(
                  "rct-tree-item-button",
                  item.isFolder && "rct-tree-item-button-isFolder",
                  context.isSelected && "rct-tree-item-button-selected",
                  context.isExpanded && "rct-tree-item-button-expanded",
                  context.isFocused && "rct-tree-item-button-focused",
                  context.isDraggingOver &&
                    "rct-tree-item-button-dragging-over",
                  context.isSearchMatching &&
                    "rct-tree-item-button-search-match"
                )}
                data={item}
                onContextMenu={(e) => {
                  console.log("onContextMenu", item)
                  additionalParams.displayMenu(e, item)
                }}
              >
                {item.isFolder && !context.isExpanded && <span>📁</span>}
                {item.isFolder && context.isExpanded && <span>📂</span>}
                {!item.isFolder && item.type == "csv" && <span>🛢️</span>}
                {!item.isFolder && item.type == "json" && <span>📗</span>}
                {!item.isFolder && item.type == "txt" && <span>📃</span>}
                {!item.isFolder && item.type == "pdf" && <span>📕</span>}
                {!item.isFolder && item.type == "medomics" && <span>⚛️</span>}
                {/* 📙📘📒📑📈 */}

                {/* {!item.isFolder && item.type != "csv" && <span>📄</span>} */}
                {title}
              </InteractiveComponent>
            </div>
            {children}
          </li>
        </DropzoneComponent>
      )}
      {item.isFolder == false && (
        <li
          {...context.itemContainerWithChildrenProps}
          className={cx(
            "rct-tree-item-li",
            item.isFolder && "rct-tree-item-li-isFolder",
            context.isSelected && "rct-tree-item-li-selected",
            context.isExpanded && "rct-tree-item-li-expanded",
            context.isFocused && "rct-tree-item-li-focused",
            context.isDraggingOver && "rct-tree-item-li-dragging-over",
            context.isSearchMatching && "rct-tree-item-li-search-match"
          )}
        >
          <div
            {...context.itemContainerWithoutChildrenProps}
            style={{ paddingLeft: `${(depth + 1) * 8}px` }}
            className={cx(
              "rct-tree-item-title-container",
              item.isFolder && "rct-tree-item-title-container-isFolder",
              context.isSelected && "rct-tree-item-title-container-selected",
              context.isExpanded && "rct-tree-item-title-container-expanded",
              context.isFocused && "rct-tree-item-title-container-focused",
              context.isDraggingOver &&
                "rct-tree-item-title-container-dragging-over",
              context.isSearchMatching &&
                "rct-tree-item-title-container-search-match"
            )}
          >
            {arrow}

            <InteractiveComponent
              type={type}
              {...context.interactiveElementProps}
              className={cx(
                "rct-tree-item-button",
                item.isFolder && "rct-tree-item-button-isFolder",
                context.isSelected && "rct-tree-item-button-selected",
                context.isExpanded && "rct-tree-item-button-expanded",
                context.isFocused && "rct-tree-item-button-focused",
                context.isDraggingOver && "rct-tree-item-button-dragging-over",
                context.isSearchMatching && "rct-tree-item-button-search-match"
              )}
              data={item}
              onContextMenu={(e) => {
                console.log("onContextMenu", item)
                additionalParams.displayMenu(e, item)
              }}
            >
              {item.isFolder && !context.isExpanded && <span>📁</span>}
              {item.isFolder && context.isExpanded && <span>📂</span>}
              {!item.isFolder && item.type == "csv" && <span>🛢️</span>}
              {!item.isFolder && item.type == "json" && <span>📗</span>}
              {!item.isFolder && item.type == "txt" && <span>📃</span>}
              {!item.isFolder && item.type == "pdf" && <span>📕</span>}
              {!item.isFolder && item.type == "medomics" && <span>⚛️</span>}
              {/* 📙📘📒📑📈 */}

              {/* {!item.isFolder && item.type != "csv" && <span>📄</span>} */}
              {title}
            </InteractiveComponent>
          </div>
          {children}
        </li>
      )}
    </>
  )
}

export default renderItem
