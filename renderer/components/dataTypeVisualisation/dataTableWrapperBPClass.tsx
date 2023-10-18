import * as React from "react"
import { Button } from "primereact/button"
import { Menu, MenuItem, Intent, HotkeysTarget2, Divider, Collapse } from "@blueprintjs/core"
import xlxs from "xlsx"
import { Column, ColumnHeaderCell, CopyCellsMenuItem, MenuContext, Table2, Utils, EditableCell2 } from "@blueprintjs/table"
import { Stack } from "react-bootstrap"
import { ChevronRight, FiletypeCsv, FiletypeJson, FiletypeXlsx } from "react-bootstrap-icons"
import { PiFloppyDisk } from "react-icons/pi"
import { toast } from "react-toastify"
const dfd = require("danfojs-node")
import { DataFrame, Utils as danfoUtils } from "danfojs-node"
import { DataTablePopoverBP } from "./dataTablePopoverBPClass"
const dfUtils = new danfoUtils()
// eslint-disable-next-line @typescript-eslint/no-var-requires

export type CellLookup = (rowIndex: number, columnIndex: number) => any // function that returns the cell data
export type SortCallback = (columnIndex: number, comparator: (a: any, b: any) => number) => void // function that sorts the column
export type FilterCallback = (columnIndex: number, filterValue: string) => void // function that filters the column

export interface SortableColumn {
  // interface for the sortable column
  getColumn(
    getCellRenderer: CellLookup,
    getCellData: CellLookup,
    sortColumn: SortCallback,
    filterColumn: FilterCallback
  ): JSX.Element
}

/**
 * @description This class is used to create a sortable column
 * @abstract This class is abstract and cannot be instantiated
 * @implements SortableColumn
 * @class AbstractSortableColumn - This class is used to create a sortable column
 */
abstract class AbstractSortableColumn implements SortableColumn {
  /**
   * @description This is the constructor for the AbstractSortableColumn class
   * @param name - name of the column
   * @param index - index of the column
   * @param category - category of the column
   * @param config - config of the column
   * @returns void
   */
  constructor(
    protected name: string,
    protected index: number,
    protected category?: string,
    protected config: { [key: string]: any } = {}
  ) {}

  /**
   * @description This function returns the column
   * @param getCellRenderer - function that returns the cell renderer
   * @param getCellData - function that returns the cell data
   * @param sortColumn - function that sorts the column
   * @param filterColumn - function that filters the column
   * @returns JSX.Element - column
   */
  public getColumn(getCellRenderer: CellLookup, getCellData: CellLookup, sortColumn: SortCallback, filterColumn: FilterCallback) {
    const menuRenderer = this.renderMenu.bind(this, sortColumn) // bind the sortColumn function to the menuRenderer
    const filterThisColumn = (filterValue: string) => filterColumn(this.index, filterValue) // bind the filterColumn function to the filterThisColumn function
    const columnHeaderCellRenderer = () => (
      // function that returns the column header cell renderer

      <ColumnHeaderCell name={this.name} menuRenderer={menuRenderer}>
        <DataTablePopoverBP // popover that contains the filter input
          config={this.config}
          category={this.category}
          columnName={this.name}
          filterColumn={filterThisColumn}
        />
      </ColumnHeaderCell>
    )

    return (
      <Column // column
        cellRenderer={getCellRenderer}
        columnHeaderCellRenderer={columnHeaderCellRenderer}
        key={this.index}
        name={this.name}
      />
    )
  }

  protected abstract renderMenu(sortColumn: SortCallback): JSX.Element // abstract function that renders the menu
}

/**
 * @description This class is used to create a numerical sortable column
 * @class NumericalSortableColumn
 * @summary This class implements the renderMenu function of the AbstractSortableColumn class
 */
class NumericalSortableColumn extends AbstractSortableColumn {
  /**
   * Function that renders the menu
   * @param sortColumn - function that sorts the column
   * @returns JSX.Element - menu
   */
  protected renderMenu(sortColumn: SortCallback) {
    const sortAsc = () => sortColumn(this.index, (a, b) => this.compare(a, b))
    const sortDesc = () => sortColumn(this.index, (a, b) => this.compare(b, a))
    return (
      <>
        <Menu>
          <MenuItem icon="sort-asc" onClick={sortAsc} text="Sort Asc" />
          <MenuItem icon="sort-desc" onClick={sortDesc} text="Sort Desc" />
          <Divider />
          <MenuItem icon="filter" text="Type">
            <MenuItem icon="array-floating-point" text="Numerical" />
            <MenuItem icon="array-numeric" text="Categorical" />
            <MenuItem icon="array-timestamp" text="Time" />
            <MenuItem icon="array-string" text="String" />
          </MenuItem>
        </Menu>
      </>
    )
  }

  /**
   * @description This function compares two values
   * @param a - first value
   * @param b - second value
   * @returns number - difference between the two values
   */
  private compare(a: any, b: any) {
    return parseFloat(a) - parseFloat(b)
  }
}

/**
 * @description This class is used to create a datatable
 * @class DataTableWrapperBPClass
 * @summary This class is used to create a datatable
 * @extends React.PureComponent
 * @param props - props
 *  @param props.data - data to be displayed in the datatable
 *  @param props.config - config of the datatable
 *  @param props.options - options of the datatable
 * @renders DataTableWrapperBPClass
 * @example
 * <DataTableWrapperBPClass data={data} config={config} options={options} />
 * @returns DataTableWrapperBPClass
 */
export class DataTableWrapperBPClass extends React.PureComponent<{}, {}> {
  data: any
  ref: React.RefObject<unknown>

  /**
   * @description This is the constructor for the DataTableWrapperBPClass class
   * @param props - props
   */
  constructor(props: {} | Readonly<{}>) {
    super(props) // call the constructor of the parent class
    this.ref = React.createRef()
  }

  /**
   * @description This is the initial state of the datatable
   * @returns state
   * @memberof DataTableWrapperBPClass
   */
  public state = {
    columnsNames: [] as string[], // names of the columns
    columns: [] as SortableColumn[], // columns
    data: this.props.data as any[], // data
    sortedIndexMap: [] as number[], // sorted index map
    filteredIndexMap: null as any, // filtered index map
    columnIndexMap: [] as number[], // column index map
    sparseCellData: {} as { [key: string]: string }, // sparse cell data - Used to contain the data of the cells that have been modified
    sparseCellIntent: {} as { [key: string]: Intent }, // sparse cell intent - Used to contain the intent of the cells that have been modified - Intent meaning the background color of a cell
    columnsFilter: {} as { [key: string]: string }, // columns filter - Used to contain the filter value of the columns
    options: {
      // options of the datatable
      isEditable: true, // is editable
      isReorderable: false, // is reorderable
      exportToCSV: true, // enable export to CSV
      exportToJSON: true, // enable export to JSON
      exportToExcel: true, // enable export to Excel
      exportToPDF: true, // enable export to PDF
      fileName: this.props.options ? this.props.options.fileName : "data", // file name
      isOpen: false, // is open
      hasBeenModified: false // has been modified
    },
    config: { ...this.props.config } // config of the datatable
  }

  /**
   * @description This function returns the data
   * @returns data - data
   */
  public getData() {
    let data = this.data
    return data
  }

  /**
   * @description This function gets the column names
   * @param data - data
   * @returns columnsNames - column names
   */
  public getColumnNames(data: any) {
    let columnsNames = Object.keys(data[0])
    return columnsNames
  }

  /**
   * @description This function gets the column types
   * @param data - data
   * @returns columnsTypes - column types
   */
  public getColumnsTypes(data: any) {
    let columnsNames = Object.keys(data[0])
    let columnsTypes: any[] = []
    let firstRows = data.slice(0, 10)
    columnsNames.forEach((columnName) => {
      let arr = firstRows.map((row: { [x: string]: any }) => (row[columnName] === "NaN" ? 0 : row[columnName]))
      let columnType = dfUtils.inferDtype(arr)
      columnsTypes.push(columnType)
    })
    return columnsTypes
  }

  /**
   * @description This function returns the dataframe of the data
   * @returns {dfd.DataFrame} - dataframe
   * @see DanfoJS - https://danfo.jsdata.org/api-reference/dataframe
   */
  public getDataFrame() {
    let df = new dfd.DataFrame(this.state.data)
    return df
  }

  /**
   * @description This function returns the number of unique values in a column
   * @param dataframe
   * @param columnName
   * @returns number - number of unique values in a column
   */
  public getNumberOfUniqueValues(dataframe: DataFrame, columnName: string) {
    let uniqueValues = dataframe.unique(columnName)
    return uniqueValues.length
  }

  /**
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   * @returns  void
   */
  public componentDidMount() {
    if (!this.props.data) {
      return
    }
    let columnsNames = Object.keys(this.props.data[0]) // get the column names
    let newColumns: any[] = [] // new columns
    let newColumnIndexMap: any[] = [] // new column index map
    let newColumnTypes = this.getColumnsTypes(this.props.data) // get the column types
    columnsNames.forEach((columnName, index) => {
      // for each column name, create a new NumericalSortableColumn
      newColumns.push(new NumericalSortableColumn(columnName, index, newColumnTypes[index]))
      newColumnIndexMap.push(index)
    })
    this.state.columnsNames = columnsNames // set the column names
    this.state.columns = newColumns // set the columns
    this.setState({ data: this.props.data }) // set the data
    this.setState({ columnsNames: columnsNames, columns: newColumns, columnIndexMap: newColumnIndexMap }) // set the column names, columns and column index map
    // console.log("componentDidMount", this.state.data, this.state.sortedIndexMap) // log the data and sorted index map
  }

  /**
   * Called immediately after updating occurs. Not called for the initial render.
   * @param prevProps - previous props
   * @param prevState - previous state
   * @returns void
   */
  public componentDidUpdate(prevProps: any, prevState: any) {
    if (!this.props.data) {
      // if there is no data, do nothing
      return
    }
    if (prevProps !== this.props) {
      // if the previous props are not the same as the current props
      this.setState({ data: this.props.data }) // set the data
      let columnsNames = Object.keys(this.props.data[0]) // get the column names
      let newColumns: any[] = []
      let newColumnIndexMap: any[] = []
      let newColumnTypes = this.getColumnsTypes(this.props.data) // get the column types
      columnsNames.forEach((columnName, index) => {
        newColumns.push(new NumericalSortableColumn(columnName, index, newColumnTypes[index], this.state.config)) // create a new NumericalSortableColumn for each column name, we pass the column type and config
        newColumnIndexMap.push(index)
      })
      this.describeColumns(this.props.data) // describe the columns
      this.setState({ columnsNames: columnsNames, columns: newColumns, columnIndexMap: newColumnIndexMap }) // set the column names, columns and column index map
    }
    if (prevState !== this.state) {
      // if the previous state is not the same as the current state
      if (prevState.data !== this.state.data) {
        // if the previous data is not the same as the current data
        this.setState({ data: this.state.data }) // set the data
      }
      if (prevState.columns !== this.state.columns) {
        // if the previous columns are not the same as the current columns
        this.setState({ columns: this.state.columns }) // set the columns
      }
      if (prevState.sortedIndexMap !== this.state.sortedIndexMap) {
        // if the previous sorted index map is not the same as the current sorted index map
        this.setState({ sortedIndexMap: this.state.sortedIndexMap }) // set the sorted index map
      }
      if (prevState.filteredIndexMap !== this.state.filteredIndexMap) {
        // if the previous filtered index map is not the same as the current filtered index map
        this.setState({ filteredIndexMap: this.state.filteredIndexMap }) // set the filtered index map
      }
      if (prevState.columnIndexMap !== this.state.columnIndexMap) {
        // if the previous column index map is not the same as the current column index map
        this.setState({ columnIndexMap: this.state.columnIndexMap }) // set the column index map
      }
    }
    // console.log("componentDidUpdate", this.state.data, this.state.filteredIndexMap) // log the data and sorted index map
  }

  /**
   * @description This function returns the modified data with the sparse cell data
   * @param data - data to be modified
   * @returns modifiedData - modified data with the sparse cell data
   */
  public getModifiedData(data: any[]) {
    let modifiedData = []
    let headers = Object.keys(data[0])
    const { sparseCellData } = this.state
    data.forEach((row: { [x: string]: any }, index: any) => {
      let newRow = {}
      headers.forEach((header) => {
        if (sparseCellData[`${index}-${header}`]) {
          newRow[header] = sparseCellData[`${index}-${header}`]
        } else {
          newRow[header] = row[header]
        }
      })
      modifiedData.push(newRow)
    })
    return modifiedData
  }

  /**
   * @description This function exports the data to CSV
   * @param event - event
   * @param data - data to be exported
   */
  public exportToCSV(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) {
    data = this.getModifiedData(data) // get the modified data
    console.log("exportToCSV", data)
    let csvContent = "data:text/csv;charset=utf-8,"
    let headers = Object.keys(data[0])
    let firstRow = headers.join(",")
    csvContent += firstRow + "\r\n"
    let length = data.length
    data.forEach(function (rowArray: { [x: string]: string }, rowindex: number) {
      let rowToPush = ""
      headers.forEach((header, index) => {
        rowToPush += rowArray[header]
        if (index !== headers.length - 1) {
          rowToPush += ","
        } else if (rowindex !== length - 1) {
          rowToPush += "\r\n"
        } else {
          rowToPush += ""
        }
      })
      csvContent += rowToPush
    })
    var encodedUri = encodeURI(csvContent)
    var link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "my_data.csv")
    document.body.appendChild(link) // Required for FF
    link.click()
    link.remove()
  }

  /**
   * @description This function formats the JSON string to be exported to JSON
   * @param json - JSON string to be formatted
   * @returns formattedJSON - formatted JSON string
   */
  public formatJSON(json: string) {
    let formattedJSON = ""
    let indentLevel = 0
    for (let index = 0; index < json.length; index++) {
      const element = json[index]
      if (element === "[") {
        indentLevel++
        formattedJSON += "[\r\n"
        for (let i = 0; i < indentLevel; i++) {
          formattedJSON += "\t"
        }
      } else if (element === "]") {
        indentLevel--
        formattedJSON += "\r\n"
        for (let i = 0; i < indentLevel; i++) {
          formattedJSON += "\t"
        }
        formattedJSON += "]"
      } else if (element === "{") {
        indentLevel++
        formattedJSON += "{\r\n"
        for (let i = 0; i < indentLevel; i++) {
          formattedJSON += "\t"
        }
      } else if (element === "}") {
        indentLevel--
        formattedJSON += "\r\n"
        for (let i = 0; i < indentLevel; i++) {
          formattedJSON += "\t"
        }
        formattedJSON += "}"
      } else if (element === ",") {
        formattedJSON += ",\r\n"
        for (let i = 0; i < indentLevel; i++) {
          formattedJSON += "\t"
        }
      } else {
        formattedJSON += element
      }
    }
    return formattedJSON
  }

  /**
   * @description This function describes the columns
   * @returns void
   */
  public describeColumns() {
    if (this.state.data) {
      // if there is data
      let df = new dfd.DataFrame(this.state.data) // create a dataframe

      let columnsNames = Object.keys(this.props.data[0]) // get the column names

      columnsNames.forEach((columnName) => {
        // for each column name
        let column = df.$getColumnData(columnName) // get the column data
        try {
          console.log(column.asType(dfUtils.unique).dropNa().describe().print()) // print the description of the column
          let uniqueValues = dfUtils.unique(column) // get the unique values of the column
          // console.log("uniqueValues", uniqueValues) // log the unique values
        } catch (e) {
          // No operation
        }
      })
    }
  }

  /**
   * @description This function exports the data to JSON
   * @param event - event
   * @param data - data to be exported
   */
  public exportToJSON(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) {
    data = this.getModifiedData(data)
    console.log("exportToJSON", data)
    let jsonContent = "data:text/json;charset=utf-8, \r\n[\r\n\t"
    data.forEach((row: { [x: string]: string }, index: number) => {
      jsonContent += JSON.stringify(row)
      if (index !== data.length - 1) {
        jsonContent += ","
      } else {
        jsonContent += ""
      }
    })
    jsonContent += "\r\n] \r\n"
    var encodedUri = encodeURI(this.formatJSON(jsonContent))
    var link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "my_data.json")
    document.body.appendChild(link) // Required for FF
    link.click()
    link.remove()
  }

  /**
   * @description This function returns the suggested file name with the right extension
   * @param extension
   * @returns
   */
  public getSuggestedFileName(extension: string) {
    let receivedFileName = this.state.config.name
    let originalExtension = this.state.config.extension

    // Remove the original extension from the received file name
    let receivedFileNameWithoutExtension = receivedFileName.replace("." + originalExtension, "")
    let suggestedFileName = receivedFileNameWithoutExtension + "." + extension
    return suggestedFileName
  }

  /**
   * @description This function exports the data to Excel
   * @param event - event
   * @param data - data to be exported
   */
  public exportToExcel(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any, filePath?: string) {
    let fileName = this.getSuggestedFileName("xlsx")
    data = this.getModifiedData(data)
    let headers = Object.keys(data[0])
    let excelData: any[] = []
    excelData.push(headers)
    data.forEach((row: { [x: string]: string }, index: number) => {
      let rowToPush: any[] = []
      headers.forEach((header) => {
        rowToPush.push(row[header])
      })
      excelData.push(rowToPush)
    })
    const ws = xlxs.utils.aoa_to_sheet(excelData)
    const wb = xlxs.utils.book_new()
    xlxs.utils.book_append_sheet(wb, ws, "SheetJS")
    if (filePath) {
      const path = require("path")
      const finalPath = path.join(filePath, fileName)
      console.log("finalPath", finalPath)
    }
    xlxs.writeFile(wb, fileName)
  }

  /**
   * This function saves the modified data in the format specified in the config and at the location specified in the config
   * @param event - event
   * @param data - data to be saved
   * @returns void
   */
  public async saveData(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) {
    data = this.getModifiedData(data)
    let df = new dfd.DataFrame(data)
    console.log("saveData", data)
    console.log("saveData", this.state.config)
    if (this.state.config.extension === "csv") {
      try {
        dfd.toCSV(df, { filePath: this.state.config.path })
      } catch (e) {
        // No operation
      } finally {
        toast.success("Data saved successfully")
      }
    } else if (this.state.config.extension === "json") {
      try {
        dfd.toJSON(df, { filePath: this.state.config.path })
      } catch (e) {
        // No operation
      } finally {
        toast.success("Data saved successfully")
      }
    } else if (this.state.config.extension === "xlsx") {
      try {
        dfd.toExcel(df, { filePath: this.state.config.path })
      } catch (e) {
        // No operation
      } finally {
        toast.success("Data saved successfully")
      }
    }
  }

  /**
   * @description This is the render function of the DataTableWrapperBPClass class
   * @returns void
   */
  public render() {
    const { data } = this.state // get the data
    if (!data) {
      // if there is no data, return loading
      return <div>Loading...</div>
    }
    const numRows = this.state.data.length // get the number of rows
    const columns = this.state.columns.map(
      (
        col // get the columns
      ) => col.getColumn(this.getCellRenderer, this.getCellData, this.sortColumn, this.filterColumn)
    )
    return (
      <div className="bp-datatable-wrapper">
        <ChevronRight
          className={`bp-datatable-wrapper-options-icon ${
            this.state.options.isOpen
              ? "bp-datatable-wrapper-options-icon-open rotate-90-cw"
              : "bp-datatable-wrapper-options-icon-closed rotate--90-cw"
          }`}
        />
        <div
          className="bp-datatable-wrapper-title"
          style={{ display: "flex", flexDirection: "horizontal" }}
          onMouseEnter={() => this.setState({ options: { ...this.state.options, isOpen: true } })}
          onMouseLeave={() => this.setState({ options: { ...this.state.options, isOpen: false } })}
        >
          <Collapse isOpen={this.state.options.isOpen}>
            <Stack direction="horizontal" gap={3} style={{ position: "relative", top: "-5px", right: "0px" }}>
              <Button
                onClick={(e) => {
                  this.saveData(e, data)
                }}
                icon={<PiFloppyDisk size={"1.5rem"} />}
                rounded
                className="p-button-secondary ms-auto"
                style={{ marginTop: "5px", marginBottom: "5px", padding: "0rem", height: "2.5rem", width: "2.5rem" }}
                disabled={!this.state.options.isEditable}
              />
              <Button
                onClick={(e) => {
                  this.exportToCSV(e, data)
                }}
                icon={<FiletypeCsv size={"1.5rem"} />}
                rounded
                className="p-button-secondary ms-auto"
                style={{ marginTop: "5px", marginBottom: "5px", padding: "0rem", height: "2.5rem", width: "2.5rem" }}
                disabled={!this.state.options.isEditable}
              />
              <Button
                onClick={(e) => {
                  this.exportToJSON(e, data)
                }}
                icon={<FiletypeJson size={"1.5rem"} />}
                rounded
                className="p-button-info"
                style={{ marginTop: "5px", marginBottom: "5px", padding: "0rem", height: "2.5rem", width: "2.5rem" }}
                disabled={!this.state.options.isEditable}
              />
              <Button
                onClick={(e) => {
                  this.exportToExcel(e, data)
                }}
                icon={<FiletypeXlsx size={"1.5rem"} />}
                rounded
                className="p-button-success"
                style={{ marginTop: "5px", marginBottom: "5px", padding: "0rem", height: "2.5rem", width: "2.5rem" }}
                disabled={!this.state.options.isEditable}
              />
            </Stack>
          </Collapse>
        </div>

        <HotkeysTarget2 hotkeys={[]}>
          <Table2
            ref={this.ref}
            className={`${this.state.config.uuid}-tableBP`}
            bodyContextMenuRenderer={this.renderBodyContextMenu}
            numRows={numRows}
            getCellClipboardData={this.getCellData}
            cellRendererDependencies={[
              this.state.sortedIndexMap,
              this.state.columnIndexMap,
              this.state.filteredIndexMap,
              this.state.sparseCellIntent
            ]}
            enableMultipleSelection={true}
            enableRowReordering={true}
            onRowsReordered={this.handleRowsReordered}
            onColumnsReordered={this.handleColumnsReordered}
            enableColumnReordering={false} // TODO: Figure out the bug with column reordering while filtering
          >
            {columns}
          </Table2>
        </HotkeysTarget2>
      </div>
    )
  }

  /**
   * @description This function is called when a column is moved
   * @param oldIndex - old index of the column
   * @param newIndex - new index of the column
   * @param length - length of the column
   * @returns void
   */
  private handleColumnsReordered = (oldIndex: number, newIndex: number, length: number) => {
    if (oldIndex === newIndex) {
      return
    }
    const nextChildren = Utils.reorderArray(this.state.columns, oldIndex, newIndex, length)
    const nextColumnIndexMap = Utils.reorderArray(this.state.columnIndexMap, oldIndex, newIndex, length)
    this.setState({ columns: nextChildren, columnIndexMap: nextColumnIndexMap })
  }

  /**
   * @description This function is called when the rows are reordered
   * @param oldIndex - old index of the row
   * @param newIndex - new index of the row
   * @param length - length of the row
   * @returns void
   */
  private handleRowsReordered = (oldIndex: number, newIndex: number, length: number) => {
    if (oldIndex === newIndex) {
      return
    }
    let newSortedIndexMap = Utils.times(this.state.data.length, (i: number) => i)
    if (this.state.sortedIndexMap.length === 0) {
      // if the sorted index map is empty (first time)
      this.setState({ sortedIndexMap: Utils.reorderArray(newSortedIndexMap, oldIndex, newIndex, length) }) // set the sorted index map
    } else {
      // if the sorted index map is not empty
      this.setState({ sortedIndexMap: Utils.reorderArray(this.state.sortedIndexMap, oldIndex, newIndex, length) }) // set the sorted index map made of the old sorted index map
    }
  }

  /**
   * @description This function returns the cell data
   * @param rowIndex - row index
   * @param columnIndex - column index
   * @returns cellData - cell data
   */
  private getCellData = (rowIndex: number, columnIndex: number) => {
    const sortedRowIndex = this.state.sortedIndexMap[rowIndex]

    if (this.state.sparseCellData[`${rowIndex}-${this.state.columnsNames[this.state.columnIndexMap[columnIndex]]}`]) {
      // if the cell data is not null in the sparse cell data
      return this.state.sparseCellData[`${rowIndex}-${this.state.columnsNames[this.state.columnIndexMap[columnIndex]]}`] // return the cell data modified in the sparse cell data
    }
    ;[this.state.columnIndexMap[columnIndex]]
    return this.state.data[rowIndex][this.state.columnsNames[this.state.columnIndexMap[columnIndex]]]
  }

  /**
   * @description This function returns the cell renderer
   * @param rowIndex - row index
   * @param columnIndex - column index
   * @returns cellRenderer - cell renderer
   */
  private getCellRenderer = (rowIndex: number, columnIndex: number) => {
    const sortedRowIndex = this.state.sortedIndexMap[rowIndex]

    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex // if the sorted row index is not null, set the row index to the sorted row index
    }

    return (
      <EditableCell2
        intent={this.state.sparseCellIntent[`${rowIndex}-${this.state.columnsNames[this.state.columnIndexMap[columnIndex]]}`]}
        value={this.getCellData(rowIndex, columnIndex)}
        onCancel={this.cellValidator(rowIndex, columnIndex)}
        onChange={this.cellValidator(rowIndex, columnIndex)}
        onConfirm={this.cellSetter(rowIndex, columnIndex)}
      ></EditableCell2>
    )
  }

  /**
   * @description This function returns the cell key
   * @param rowIndex - row index
   * @param columnIndex - column index
   * @returns cellKey - cell key
   */
  private dataKey = (rowIndex: number, columnIndex: number) => {
    const sortedRowIndex = this.state.sortedIndexMap[rowIndex]
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex
    }
    return `${rowIndex}-${this.state.columnsNames[columnIndex]}`
  }

  /**
   * @description This function validates the cell
   * @param rowIndex - row index
   * @param columnIndex  - column index
   * @returns cellValidator - cell validator
   */
  private cellValidator = (rowIndex: number, columnIndex: number) => {
    const dataKey = this.dataKey(rowIndex, columnIndex)
    return (value: string) => {
      const intent = this.isValidValue(value) ? null : Intent.DANGER
      // this.setSparseState("sparseCellIntent", dataKey, intent)
      this.setSparseState("sparseCellData", dataKey, value)
    }
  }

  /**
   * @description This function sets the cell data when modified
   * @param rowIndex - row index
   * @param columnIndex - column index
   * @returns cellSetter - cell setter
   */
  private cellSetter = (rowIndex: number, columnIndex: number) => {
    const dataKey = this.dataKey(rowIndex, columnIndex)
    return (value: string) => {
      this.setSparseState("sparseCellData", dataKey, value)
    }
  }

  /**
   * @description This function renders the body context menu
   * @param context - context
   * @returns bodyContextMenu - body context menu
   */
  private renderBodyContextMenu = (context: MenuContext) => {
    return (
      <Menu>
        <CopyCellsMenuItem context={context} getCellData={this.getCellData} text="Copy" />
      </Menu>
    )
  }

  /**
   * @description This function is called to filter the column
   * @param columnIndex - column index
   * @param filterValue - filter value
   * @returns void
   */
  private filterColumn = (columnIndex: number, filterValue: string) => {
    const { data, columnsNames, columnsFilter, columnIndexMap } = this.state
    const newFilterValue = filterValue
    const newFilterValueDict = columnsFilter
    newFilterValueDict[columnsNames[columnIndexMap[columnIndex]]] = { filterValue: newFilterValue }
    this.setState({ columnsFilter: newFilterValueDict })
    const newFilteredIndexMap = Utils.times(data.length, (i: number) => i).filter((rowIndex: number) => {
      // Create an index range from 0 to the number of rows and then filter the rows
      const sortedRowIndex = this.state.sortedIndexMap[rowIndex]
      if (sortedRowIndex != null) {
        rowIndex = sortedRowIndex
      }
      try {
        return data[rowIndex][columnsNames[columnIndexMap[columnIndex]]]
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase()) // Filter the rows based on the filter value (Everything is converted to lowercase strings)
      } catch (e) {
        // No operation
      }
    })

    let columnName = columnsNames[columnIndex] // get the column name
    let newGlobalFilteredIndexMap = this.state.filteredIndexMap ? this.state.filteredIndexMap : {} // get the filtered index map
    newGlobalFilteredIndexMap[columnName] = newFilteredIndexMap // set the filtered index map
    this.setState({ filteredIndexMap: newGlobalFilteredIndexMap }) // set the filtered index map in the state
    this.updateIntent(filterValue, columnName, "AND") // update the intent
  }

  /**
   * @description This function updates the intent of the cells
   * @param filterValue - filter value
   * @param columnName  - column name
   * @param logicalOperation  - logical operation, either AND or OR, for now it is always AND. If multiple filters are applied, what do we keep? Every row that satisfies all the filters or every row that satisfies at least one filter?
   * @returns void
   */
  private updateIntent = (filterValue, columnName, logicalOperation) => {
    const { columnsNames, sparseCellIntent, filteredIndexMap, columnsFilter, sortedIndexMap } = this.state
    // Adds the intent to the cells that are present in the filteredIndexMap
    // and removes the intent from the cells that are not present in the filteredIndexMap
    let newSparseCellIntent = {}

    if (filterValue === "") {
      // If the filter value is empty, remove the intent from the cells that are not present in the filteredIndexMap
      Object.keys(sparseCellIntent).forEach((key: string) => {
        if (key.includes(columnName)) {
          newSparseCellIntent[key] = Intent.NONE
        }
      })
      let newFilteredIndexMap = filteredIndexMap
      if (newFilteredIndexMap != null) {
        newFilteredIndexMap[columnName] = null
      }
    }

    let columnsNamesFiltered = []
    let rowIntent = {}
    if (filteredIndexMap != null) {
      Object.keys(filteredIndexMap).forEach((key: string) => {
        // For each column name in the filtered index map
        if (filteredIndexMap[key] === null) {
          return
        }
        if (columnsFilter[key].filterValue !== "") {
          // If the filter value is not empty
          columnsNamesFiltered.push(key) // Add the column name to the columnsNamesFiltered array

          filteredIndexMap[key].forEach((rowIndex: number) => {
            // For each row index in the filtered index map
            rowIntent[rowIndex] = rowIntent[rowIndex] ? rowIntent[rowIndex] + 1 : 1 // Increment the row intent
            newSparseCellIntent[`${rowIndex}-${key}`] = Intent.WARNING // Set the intent of the cell to warning
          })
        }
      })
      let rowIntentArray = Object.keys(rowIntent) // Get the row intent array
      if (logicalOperation === "AND") {
        // If the logical operation is AND
        rowIntentArray = Object.keys(rowIntent).filter((key: string) => {
          return rowIntent[key] === columnsNamesFiltered.length // Filter the row intent array based on the number of columns filtered, if it is equal to the number of columns filtered, keep it
        })
      }

      rowIntentArray.forEach((rowIndex: number) => {
        // For each row index in the row intent array, that satisfies every filter if "AND"
        columnsNames.forEach((columnName: string) => {
          newSparseCellIntent[`${rowIndex}-${columnName}`] = Intent.SUCCESS // Set the intent of every cell in the row to success
        })
      })

      this.setState({ sparseCellIntent: newSparseCellIntent }) // Set the sparse cell intent
    }
  }

  /**
   * Called to sort the column
   * @param columnIndex - column index
   * @param comparator - comparator function to be used to sort the column
   * @returns void
   */
  private sortColumn = (columnIndex: number, comparator: (a: any, b: any) => number) => {
    const { data, columnsNames } = this.state
    const sortedIndexMap = Utils.times(data.length, (i: number) => i)
    sortedIndexMap.sort((a: number, b: number) => {
      return comparator(data[a][columnsNames[columnIndex]], data[b][columnsNames[columnIndex]])
    })
    this.setState({ sortedIndexMap })
  }

  /**
   * @description This function checks if the value is valid
   * @param value - value to be checked
   * @returns boolean - true if the value is valid, false otherwise
   */
  private isValidValue(value: string) {
    return /^[a-zA-Z]*$/.test(value)
  }

  /**
   * @description This function sets the sparse state
   * @param stateKey - The key of the state inside the state object
   * @param dataKey - The key of the data inside the state object
   * @param value - The value to be set
   */
  private setSparseState<T>(stateKey: string, dataKey: string, value: T) {
    const stateData = (this.state as any)[stateKey] as { [key: string]: T }
    const values = { ...stateData, [dataKey]: value }
    this.setState({ [stateKey]: values })
  }
}

export default DataTableWrapperBPClass