import React from "react"
import { useContextMenu, Menu, Item, Separator } from "react-contexify"

const MENU_ID = "💩"

const SidebarContextMenu = ({ children }) => {
  const { show } = useContextMenu({
    id: MENU_ID
  })

  function displayMenu(e) {
    show({ event: e, props: { key: "value" } })
  }

  function handleItemClick({ id, props, data, triggerEvent }) {
    // ⚠️ data and triggerEvent are not used. I've just added them so we have the full list of parameters

    // I use the id attribute defined on the `Item` to identify which one is it
    // this feel natural to my brain
    switch (id) {
      case "remove":
        // logic to remove the row
        break
      case "share":
        // logic to share
        break
      case "email":
        //logic to send email
        break
      case "sponsor":
        //logic to open sponsor page
        break
    }
  }

  return (
    <div>
      {children}
      <Menu id={MENU_ID}>
        <Item id="remove" onClick={handleItemClick}>
          Remove row
        </Item>
        <Separator />
        <Item id="share" onClick={handleItemClick}>
          Share
        </Item>
        <Item
          id="email"
          onClick={handleItemClick}
          className={styles.itemContent}
        >
          Send email
        </Item>
        <Item id="sponsor" onClick={handleItemClick}>
          Sponsor my work
        </Item>
      </Menu>
    </div>
  )
}
