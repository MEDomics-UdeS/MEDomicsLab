import React from "react"
import DropzoneComponent from "../../../mainPages/dataComponents/dropzoneComponent"
import myimage from "../../../../../resources/medomics.svg"

const iconExtension = {
  folder: (isExpanded) => (isExpanded ? <span>📂</span> : <span>📁</span>),
  csv: <span>🛢️</span>,
  json: <span>📑</span>,
  txt: <span>📃</span>,
  pdf: <span>📕</span>,
  medomics: (
    <span>
      <img src={myimage} style={{ width: "20px", height: "20px" }} />
    </span>
  ),
  medml: <span>⚛️</span>
  // 📗📙📘📒📑📈📊🧮🎯💊🧬🔬🧰💾📄🗒️💥
}

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
const renderItem = ({ item, depth, children, title, context, arrow }, additionalParams) => {
  const InteractiveComponent = context.isRenaming ? "div" : "button"

  const type = context.isRenaming ? undefined : "button"

  return (
    <>
      {/* If the item is a folder, we render it as a dropzone */}
      {item.isFolder && (
        <>
          <DropzoneComponent className="sidebar-dropzone-dirtree" item={item} noClick={true}>
            <li {...context.itemContainerWithChildrenProps} className={cx("rct-tree-item-li", item.isFolder && "rct-tree-item-li-isFolder", context.isSelected && "rct-tree-item-li-selected", context.isExpanded && "rct-tree-item-li-expanded", context.isFocused && "rct-tree-item-li-focused", context.isDraggingOver && "rct-tree-item-li-dragging-over", context.isSearchMatching && "rct-tree-item-li-search-match")}>
              <div {...context.itemContainerWithoutChildrenProps} style={{ paddingLeft: `${(depth + 1) * 12}px` }} className={cx("rct-tree-item-title-container", item.isFolder && "rct-tree-item-title-container-isFolder", context.isSelected && "rct-tree-item-title-container-selected", context.isExpanded && "rct-tree-item-title-container-expanded", context.isFocused && "rct-tree-item-title-container-focused", context.isDraggingOver && "rct-tree-item-title-container-dragging-over", context.isSearchMatching && "rct-tree-item-title-container-search-match")}>
                <div className="folder-bracket" style={{ left: `${(depth + 1) * 12 + 8}px`, backgroundColor: `${additionalParams.isHovering ? "" : "#ffffff00"}`, width: "1px", transition: "all 0.5s ease-in-out" }}></div>

                {arrow}

                <InteractiveComponent
                  type={type}
                  {...context.interactiveElementProps}
                  className={cx("rct-tree-item-button", item.isFolder && "rct-tree-item-button-isFolder", context.isSelected && "rct-tree-item-button-selected", context.isExpanded && "rct-tree-item-button-expanded", context.isFocused && "rct-tree-item-button-focused", context.isDraggingOver && "rct-tree-item-button-dragging-over", context.isSearchMatching && "rct-tree-item-button-search-match")}
                  data={item}
                  onContextMenu={(e) => {
                    console.log("onContextMenu", item.index)
                    additionalParams.displayMenu(e, item)
                  }}
                >
                  {iconExtension.folder(context.isExpanded)}
                  {title}
                </InteractiveComponent>
              </div>
              {children}
            </li>
          </DropzoneComponent>
        </>
      )}
      {!item.isFolder && (
        <>
          <li {...context.itemContainerWithChildrenProps} className={cx("rct-tree-item-li", item.isFolder && "rct-tree-item-li-isFolder", context.isSelected && "rct-tree-item-li-selected", context.isExpanded && "rct-tree-item-li-expanded", context.isFocused && "rct-tree-item-li-focused", context.isDraggingOver && "rct-tree-item-li-dragging-over", context.isSearchMatching && "rct-tree-item-li-search-match")}>
            <div {...context.itemContainerWithoutChildrenProps} style={{ paddingLeft: `${(depth + 1) * 8}px` }} className={cx("rct-tree-item-title-container", item.isFolder && "rct-tree-item-title-container-isFolder", context.isSelected && "rct-tree-item-title-container-selected", context.isExpanded && "rct-tree-item-title-container-expanded", context.isFocused && "rct-tree-item-title-container-focused", context.isDraggingOver && "rct-tree-item-title-container-dragging-over", context.isSearchMatching && "rct-tree-item-title-container-search-match")}>
              {/* {arrow} */}

              <InteractiveComponent
                type={type}
                {...context.interactiveElementProps}
                className={cx("rct-tree-item-button", item.isFolder && "rct-tree-item-button-isFolder", context.isSelected && "rct-tree-item-button-selected", context.isExpanded && "rct-tree-item-button-expanded", context.isFocused && "rct-tree-item-button-focused", context.isDraggingOver && "rct-tree-item-button-dragging-over", context.isSearchMatching && "rct-tree-item-button-search-match", !item.isFolder && "rct-tree-item-isNotFolder")}
                data={item}
                onContextMenu={(e) => {
                  console.log("onContextMenu", title)
                  additionalParams.displayMenu(e, item)
                }}
                onDoubleClick={(e) => {
                  console.log("onDoubleClick", title)
                  additionalParams.onDBClickItem(e, item)
                }}
              >
                {iconExtension[item.type]}
                {/* {!item.isFolder && item.type != "csv" && <span>📄</span>} */}
                {title}
              </InteractiveComponent>
            </div>
            {children}
          </li>
        </>
      )}
    </>
  )
}

export default renderItem
