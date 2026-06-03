"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/i18n/provider";
import { jobTitlesApi, type JobTitle, type CreateJobTitleData } from "@/lib/job-titles-api";

const schema = z.object({
  name: z.string().min(1, "必填"),
  code: z.string().min(1, "必填"),
  department: z.string().nullable().optional(),
  grade: z.string().nullable().optional(),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  mode: "create" | "edit";
  jobTitle?: JobTitle;
}

export function JobTitleDialog({ mode, jobTitle }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("jobTitles");
  const tc = useTranslations("common");
  const qc = useQueryClient();

  const { data: fresh, isLoading } = useQuery({
    queryKey: ["job-title", jobTitle?.id],
    queryFn: () => jobTitlesApi.get(jobTitle!.id),
    enabled: open && mode === "edit" && !!jobTitle,
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { name: "", code: "", isActive: true },
    });

  useEffect(() => {
    if (fresh) {
      reset({
        name: fresh.name,
        code: fresh.code,
        department: fresh.department,
        grade: fresh.grade,
        isActive: fresh.isActive,
      });
    } else if (!open) {
      reset({ name: "", code: "", department: null, grade: null, isActive: true });
    }
  }, [fresh, open, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateJobTitleData) =>
      mode === "create"
        ? jobTitlesApi.create(data)
        : jobTitlesApi.update(jobTitle!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-titles"] });
      setOpen(false);
      toast.success(mode === "create" ? `${t("createJobTitle")} 成功` : `${t("editJobTitle")} 成功`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      {mode === "create" ? (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 size-4" />{t("newJobTitle")}
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? t("createJobTitle") : t("editJobTitle")}</DialogTitle>
          </DialogHeader>

          <form id="job-title-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("name")} *</Label>
                    <Input {...register("name")} placeholder="Senior Engineer" disabled={mutation.isPending} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("code")} *</Label>
                    <Input {...register("code")} placeholder="SE" className="uppercase" disabled={mutation.isPending} />
                    {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("department")}</Label>
                    <Input {...register("department")} placeholder="Engineering" disabled={mutation.isPending} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("grade")}</Label>
                    <Input {...register("grade")} placeholder="L5" disabled={mutation.isPending} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={watch("isActive")}
                    onCheckedChange={(v) => setValue("isActive", v === true)}
                    disabled={mutation.isPending}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">{t("isActive")}</Label>
                </div>
              </>
            )}
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>{tc("cancel")}</Button>
            <Button type="submit" form="job-title-form" disabled={mutation.isPending || isLoading}>
              {mutation.isPending ? (mode === "create" ? tc("creating") : tc("saving")) : (mode === "create" ? tc("create") : tc("save"))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
