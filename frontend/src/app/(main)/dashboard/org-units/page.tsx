"use client";

import {
  type ColumnDef, flexRender, getCoreRowModel,
  getSortedRowModel, type SortingState, useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, LayoutList, Network, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useTranslations } from "@/i18n/provider";
import { useDebounce } from "@/hooks/use-debounce";
import { orgUnitsApi, type OrgUnit, type OrgUnitLevel } from "@/lib/org-units-api";
import { OrgUnitTree } from "./_components/org-unit-tree";
import { DeleteOrgUnitDialog } from "./_components/delete-org-unit-dialog";

const LEVEL_VARIANT: Record<OrgUnitLevel, "default" | "secondary" | "outline"> = {
  COMPANY: "default",
  DIVISION: "secondary",
  DEPARTMENT: "outline",
  TEAM: "outline",
};

type View = "table" | "tree";

export default function OrgUnitsPage() {
  const t = useTranslations("orgUnits");
  const [view, setView] = useState<View>("table");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0] ? (sorting[0].desc ? "DESC" : "ASC") : undefined;

  const { data: listResult, isLoading: listLoading } = useQuery({
    queryKey: ["org-units", "list", debouncedSearch, sortField, sortOrder],
    queryFn: () => orgUnitsApi.list({ search: debouncedSearch || undefined, sortField, sortOrder, limit: 100 }),
    enabled: view === "table",
  });

  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ["org-units", "tree"],
    queryFn: () => orgUnitsApi.tree(),
    enabled: view === "tree",
  });

  const units = listResult?.data ?? [];

  const columns = useMemo<ColumnDef<OrgUnit>[]>(() => [
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
      accessorKey: "level",
      header: t("level"),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={LEVEL_VARIANT[row.original.level]}>{t(`levels.${row.original.level}`)}</Badge>
      ),
    },
    {
      id: "parent",
      header: t("parent"),
      enableSorting: false,
      cell: ({ row }) => row.original.parent?.name ?? "—",
    },
    {
      id: "head",
      header: t("head"),
      enableSorting: false,
      cell: ({ row }) => row.original.head?.name ?? "—",
    },
    {
      id: "members",
      header: t("members"),
      enableSorting: false,
      cell: ({ row }) => row.original._count.employees,
    },
    {
      id: "children",
      header: t("children"),
      enableSorting: false,
      cell: ({ row }) => row.original._count.children,
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/dashboard/org-units/${row.original.id}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteOrgUnitDialog orgUnitId={row.original.id} orgUnitName={row.original.name} />
        </div>
      ),
    },
  ], [t]);

  const table = useReactTable({
    data: units,
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
          <p className="text-muted-foreground text-sm">{listResult?.total ?? 0} 筆</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {view === "table" && (
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56"
            />
          )}
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              size="sm" variant={view === "table" ? "default" : "ghost"}
              className="rounded-none h-9"
              onClick={() => setView("table")}
            >
              <LayoutList className="size-4 mr-1.5" />{t("tableView")}
            </Button>
            <Button
              size="sm" variant={view === "tree" ? "default" : "ghost"}
              className="rounded-none h-9"
              onClick={() => setView("tree")}
            >
              <Network className="size-4 mr-1.5" />{t("treeView")}
            </Button>
          </div>
          <Button size="sm" asChild>
            <Link href="/dashboard/org-units/new">
              <Plus className="mr-1.5 size-4" />{t("newOrgUnit")}
            </Link>
          </Button>
        </div>
      </div>

      {view === "table" ? (
        listLoading ? <TableSkeleton cols={columns.length} /> : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-16">
                      {t("noOrgUnits")}
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        treeLoading
          ? <div className="flex justify-center py-24"><Skeleton className="h-64 w-full max-w-2xl" /></div>
          : <OrgUnitTree roots={treeData ?? []} />
      )}
    </div>
  );
}
