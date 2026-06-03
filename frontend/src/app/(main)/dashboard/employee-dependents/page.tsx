"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useTranslations } from "@/i18n/provider";
import { useDebounce } from "@/hooks/use-debounce";
import { employeeDependentsApi, type EmployeeDependent } from "@/lib/employee-dependents-api";
import { employeesApi } from "@/lib/employees-api";
import { DependentDialog } from "./_components/dependent-dialog";
import { DeleteDependentDialog } from "./_components/delete-dependent-dialog";

export default function EmployeeDependentsPage() {
  const t = useTranslations("employeeDependents");
  const tc = useTranslations("common");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0] ? (sorting[0].desc ? "DESC" : "ASC") : undefined;

  const { data: result, isLoading } = useQuery({
    queryKey: ["employee-dependents", debouncedSearch, sortField, sortOrder, employeeFilter ?? "all"],
    queryFn: () =>
      employeeDependentsApi.list({
        search: debouncedSearch || undefined,
        sortField,
        sortOrder,
        limit: 100,
        employeeId: employeeFilter ?? undefined,
      }),
  });

  const { data: employeesResult } = useQuery({
    queryKey: ["employees-all"],
    queryFn: () => employeesApi.list({ limit: 100 }),
  });
  const employees = employeesResult?.data ?? [];

  const rows = result?.data ?? [];

  const columns = useMemo<ColumnDef<EmployeeDependent>[]>(
    () => [
      {
        accessorKey: "employeeName",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
            {t("employee")} <ArrowUpDown className="ml-1 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{row.original.employeeName}</span>
            <span className="ml-1.5 text-xs text-muted-foreground">{row.original.employeeNumber}</span>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
            {t("name")} <ArrowUpDown className="ml-1 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "relationship",
        header: t("relationship"),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline">{t(`relationships.${row.original.relationship}`)}</Badge>
        ),
      },
      {
        accessorKey: "gender",
        header: t("gender"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.gender ? t(`genders.${row.original.gender}`) : "—",
      },
      {
        accessorKey: "birthDate",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
            {t("birthDate")} <ArrowUpDown className="ml-1 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => row.original.birthDate ?? "—",
      },
      {
        accessorKey: "phone",
        header: t("phone"),
        enableSorting: false,
        cell: ({ row }) => row.original.phone ?? "—",
      },
      {
        accessorKey: "isActive",
        header: t("isActive"),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? tc("active") : tc("disabled")}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <DependentDialog mode="edit" dependent={row.original} />
            <DeleteDependentDialog dependentId={row.original.id} dependentName={row.original.name} />
          </div>
        ),
      },
    ],
    [t],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{result?.total ?? 0} 筆</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AppSelect
            value={employeeFilter}
            onValueChange={setEmployeeFilter}
            options={employees.map((e) => ({ value: e.id, label: `${e.employeeNumber} — ${e.name}` }))}
            placeholder={t("allEmployees")}
            nullable
            className="h-9 w-48"
          />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-60"
          />
          <DependentDialog mode="create" defaultEmployeeId={employeeFilter ?? undefined} />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton cols={columns.length} />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-16">
                    {t("noDependents")}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
