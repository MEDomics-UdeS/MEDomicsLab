import React, { use, useContext, useEffect, useState } from "react"

import { Button, Popover, Menu, MenuItem } from "@blueprintjs/core"
import { Tag } from "react-bootstrap-icons"
import { DataContext } from "../workspace/dataContext"
import { ColumnHeaderCell } from "@blueprintjs/table"
import { DataTablePopoverBP } from "./dataTablePopoverBPClass"

const DataTableHeaderCell = (props: any) => {
  return (
    // <ColumnHeaderCell name={props.name} menuRenderer={props.menuRenderer}>
    //   <DataTablePopoverBP config={props.config} category={props.category} />
    // </ColumnHeaderCell>
  )
}

export { DataTableHeaderCell }
