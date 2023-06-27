import React from 'react'
import ReactDOM from 'react-dom/client'
// import './index.css'

import {
    getCoreRowModel,
    ColumnDef,
    flexRender,
    useReactTable,
} from '@tanstack/react-table'
// import { makeData, Person } from './makeData'

const initialColumns = [
    {
        header: 'Name',
        footer: props => props.column.id,
        columns: [
            {
                accessorKey: 'firstName',
                cell: info => info.getValue(),
                footer: props => props.column.id,
            },
            {
                accessorFn: row => row.lastName,
                id: 'lastName',
                cell: info => info.getValue(),
                header: () => <span>Last Name</span>,
                footer: props => props.column.id,
            },
        ],
    },
    {
        header: 'Info',
        footer: props => props.column.id,
        columns: [
            {
                accessorKey: 'age',
                header: () => 'Age',
                footer: props => props.column.id,
            },
            {
                header: 'More Info',
                columns: [
                    {
                        accessorKey: 'visits',
                        header: () => <span>Visits</span>,
                        footer: props => props.column.id,
                    },
                    {
                        accessorKey: 'status',
                        header: 'Status',
                        footer: props => props.column.id,
                    },
                    {
                        accessorKey: 'progress',
                        header: 'Profile Progress',
                        footer: props => props.column.id,
                    },
                ],
            },
        ],
    },
]

export default function DataTable() {
    const [data, setData] = React.useState({})
    const [columns, setColumns] = React.useState(initialColumns)

    React.useEffect(() => {
        fetch('https://api.covidtracking.com/v1/states/current.json')
            .then(response => response.json())
            .then(data => {
                setData(data)
                setColumns(getHeadersFromJSON(data))
            })
    }, [])

    React.useEffect(() => {
        if (data) {
            console.log(data)
        }
        setColumns(getHeadersFromJSON(data))
        console.log(columns)
    }, [data])

    const table = useReactTable({
        data,
        columns,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        getCoreRowModel: getCoreRowModel(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: true,
    })

    return (
        <>
            <div className="p-2 block max-w-full overflow-x-scroll overflow-y-hidden">
                <div className="h-2" />
                <table className="w-full ">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{ position: 'relative', width: header.getSize() }}
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
                                                    className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''
                                                        }`}
                                                ></div>
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => {
                            return (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => {
                                        return (
                                            <td key={cell.id} style={{ width: cell.column.getSize() }}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className="h-4" />
            </div>
        </>
    )
}

// const rootElement = document.getElementById('root')
// if (!rootElement) throw new Error('Failed to find the root element')

// ReactDOM.createRoot(rootElement).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// )

// import { React } from 'react';
// import { Container, Row, Col } from 'react-bootstrap';
// import { useWorkspace } from '../../workspace/WorkspaceContext';
// import { useReactTable } from '@tanstack/react-table';
// import { useState } from 'react';

// export default function DataTable(props) {
//     const [data, setData] = useState(null)
//     const rerender = () => setData(null)

//     const table = useReactTable({
//         props,
//         getHeadersFromJSON(props.data),
//         getCoreRowModel: getCoreRowModel(),
//       })

//     return (
//         <div className="p-2">
//             <table>
//                 <thead>
//                     {table.getHeaderGroups().map(headerGroup => (
//                         <tr key={headerGroup.id}>
//                             {headerGroup.headers.map(header => (
//                                 <th key={header.id}>
//                                     {header.isPlaceholder
//                                         ? null
//                                         : flexRender(
//                                             header.column.columnDef.header,
//                                             header.getContext()
//                                         )}
//                                 </th>
//                             ))}
//                         </tr>
//                     ))}
//                 </thead>
//                 <tbody>
//                     {table.getRowModel().rows.map(row => (
//                         <tr key={row.id}>
//                             {row.getVisibleCells().map(cell => (
//                                 <td key={cell.id}>
//                                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//                 <tfoot>
//                     {table.getFooterGroups().map(footerGroup => (
//                         <tr key={footerGroup.id}>
//                             {footerGroup.headers.map(header => (
//                                 <th key={header.id}>
//                                     {header.isPlaceholder
//                                         ? null
//                                         : flexRender(
//                                             header.column.columnDef.footer,
//                                             header.getContext()
//                                         )}
//                                 </th>
//                             ))}
//                         </tr>
//                     ))}
//                 </tfoot>
//             </table>
//             <div className="h-4" />
//             <button onClick={() => rerender()} className="border p-2">
//                 Rerender
//             </button>
//         </div>
//     )
// }


function getHeadersFromJSON(json) {
    const headers = [];
    for (const key in json[0]) {
        let item = {
            accessorKey: key,
            header: capitalizeFirstLetter(key),
            footer: info => info.column.id
        };

        headers.push(item);
    }
    console.log('headers', headers);
    return headers;
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}