import { rankItem } from "@tanstack/match-sorter-utils";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    FilterFn,
  } from "@tanstack/react-table";
  import { useMemo } from "react";
  
  function Table({ data, columns, globalFilter, setGlobalFilter }: { data: Array<unknown>; columns: ColumnDef<any, any>[], globalFilterEnable?: boolean, globalFilter?: string, setGlobalFilter?: (value: string) => void }) {
    const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
      const itemRank = rankItem(row.getValue(columnId), value)
    
      addMeta({
        itemRank,
      })
      return itemRank.passed
}

    const table = useReactTable({
      data: useMemo(() => data, [data]),
      columns,
      state: {
        globalFilter,
      },
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: fuzzyFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });    

    return (
      <>
        <div className="overflow-x-auto p-1">
            <table className="min-w-full divide-y divide-gray-200">
            <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                    <th className="px-2 py-4 bg-blue-300 font-semibold text-center whitespace-nowrap" key={header.id}>
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                    </th>
                    ))}
                </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="group even:bg-blue-50 text-sm text-center whitespace-nowrap">
                    {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-4 border-b group-last:border-none">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                    ))}
                </tr>
                ))}
                {
                table.getRowModel().rows.length === 0 && (
                    <tr>
                    <td colSpan={columns.length} className="text-center py-4">Không có dữ liệu</td>
                    </tr>
                )
                }
            </tbody>
            </table>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="flex items-center gap-1">
            <div>Trang</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Hiển thị {pageSize} hàng
              </option>
            ))}
          </select>
        </div>
      </>
    );
  }
  
  export default Table;
  