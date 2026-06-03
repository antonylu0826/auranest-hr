"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/provider";
import { jobTitlesApi } from "@/lib/job-titles-api";

interface Props { jobTitleId: string; jobTitleName: string }

export function DeleteJobTitleDialog({ jobTitleId, jobTitleName }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("jobTitles");
  const tc = useTranslations("common");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => jobTitlesApi.remove(jobTitleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-titles"] });
      setOpen(false);
      toast.success(`已刪除職稱：${jobTitleName}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteJobTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {tc("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
