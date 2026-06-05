"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSelect } from "@/components/ui/app-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "@/i18n/provider";
import {
  employeeDependentsApi,
  DEPENDENT_RELATIONSHIPS,
  type EmployeeDependent,
  type CreateEmployeeDependentData,
} from "@/lib/employee-dependents-api";
import { employeesApi } from "@/lib/employees-api";

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

const schema = z.object({
  employeeId: z.string().min(1, "必填"),
  name: z.string().min(1, "必填"),
  relationship: z.enum(DEPENDENT_RELATIONSHIPS),
  gender: z.enum(GENDERS).nullable().optional(),
  birthDate: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  mode: "create" | "edit";
  dependent?: EmployeeDependent;
  defaultEmployeeId?: string;
}

export function DependentDialog({ mode, dependent, defaultEmployeeId }: Props) {
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const t = useTranslations("employeeDependents");
  const tc = useTranslations("common");
  const qc = useQueryClient();

  const { data: employeesResult } = useQuery({
    queryKey: ["employees-all"],
    queryFn: () => employeesApi.list({ limit: 100 }),
    enabled: open,
  });
  const employees = employeesResult?.data ?? [];

  const { data: fresh, isLoading } = useQuery({
    queryKey: ["employee-dependent", dependent?.id],
    queryFn: () => employeeDependentsApi.get(dependent!.id),
    enabled: open && mode === "edit" && !!dependent,
  });

  const emptyValues: FormValues = {
    employeeId: defaultEmployeeId ?? "",
    name: "",
    relationship: "SPOUSE",
    gender: null,
    birthDate: null,
    nationalId: null,
    phone: null,
    isActive: true,
  };

  const { control, register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: emptyValues,
    });

  useEffect(() => {
    if (fresh) {
      reset({
        employeeId: fresh.employeeId,
        name: fresh.name,
        relationship: fresh.relationship,
        gender: fresh.gender,
        birthDate: fresh.birthDate,
        nationalId: fresh.nationalId,
        phone: fresh.phone,
        isActive: fresh.isActive,
      });
      setInitialized(true);
    } else if (!open) {
      reset({ ...emptyValues, employeeId: defaultEmployeeId ?? "" });
      setInitialized(false);
    }
  }, [fresh, open, reset, defaultEmployeeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: (data: CreateEmployeeDependentData) =>
      mode === "create"
        ? employeeDependentsApi.create(data)
        : employeeDependentsApi.update(dependent!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee-dependents"] });
      setOpen(false);
      toast.success(mode === "create" ? `${t("createDependent")} 成功` : `${t("editDependent")} 成功`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.employeeNumber} — ${e.name}`,
  }));

  return (
    <>
      {mode === "create" ? (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 size-4" />{t("newDependent")}
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? t("createDependent") : t("editDependent")}</DialogTitle>
          </DialogHeader>

          <form id="dependent-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
            {(isLoading || !employeesResult || (mode === "edit" && !initialized)) ? (
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>{t("employee")} *</Label>
                  <Controller
                    control={control}
                    name="employeeId"
                    render={({ field }) => (
                      <AppSelect
                        value={field.value || null}
                        onValueChange={(v) => field.onChange(v ?? "")}
                        options={employeeOptions}
                        placeholder={t("employeeFilter")}
                        disabled={mutation.isPending}
                      />
                    )}
                  />
                  {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("name")} *</Label>
                    <Input {...register("name")} disabled={mutation.isPending} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t("relationship")} *</Label>
                    <Controller
                      control={control}
                      name="relationship"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={mutation.isPending}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPENDENT_RELATIONSHIPS.map((r) => (
                              <SelectItem key={r} value={r}>{t(`relationships.${r}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t("gender")}</Label>
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)} disabled={mutation.isPending}>
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDERS.map((g) => (
                              <SelectItem key={g} value={g}>{t(`genders.${g}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t("birthDate")}</Label>
                    <DatePicker
                      value={watch("birthDate") ?? undefined}
                      onChange={(d) => setValue("birthDate", d ?? null)}
                      disabled={mutation.isPending}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t("nationalId")}</Label>
                    <Input {...register("nationalId")} disabled={mutation.isPending} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t("phone")}</Label>
                    <Input {...register("phone")} disabled={mutation.isPending} />
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
            <Button type="submit" form="dependent-form" disabled={mutation.isPending || isLoading}>
              {mutation.isPending
                ? (mode === "create" ? tc("creating") : tc("saving"))
                : (mode === "create" ? tc("create") : tc("save"))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
