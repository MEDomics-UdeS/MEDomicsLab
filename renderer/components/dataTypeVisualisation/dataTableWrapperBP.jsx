import React, { useEffect, useState } from "react"
import { loadCSVPath } from "../../utilities/fileManagementUtils"
//data table
import { DataTable } from "primereact/datatable"
import { Column as PrimeColumn } from "primereact/column"
// refer to https://primereact.org/datatable/
import {
  Cell,
  Column,
  Table2,
  MenuContext,
  CopyCellsMenuItem,
  SelectionModes,
  Utils,
  ColumnHeaderCell,
  RenderMode,
  RegionCardinality
} from "@blueprintjs/table"
import { Menu, MenuItem } from "@blueprintjs/core"
import { Utils as danfoUtils } from "danfojs"
import { resolve } from "path"

const utils = new danfoUtils()

/**
 *
 * @param {Object} data data to display in the table
 * @param {Object} tablePropsData props to pass to the data
 * @param {Object} tablePropsColumn props to pass to the columns
 * @returns {JSX.Element} A JSX element containing the data table
 * @description This component is a wrapper for the primereact datatable. It is used to display data in a table.
 */
const DataTableWrapperBP = ({ data, tablePropsData, tablePropsColumn, customGetColumnsFromData }) => {
  // UseRef to get the table instance and then call the refresh method
  const tableRef = React.useRef(null)
  const [numRows, setNumRows] = useState(0)
  const [columns, setColumns] = useState([])
  const [columnNames, setColumnNames] = useState([])
  const [innerData, setInnerData] = useState([])
  const [sortedIndexMap, setSortedIndexMap] = useState([])
  const [rerender, setRerender] = useState(false)
  const [hasBeenLoaded, setHasBeenLoaded] = useState(false)

  const renderBodyContextMenu = (context) => {
    const { onCopy, onPaste } = context
    return (
      <Menu>
        <CopyCellsMenuItem onCopy={onCopy} />
        <MenuItem text="Custom item" icon="cog" onClick={onPaste} />
      </Menu>
    )
  }

  function getCellData(rowIndex, columnIndex) {
    // console.log("getCellData: ", sortedIndexMap)
    // console.log("getCellData: ", rowIndex, columnIndex, sortedIndexMap)
    const sortedRowIndex = sortedIndexMap[rowIndex]
    if (sortedRowIndex != null) {
      // console.log("getCellData: ", sortedRowIndex, columnIndex)
      rowIndex = sortedRowIndex
      return data[sortedRowIndex][columnIndex]
    } else {
      return data[rowIndex][columnIndex]
    }
  }

  const getColumnsNameANdTypeFromData = (data) => {
    if (data.length > 0) {
      let columnsNames = Object.keys(data[0])
      let columnsType = {}
      let firstTenRows = data.slice(0, 10)
      columnsNames.forEach((columnName) => {
        columnsType[columnName] = utils.inferDtype(firstTenRows.map((row) => row[columnName]))
      })
      return columnsType
    }
    return {}
  }

  const getCell = (rowIndex, columnName) => {
    if (sortedIndexMap != null) {
      let style = {}
      if (sortedIndexMap[rowIndex] != rowIndex) {
        // console.log("getCell: ", rowIndex, sortedIndexMap)
        style = { backgroundColor: "lightgrey" }
      }
      return <Cell style={style}>{getCellData(rowIndex, columnName)}</Cell>
    }
  }

  const getCellRenderer = (columnName) => {
    const cellRenderer = (rowIndex) => {
      // if (sortedIndexMap != null) {
      //   rowIndex = sortedIndexMap[rowIndex]
      // }
      // return <Cell>{innerData[rowIndex][columnName]}</Cell>
      return getCell(rowIndex, columnName)
    }
    cellRenderer.displayName = `CellRenderer(${columnName})`
    return cellRenderer
  }

  const getMenuRenderer = (columnIndex) => {
    const menuRenderer = () => {
      return sortMenu(columnIndex)
    }
    menuRenderer.displayName = `MenuRenderer(${columnIndex})`
    return menuRenderer
  }

  const setColumnsAccordingToType = (columnsNamesAndTypes) => {
    let columns = []
    let columnKeys = Object.keys(columnsNamesAndTypes)
    columnKeys.forEach((columnName, index) => {
      console.log("columnName: ", columnName)
      let newColumn = (
        <Column
          key={index}
          name={columnName}
          cellRenderer={getCellRenderer(columnName)}
          columnHeaderCellRenderer={() => <ColumnHeaderCell name={columnName} menuRenderer={getMenuRenderer(index)} />}
        />
      )
      columns.push(newColumn)
    })
    return columns
  }

  useEffect(() => {
    console.log("dataTable data refreshed: ", data)
    if (data != undefined && hasBeenLoaded == false) {
      setInnerData(data)
      // setSortedIndexMap(Utils.times(data.length, (i) => i))
      let columnsNamesAndTypes = getColumnsNameANdTypeFromData(data)
      console.log("Columns Names and Types: ", columnsNamesAndTypes)
      let columns = setColumnsAccordingToType(columnsNamesAndTypes)
      setColumnNames(Object.keys(columnsNamesAndTypes))
      setColumns(columns)
      setNumRows(data.length)
      setHasBeenLoaded(true)
    }
  }, [data])

  const handleColumnsReordered = (oldIndex, newIndex, length) => {
    console.log("handleColumnsReordered: ", oldIndex, newIndex, length)
    if (oldIndex === newIndex) {
      return
    }
    const newColumns = Utils.reorderArray(columns, oldIndex, newIndex, length)
    setColumns(newColumns)
  }

  const handleRowsReordered = (oldIndex, newIndex, length) => {
    console.log("handleRowsReordered: ", oldIndex, newIndex, length)
    if (oldIndex === newIndex) {
      return
    }
    let newSortedIndexMap = sortedIndexMap
    console.log("handleRowsReordered: ", newSortedIndexMap)
    ;[newSortedIndexMap[oldIndex], newSortedIndexMap[newIndex]] = [newSortedIndexMap[newIndex], newSortedIndexMap[oldIndex]]
    console.log("handleRowsReordered: ", newSortedIndexMap)
    // setSortedIndexMap(newSortedIndexMap)
    // setSortedIndexMap()
  }

  const sortColumn = (columnIndex, comparator) => {
    let data = innerData
    let sortedIndex = Utils.times(numRows, (i) => i)
    // console.log("sortedIndex: ", sortedIndex)
    let newSortedIndex = new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          sortedIndex.sort((a, b) => {
            return comparator(data[a][columnNames[columnIndex]] - 1 + 1, data[b][columnNames[columnIndex]] - 1 + 1)
          })
        )
      }, 0)
    })
    newSortedIndex.then((sortedIndex) => {
      console.log("sortedIndex: ", sortedIndex)
      setSortedIndexMap(newSortedIndex)
    })
  }

  const compare = (a, b) => {
    return a.toString().localeCompare(b.toString())
  }

  const compareNum = (a, b) => {
    return a - b
  }

  const sortMenu = (columnIndex) => {
    const sortAsc = () => sortColumn(columnIndex, (a, b) => compareNum(a, b))
    const sortDesc = () => sortColumn(columnIndex, (a, b) => compareNum(b, a))
    return (
      <>
        <Menu>
          <MenuItem icon="sort-asc" text="Sort Asc" onClick={sortAsc} />
          <MenuItem icon="sort-desc" text="Sort Desc" onClick={sortDesc} />
        </Menu>
      </>
    )
  }

  useEffect(() => {
    // console.log("HEY: ", sortedIndexMap)

    let rerenderCopy = !rerender
    setRerender(rerenderCopy)
  }, [sortedIndexMap])

  useEffect(() => {
    console.log("HEY: ", rerender)
    console.log("REF: ", tableRef)
  }, [rerender])

  return (
    <>
      <Table2
        ref={tableRef}
        bodyContextMenuRenderer={renderBodyContextMenu}
        numRows={numRows}
        selectionModes={[RegionCardinality.FULL_ROWS]}
        getCellClipboardData={getCellData}
        cellRendererDependencies={[sortedIndexMap, rerender]}
        enableFocusedCell={true}
        // renderMode={RenderMode.BATCH}
        enableRowHeader={true}
        enableRowReordering={true}
        enableColumnReordering={true}
        enableMultipleSelection={true}
        onColumnsReordered={handleColumnsReordered}
        onRowsReordered={handleRowsReordered}
        enableColumnHeader={true}
        rerender={rerender}
      >
        {columns}
      </Table2>
    </>
  )
}

export default DataTableWrapperBP
