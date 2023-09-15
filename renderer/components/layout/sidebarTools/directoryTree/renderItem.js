import React, { useRef } from "react"
import { Folder } from "react-bootstrap-icons"

const cx = (...classNames) => classNames.filter((cn) => !!cn).join(" ")

const renderItem = (
  { item, depth, children, title, context, arrow, info, ...test },
  additionalParams
) => {
  const InteractiveComponent = context.isRenaming ? "div" : "button"

  const type = context.isRenaming ? undefined : "button"

  // TODO have only root li component create all the classes
  return (
    <>
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
            {!item.isFolder && item.type != "csv" && <span>📄</span>}
            {title}
          </InteractiveComponent>
        </div>
        {children}
      </li>
    </>
  )
}

export default renderItem
