"use client";

import { type ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useTranslations } from "@/i18n/provider";
import { useDebounce } from "@/hooks/use-debounce";
import { jobTitlesApi, type JobTitle } from "@/lib/job-titles-api";
import { JobTitleDialog } from "./_components/job-title-dialog";
import { DeleteJobTitleDialog } from "./_components/delete-job-title-dialog";

export default function JobTitlesPage() {
  const t = useTranslations("jobTitles");
  const tc = useTranslations("common");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0] ? (sorting[0].desc ? "DESC" : "ASC") : undefined;

  const { data: result, isLoading } = useQuery({
    queryKey: ["job-titles", debouncedSearch, sortField, sortOrder],
    queryFn: () => jobTitlesApi.list({ search: debouncedSearch || undefined, sortField, sortOrder, limit: 100 }),
  });

  const rows = result?.data ?? [];

  const columns = useMemo<ColumnDef<JobTitle>[]>(() => [
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
      accessorKey: "code",
      header: t("code"),
      enableSorting: false,
      cell: ({ row }) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.original.code}</code>,
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
          {t("department")} <ArrowUpDown className="ml-1 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => row.original.department ?? "—",
    },
    {
      accessorKey: "grade",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
          {t("grade")} <ArrowUpDown className="ml-1 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => row.original.grade
        ? <Badge variant="outline">{row.original.grade}</Badge>
        : "—",
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
          <JobTitleDialog mode="edit" jobTitle={row.original} />
          <DeleteJobTitleDialog jobTitleId={row.original.id} jobTitleName={row.original.name} />
        </div>
      ),
    },
  ], [t]);

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
        <div className="flex items-center gap-2">
          <Input placeholder={t("searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-60" />
          <JobTitleDialog mode="create" />
        </div>
      </div>

      {isLoading ? <TableSkeleton cols={columns.length} /> : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>{table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>{hg.headers.map((h) => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
            ))}</TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0
                ? <TableRow><TableCell colSpan={columns.length} className="text-center text-muted-foreground py-16">{t("noJobTitles")}</TableCell></TableRow>
                : table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
