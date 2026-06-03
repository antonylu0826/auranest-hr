"use client";

import Link from "next/link";
import { Users, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/provider";
import type { OrgUnitTreeNode, OrgUnitLevel } from "@/lib/org-units-api";
import { DeleteOrgUnitDialog } from "./delete-org-unit-dialog";

const LEVEL_VARIANT: Record<OrgUnitLevel, "default" | "secondary" | "outline"> = {
  COMPANY: "default",
  DIVISION: "secondary",
  DEPARTMENT: "outline",
  TEAM: "outline",
};

function OrgUnitCard({ node }: { node: OrgUnitTreeNode }) {
  const t = useTranslations("orgUnits");
  return (
    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm min-w-44 max-w-56 w-full">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{node.name}</p>
          {node.head && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{node.head.name}</p>
          )}
        </div>
        <Badge variant={LEVEL_VARIANT[node.level]} className="shrink-0 text-xs">
          {t(`levels.${node.level}`)}
        </Badge>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3" />
          {node._count.employees}
        </span>
        <div className="flex gap-0.5">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
            <Link href={`/dashboard/org-units/${node.id}/edit`}>
              <Pencil className="size-3" />
            </Link>
          </Button>
          <DeleteOrgUnitDialog orgUnitId={node.id} orgUnitName={node.name} />
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node, isLast }: { node: OrgUnitTreeNode; isLast: boolean }) {
  const hasChildren = node.children.length > 0;
  return (
    <div className="flex flex-col items-center">
      <OrgUnitCard node={node} />
      {hasChildren && (
        <>
          {/* 垂直連線 */}
          <div className="w-px h-6 bg-border" />
          {/* 子節點列 */}
          <div className="relative flex gap-8">
            {/* 水平橫線 */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 left-1/2 h-px bg-border -translate-x-1/2"
                style={{ width: `calc(100% - 3.5rem)` }}
              />
            )}
            {node.children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* 每個子節點的垂直接線 */}
                <div className="w-px h-6 bg-border" />
                <TreeNode node={child} isLast={i === node.children.length - 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  roots: OrgUnitTreeNode[];
}

export function OrgUnitTree({ roots }: Props) {
  const t = useTranslations("orgUnits");

  if (roots.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        {t("noOrgUnits")}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto pb-8">
      <div className="flex gap-12 justify-center min-w-max pt-4 px-8">
        {roots.map((root) => (
          <TreeNode key={root.id} node={root} isLast={false} />
        ))}
      </div>
    </div>
  );
}
