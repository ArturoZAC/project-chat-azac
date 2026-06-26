"use client";

import { useRouter } from "next/navigation";
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
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconX,
  IconDotsVertical,
  IconMoodSad,
} from "@tabler/icons-react";
import type { AdminUser } from "@/modules/admin/interfaces/admin.interface";
import { getInitials, formatDate } from "@/modules/admin/lib/mock-admin-data";

interface UsersTableProps {
  users: AdminUser[];
  search: string;
  roleFilter: string;
}

const columnHelper = createColumnHelper<AdminUser>();

export function UsersTable({ users, search, roleFilter }: UsersTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Apply global search and role filter
  const filteredData = useMemo(() => {
    let result = users;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    return result;
  }, [users, search, roleFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: "Usuario",
        sortingFn: "text",
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="p-white text-xs font-semibold">
                  {getInitials(user.username)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{user.username}</p>
                <p className="small-muted">{user.email}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("role", {
        header: "Rol",
        cell: (info) => {
          const role = info.getValue();
          return (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                role === "ADMIN"
                  ? "bg-primary-light text-primary"
                  : "bg-silver-light text-gray-dark"
              }`}
            >
              {role === "ADMIN" ? "Admin" : "Usuario"}
            </span>
          );
        },
      }),
      columnHelper.accessor("isOnline", {
        header: "Estado",
        enableSorting: false,
        cell: (info) => {
          const online = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  online ? "bg-green-500" : "bg-gray-light"
                }`}
              />
              <span className="text-sm">{online ? "En línea" : "Desconectado"}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("isEmailVerified", {
        header: "Verificado",
        enableSorting: false,
        cell: (info) => {
          const verified = info.getValue();
          return verified ? (
            <IconCircleCheck size={18} className="text-green-500" />
          ) : (
            <IconX size={18} className="text-silver-dark" />
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Registro",
        sortingFn: "datetime",
        cell: (info) => (
          <span className="text-sm text-gray-dark">{formatDate(info.getValue())}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: () => (
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors"
            title="Acciones"
          >
            <IconDotsVertical size={16} />
          </button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-light shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-light">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-xs font-semibold text-silver-dark uppercase tracking-wider ${
                      header.column.getCanSort() ? "cursor-pointer select-none hover:text-gray-dark" : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
                  onClick={() => router.push(`/admin/users/${row.original.id}`)}
                  className="border-b border-gray-light last:border-b-0 hover:bg-silver-light/50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-silver-light flex items-center justify-center">
                      <IconMoodSad size={20} className="text-silver-dark" />
                    </div>
                    <p className="p-muted">No se encontraron usuarios</p>
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
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
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
