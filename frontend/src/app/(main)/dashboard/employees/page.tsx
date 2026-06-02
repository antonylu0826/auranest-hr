"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/i18n/provider";
import { useDebounce } from "@/hooks/use-debounce";
import { employeesApi, type Employee, type EmploymentStatus } from "@/lib/employees-api";
import { DeleteEmployeeDialog } from "./_components/delete-employee-dialog";

const PAGE_SIZE = 20;

const STATUS_VARIANTS: Record<EmploymentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "default",
  ON_LEAVE: "outline",
  RESIGNED: "secondary",
  TERMINATED: "destructive",
};

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function EmployeesPage() {
  const t = useTranslations("employees");
  const tc = useTranslations("common");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0] ? (sorting[0].desc ? "DESC" : "ASC") : undefined;

  const { data: result, isLoading } = useQuery({
    queryKey: ["employees", page, PAGE_SIZE, debouncedSearch, status, sortField, sortOrder],
    queryFn: () =>
      employeesApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
        sortField,
        sortOrder,
      }),
  });

  const employees = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "employeeNumber",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
            {t("employeeNumber")} <ArrowUpDown className="ml-1 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.employeeNumber}</span>
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
        accessorKey: "gender",
        header: t("gender"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.gender ? (
            <span className="text-sm">{t(`genders.${row.original.gender}`)}</span>
          ) : "—",
      },
      {
        accessorKey: "employmentType",
        header: t("employmentType"),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline">{t(`employmentTypes.${row.original.employmentType}`)}</Badge>
        ),
      },
      {
        accessorKey: "employmentStatus",
        header: t("employmentStatus"),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANTS[row.original.employmentStatus]}>
            {t(`employmentStatuses.${row.original.employmentStatus}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "hireDate",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
            {t("hireDate")} <ArrowUpDown className="ml-1 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => row.original.hireDate ?? "—",
      },
      {
        accessorKey: "phone",
        header: t("phone"),
        enableSorting: false,
        cell: ({ row }) => row.original.phone ?? "—",
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/dashboard/employees/${row.original.id}/edit`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <DeleteEmployeeDialog
              employeeId={row.original.id}
              employeeName={row.original.name}
            />
          </div>
        ),
      },
    ],
    [t],
  );

  const table = useReactTable({
    data: employees,
    columns,
    state: { sorting },
    onSortingChange: (updater) => { setSorting(updater); setPage(1); },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{total} 筆</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={status || "__all__"}
            onValueChange={(v) => { setStatus(v === "__all__" ? "" : v); setPage(1); }}
          >
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("statusFilter.all")}</SelectItem>
              <SelectItem value="ACTIVE">{t("statusFilter.ACTIVE")}</SelectItem>
              <SelectItem value="ON_LEAVE">{t("statusFilter.ON_LEAVE")}</SelectItem>
              <SelectItem value="RESIGNED">{t("statusFilter.RESIGNED")}</SelectItem>
              <SelectItem value="TERMINATED">{t("statusFilter.TERMINATED")}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-60"
          />
          <Button size="sm" asChild>
            <Link href="/dashboard/employees/new">
              <Plus className="mr-1.5 size-4" />
              {t("newEmployee")}
            </Link>
          </Button>
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
                    {t("noEmployees")}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{tc("page")} {page} / {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
