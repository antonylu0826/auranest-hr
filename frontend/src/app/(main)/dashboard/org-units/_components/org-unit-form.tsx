"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/i18n/provider";
import { AppSelect } from "@/components/ui/app-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orgUnitsApi, type OrgUnit, type OrgUnitLevel } from "@/lib/org-units-api";
import { employeesApi } from "@/lib/employees-api";

const LEVELS: OrgUnitLevel[] = ["COMPANY", "DIVISION", "DEPARTMENT", "TEAM"];

const schema = z.object({
  name: z.string().min(1, "必填"),
  level: z.enum(["COMPANY", "DIVISION", "DEPARTMENT", "TEAM"]),
  parentId: z.string().nullable().optional(),
  headId: z.string().nullable().optional(),
});

export type OrgUnitFormValues = z.infer<typeof schema>;

interface Props {
  formId: string;
  defaultValues?: OrgUnit;
  editId?: string;
  onSubmit: (values: OrgUnitFormValues) => void;
  disabled?: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

export function OrgUnitForm({ formId, defaultValues, editId, onSubmit, disabled }: Props) {
  const t = useTranslations("orgUnits");

  const { data: allUnits } = useQuery({
    queryKey: ["org-units", "list-all"],
    queryFn: () => orgUnitsApi.list({ limit: 100 }),
  });

  const { data: allEmployees } = useQuery({
    queryKey: ["employees", "list-all"],
    queryFn: () => employeesApi.list({ limit: 100, status: "ACTIVE" }),
  });

  const parentOptions = (allUnits?.data ?? [])
    .filter((u) => u.id !== editId)
    .map((u) => ({ value: u.id, label: u.name }));

  const headOptions = (allEmployees?.data ?? []).map((e) => ({
    value: e.id,
    label: `${e.employeeNumber} — ${e.name}`,
  }));

  const { register, handleSubmit, setValue, watch } = useForm<OrgUnitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          level: defaultValues.level,
          parentId: defaultValues.parentId,
          headId: defaultValues.headId,
        }
      : { name: "", level: "DEPARTMENT" },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={`${t("name")} *`}>
          <Input {...register("name")} disabled={disabled} />
        </Field>

        <Field label={t("level")}>
          <Select
            value={watch("level")}
            onValueChange={(v) => setValue("level", v as OrgUnitLevel)}
            disabled={disabled}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{t(`levels.${l}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t("parent")}>
          <AppSelect
            value={watch("parentId") ?? null}
            onValueChange={(v) => setValue("parentId", v)}
            options={parentOptions}
            nullable
            disabled={disabled}
          />
        </Field>

        <Field label={t("head")}>
          <AppSelect
            value={watch("headId") ?? null}
            onValueChange={(v) => setValue("headId", v)}
            options={headOptions}
            nullable
            disabled={disabled}
          />
        </Field>
      </div>
    </form>
  );
}
