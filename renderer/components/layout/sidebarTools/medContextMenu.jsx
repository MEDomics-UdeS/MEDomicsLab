import {
  ContextMenu,
  ContextMenuChildrenProps,
  Menu,
  MenuItem
} from "@blueprintjs/core"
import React from "react"

const AdvancedContextMenuExample = (props, children) => {
  return (
    <ContextMenu
      content={
        <Menu>
          <MenuItem text="Save" />
          <MenuItem text="Save as..." />
          <MenuItem text="Delete..." intent="danger" />
        </Menu>
      }
    >
      {(ctxMenuProps) => (
        <div
          className="docs-context-menu-example"
          onContextMenu={ctxMenuProps.onContextMenu}
          ref={ctxMenuProps.ref}
        >
          {ctxMenuProps.popover}
          Right click me!
          {children}
        </div>
      )}
    </ContextMenu>
  )
}

export default AdvancedContextMenuExample
