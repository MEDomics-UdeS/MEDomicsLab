import * as React from "react"

import { Menu, MenuItem, Intent, HotkeysTarget2, HotkeysDialog2 } from "@blueprintjs/core"

// import { Example, ExampleProps } from "@blueprintjs/docs-theme"
import {
  Cell,
  Column,
  ColumnHeaderCell,
  CopyCellsMenuItem,
  MenuContext,
  SelectionModes,
  Table2,
  Utils,
  EditableCell2
} from "@blueprintjs/table"
import { waitUntilSymbol } from "next/dist/server/web/spec-extension/fetch-event"

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const sumo: any[] = require("./sumo.json")

export type CellLookup = (rowIndex: number, columnIndex: number) => any
export type SortCallback = (columnIndex: number, comparator: (a: any, b: any) => number) => void

export interface SortableColumn {
  getColumn(getCellRenderer: CellLookup, getCellData: CellLookup, sortColumn: SortCallback): JSX.Element
}

abstract class AbstractSortableColumn implements SortableColumn {
  constructor(
    protected name: string,
    protected index: number
  ) {}

  public getColumn(getCellRenderer: CellLookup, getCellData: CellLookup, sortColumn: SortCallback) {
    // const cellRenderer = (rowIndex: number, columnIndex: number) => <Cell>{getCellData(rowIndex, columnIndex)}</Cell>
    const menuRenderer = this.renderMenu.bind(this, sortColumn)
    const columnHeaderCellRenderer = () => <ColumnHeaderCell name={this.name} menuRenderer={menuRenderer} />
    return (
      <Column
        cellRenderer={getCellRenderer}
        columnHeaderCellRenderer={columnHeaderCellRenderer}
        key={this.index}
        name={this.name}
      />
    )
  }

  protected abstract renderMenu(sortColumn: SortCallback): JSX.Element
}

class TextSortableColumn extends AbstractSortableColumn {
  protected renderMenu(sortColumn: SortCallback) {
    const sortAsc = () => sortColumn(this.index, (a, b) => this.compare(a, b))
    const sortDesc = () => sortColumn(this.index, (a, b) => this.compare(b, a))
    return (
      <Menu>
        <MenuItem icon="sort-asc" onClick={sortAsc} text="Sort Asc" />
        <MenuItem icon="sort-desc" onClick={sortDesc} text="Sort Desc" />
      </Menu>
    )
  }

  private compare(a: any, b: any) {
    return a.toString().localeCompare(b)
  }
}

class NumericalSortableColumn extends AbstractSortableColumn {
  protected renderMenu(sortColumn: SortCallback) {
    const sortAsc = () => sortColumn(this.index, (a, b) => this.compare(a, b))
    const sortDesc = () => sortColumn(this.index, (a, b) => this.compare(b, a))
    return (
      <>
        <Menu>
          <MenuItem icon="sort-asc" onClick={sortAsc} text="Sort Asc" />
          <MenuItem icon="sort-desc" onClick={sortDesc} text="Sort Desc" />
        </Menu>
        <Menu></Menu>
      </>
    )
  }

  private compare(a: any, b: any) {
    return parseFloat(a) - parseFloat(b)
  }
}

export class DataTableWrapperBPClass extends React.PureComponent<{}, {}> {
  data: any
  ref: React.RefObject<unknown>
  constructor(props) {
    super(props)
    console.log("props", props)
    this.ref = React.createRef()
    //React.createRef()
  }

  public state = {
    columnsNames: [] as string[], // this.getColumnNames(this.props.data),
    columns: [] as SortableColumn[],
    data: this.props.data as any[],
    sortedIndexMap: [] as number[],
    columnIndexMap: [] as number[],
    sparseCellData: {} as { [key: string]: string },
    sparseCellIntent: {} as { [key: string]: Intent }
  }

  public getData() {
    let data = this.data
    console.log(data)
  }

  public getColumnNames(data: any) {
    let columnsNames = Object.keys(data[0])
    return columnsNames
  }

  public componentDidMount() {
    if (!this.props.data) {
      return
    }
    let columnsNames = Object.keys(this.props.data[0])
    let newColumns = []
    let newColumnIndexMap = []
    columnsNames.forEach((columnName, index) => {
      newColumns.push(new NumericalSortableColumn(columnName, index))
      newColumnIndexMap.push(index)
    })
    this.state.columnsNames = columnsNames
    this.state.columns = newColumns
    this.setState({ data: this.props.data })
    this.setState({ columnsNames: columnsNames, columns: newColumns, columnIndexMap: newColumnIndexMap })
    console.log("componentDidMount", this.state.data, this.state.sortedIndexMap)
  }

  public componentDidUpdate(prevProps: any, prevState: any) {
    if (prevProps !== this.props) {
      //   if (!this.props.data) {
      this.setState({ data: this.props.data })
      let columnsNames = Object.keys(this.props.data[0])
      let newColumns = []
      let newColumnIndexMap = []
      columnsNames.forEach((columnName, index) => {
        newColumns.push(new NumericalSortableColumn(columnName, index))
        newColumnIndexMap.push(index)
      })
      this.setState({ columnsNames: columnsNames, columns: newColumns, columnIndexMap: newColumnIndexMap })
      //   }
    }
    if (prevState !== this.state) {
      if (prevState.data !== this.state.data) {
        this.setState({ data: this.state.data })
      }
      if (prevState.columns !== this.state.columns) {
        this.setState({ columns: this.state.columns })
      }
    }

    // console.log("componentDidUpdate", this.state.data, this.state.sortedIndexMap)
  }

  public render() {
    const { data } = this.state
    if (!data) {
      return <div>Loading...</div>
    }

    const numRows = this.state.data.length
    const columns = this.state.columns.map((col) => col.getColumn(this.getCellRenderer, this.getCellData, this.sortColumn))
    return (
      <HotkeysTarget2 hotkeys={[]}>
        <Table2
          //   ref={this.ref}
          bodyContextMenuRenderer={this.renderBodyContextMenu}
          numRows={numRows}
          getCellClipboardData={this.getCellData}
          cellRendererDependencies={[this.state.sortedIndexMap, this.state.columnIndexMap]}
          enableFocusedCell={true}
          enableMultipleSelection={true}
          enableRowReordering={true}
          onRowsReordered={this.handleRowsReordered}
          onColumnsReordered={this.handleColumnsReordered}
          enableColumnReordering={true}
        >
          {columns}
        </Table2>
      </HotkeysTarget2>
    )
  }

  private handleColumnsReordered = (oldIndex: number, newIndex: number, length: number) => {
    if (oldIndex === newIndex) {
      return
    }
    const nextChildren = Utils.reorderArray(this.state.columns, oldIndex, newIndex, length)
    const nextColumnIndexMap = Utils.reorderArray(this.state.columnIndexMap, oldIndex, newIndex, length)
    this.setState({ columns: nextChildren, columnIndexMap: nextColumnIndexMap })
  }

  private handleRowsReordered = (oldIndex: number, newIndex: number, length: number) => {
    if (oldIndex === newIndex) {
      return
    }
    let newSortedIndexMap = Utils.times(this.state.data.length, (i: number) => i)
    if (this.state.sortedIndexMap.length === 0) {
      this.setState({ sortedIndexMap: Utils.reorderArray(newSortedIndexMap, oldIndex, newIndex, length) })
    } else {
      this.setState({ sortedIndexMap: Utils.reorderArray(this.state.sortedIndexMap, oldIndex, newIndex, length) })
    }
  }

  private getCellData = (rowIndex: number, columnIndex: number) => {
    const sortedRowIndex = this.state.sortedIndexMap[rowIndex]
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex
    }
    return this.state.data[rowIndex][this.state.columnsNames[this.state.columnIndexMap[columnIndex]]]
  }

  private getIntent = (rowIndex: number, columnIndex: number) => {}

  private getCellRenderer = (rowIndex: number, columnIndex: number) => {
    return (
      <EditableCell2
        value={this.getCellData(rowIndex, columnIndex)}
        onCancel={this.cellValidator(rowIndex, columnIndex)}
        onChange={this.cellValidator(rowIndex, columnIndex)}
        onConfirm={this.cellSetter(rowIndex, columnIndex)}
      ></EditableCell2>
    )
  }

  private dataKey = (rowIndex: number, columnIndex: number) => {
    const sortedRowIndex = this.state.sortedIndexMap[rowIndex]
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex
    }
    return `${rowIndex}-${this.state.columnsNames[columnIndex]}`
  }

  private cellValidator = (rowIndex: number, columnIndex: number) => {
    const dataKey = this.dataKey(rowIndex, columnIndex)
    return (value: string) => {
      const intent = this.isValidValue(value) ? null : Intent.DANGER
      this.setSparseState("sparseCellIntent", dataKey, intent)
      this.setSparseState("sparseCellData", dataKey, value)
    }
  }

  private cellSetter = (rowIndex: number, columnIndex: number) => {
    const dataKey = this.dataKey(rowIndex, columnIndex)
    return (value: string) => {
      //   const intent = this.isValidValue(value) ? null : Intent.DANGER
      this.setSparseState("sparseCellData", dataKey, value)
      //   this.setSparseState("sparseCellIntent", dataKey, intent)
    }
  }

  private renderBodyContextMenu = (context: MenuContext) => {
    return (
      <Menu>
        <CopyCellsMenuItem context={context} getCellData={this.getCellData} text="Copy" />
      </Menu>
    )
  }

  private sortColumn = (columnIndex: number, comparator: (a: any, b: any) => number) => {
    const { data, columnsNames } = this.state
    const sortedIndexMap = Utils.times(data.length, (i: number) => i)
    sortedIndexMap.sort((a: number, b: number) => {
      return comparator(data[a][columnsNames[columnIndex]], data[b][columnsNames[columnIndex]])
    })
    this.setState({ sortedIndexMap })
    // console.log("sortColumn", this.state)
  }

  private isValidValue(value: string) {
    return /^[a-zA-Z]*$/.test(value)
  }

  private setSparseState<T>(stateKey: string, dataKey: string, value: T) {
    const stateData = (this.state as any)[stateKey] as { [key: string]: T }
    const values = { ...stateData, [dataKey]: value }
    this.setState({ [stateKey]: values })
  }
}

export default DataTableWrapperBPClass
