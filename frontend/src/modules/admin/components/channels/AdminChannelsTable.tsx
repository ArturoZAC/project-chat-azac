"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  IconHash,
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconMoodSad,
} from "@tabler/icons-react";
import type { AdminChannel } from "@/modules/admin/interfaces/admin.interface";
import { formatDate } from "@/modules/admin/lib/mock-admin-data";

interface AdminChannelsTableProps {
  channels: AdminChannel[];
}

const columnHelper = createColumnHelper<AdminChannel>();

export function AdminChannelsTable({ channels }: AdminChannelsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "icon",
        header: "",
        cell: () => (
          <div className="w-8 h-8 rounded-lg bg-silver-light flex items-center justify-center">
            <IconHash size={16} className="text-silver-dark" />
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Nombre",
        sortingFn: "text",
        cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("description", {
        header: "Descripción",
        enableSorting: false,
        cell: (info) => {
          const desc = info.getValue();
          const truncated = desc && desc.length > 60 ? desc.slice(0, 60) + "..." : (desc ?? "-");
          return <span className="text-sm text-gray-dark">{truncated}</span>;
        },
      }),
      columnHelper.accessor("type", {
        header: "Tipo",
        cell: (info) => {
          const type = info.getValue();
          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                type === "PUBLIC" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
              }`}
            >
              {type === "PUBLIC" ? "Público" : "Privado"}
            </span>
          );
        },
      }),
      columnHelper.accessor("membersCount", {
        header: "Miembros",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.owner.username, {
        id: "creator",
        header: "Creador",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor("createdAt", {
        header: "Creado el",
        sortingFn: "datetime",
        cell: (info) => (
          <span className="text-sm text-gray-dark">{formatDate(info.getValue())}</span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: channels,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-light">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase tracking-wider ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none hover:text-gray-dark"
                        : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="flex flex-col leading-none">
                          <IconChevronUp
                            size={10}
                            className={
                              header.column.getIsSorted() === "asc"
                                ? "text-primary"
                                : "text-silver-dark"
                            }
                          />
                          <IconChevronDown
                            size={10}
                            className={
                              header.column.getIsSorted() === "desc"
                                ? "text-primary"
                                : "text-silver-dark"
                            }
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/admin/channels/${row.original.id}`)}
                  className="border-b border-gray-light last:border-b-0 hover:bg-silver-light/50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-silver-light flex items-center justify-center">
                      <IconMoodSad size={20} className="text-silver-dark" />
                    </div>
                    <p className="p-muted">No se encontraron canales</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-light">
          <p className="small-muted">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
