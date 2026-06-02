"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/provider";
import { orgUnitsApi } from "@/lib/org-units-api";

interface Props {
  orgUnitId: string;
  orgUnitName: string;
}

export function DeleteOrgUnitDialog({ orgUnitId, orgUnitName }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("orgUnits");
  const tc = useTranslations("common");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => orgUnitsApi.remove(orgUnitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-units"] });
      setOpen(false);
      toast.success(`已刪除部門：${orgUnitName}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive">
          <Trash2 className="size-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteOrgUnit")}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {tc("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
