import React, { useEffect } from "react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";




export default function ReactTable({ data }) {
	const [tableData, setTableData] = React.useState([]);
	const [tableColumns, setTableColumns] = React.useState([]);
	// const [table, setTable] = React.useState(null);

	

	useEffect(() => {
		if (data.length === 0) {
			console.log("data is empty");
			return ;
		}
		console.log(data);

		let headers = Object.keys(data[0]).map((header) =>
			createColumnHelper(header)
		);

		setTableData(data.map((row) => getCoreRowModel(row)));
		setTableColumns(headers);
		
	}, [data]);

	if (tableData.length === 0 || tableColumns.length === 0) {
		return <></>;
	}

	else {
		// console.log(table);
		const table = useReactTable({
			tableData,
			tableColumns,
			enableColumnResizing: true,
			columnResizeMode: "onChange",
			getCoreRowModel: getCoreRowModel(),
			debugTable: true,
			debugHeaders: true,
			debugColumns: true,
		})

		return (
			<>
				<table className="w-full ">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										colSpan={header.colSpan}
										style={{ position: "relative", width: header.getSize() }}
									>
										{header.isPlaceholder
											? null
											: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										{header.column.getCanResize() && (
											<div
												onMouseDown={header.getResizeHandler()}
												onTouchStart={header.getResizeHandler()}
												className={`resizer ${
													header.column.getIsResizing() ? "isResizing" : ""
												}`}
											></div>
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} style={{ width: cell.column.getSize() }}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</>
		);
	}
}


