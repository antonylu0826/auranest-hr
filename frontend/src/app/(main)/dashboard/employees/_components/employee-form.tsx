"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/i18n/provider";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, CreateEmployeeData } from "@/lib/employees-api";
import { orgUnitsApi } from "@/lib/org-units-api";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const schema = z.object({
  employeeNumber: z.string().min(1, "必填"),
  name: z.string().min(1, "必填"),
  nationalId: z.string().nullable().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
  birthDate: z.string().regex(DATE_RE).nullable().optional(),
  nationality: z.string().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  hireDate: z.string().regex(DATE_RE).nullable().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]).optional(),
  employmentStatus: z.enum(["ACTIVE", "RESIGNED", "TERMINATED", "ON_LEAVE"]).optional(),
  orgUnitId: z.string().nullable().optional(),
});

export type EmployeeFormValues = z.infer<typeof schema>;

interface Props {
  formId: string;
  defaultValues?: Employee;
  onSubmit: (values: CreateEmployeeData) => void;
  disabled?: boolean;
}

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
const TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"] as const;
const STATUSES = ["ACTIVE", "RESIGNED", "TERMINATED", "ON_LEAVE"] as const;

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function EmployeeForm({ formId, defaultValues, onSubmit, disabled }: Props) {
  const t = useTranslations("employees");
  const tOrg = useTranslations("orgUnits");

  const { data: orgUnits } = useQuery({
    queryKey: ["org-units", "list-all"],
    queryFn: () => orgUnitsApi.list({ limit: 100 }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeNumber: "",
      name: "",
      nationality: "TW",
      employmentType: "FULL_TIME",
      employmentStatus: "ACTIVE",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        employeeNumber: defaultValues.employeeNumber,
        name: defaultValues.name,
        nationalId: defaultValues.nationalId,
        gender: defaultValues.gender ?? undefined,
        birthDate: defaultValues.birthDate ?? undefined,
        nationality: defaultValues.nationality ?? "TW",
        phone: defaultValues.phone ?? undefined,
        address: defaultValues.address ?? undefined,
        emergencyContactName: defaultValues.emergencyContactName ?? undefined,
        emergencyContactPhone: defaultValues.emergencyContactPhone ?? undefined,
        hireDate: defaultValues.hireDate ?? undefined,
        employmentType: defaultValues.employmentType,
        employmentStatus: defaultValues.employmentStatus,
        orgUnitId: defaultValues.orgUnitId ?? null,
      });
    }
  }, [defaultValues, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 基本資料 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("basicInfo")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Field label={`${t("employeeNumber")} *`} error={errors.employeeNumber?.message}>
            <Input {...register("employeeNumber")} placeholder="EMP-001" disabled={disabled} />
          </Field>
          <Field label={`${t("name")} *`} error={errors.name?.message}>
            <Input {...register("name")} placeholder="王小明" disabled={disabled} />
          </Field>
        </div>
      </section>

      {/* 職務資訊 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("employmentInfo")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Field label={t("hireDate")}>
            <DatePicker
              value={watch("hireDate") ?? undefined}
              onChange={(v) => setValue("hireDate", v ?? null)}
              placeholder={t("hireDate")}
              disabled={disabled}
            />
          </Field>
          <Field label={t("employmentType")}>
            <Select
              value={watch("employmentType") ?? "FULL_TIME"}
              onValueChange={(v) => setValue("employmentType", v as never)}
              disabled={disabled}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((v) => (
                  <SelectItem key={v} value={v}>{t(`employmentTypes.${v}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("employmentStatus")}>
            <Select
              value={watch("employmentStatus") ?? "ACTIVE"}
              onValueChange={(v) => setValue("employmentStatus", v as never)}
              disabled={disabled}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((v) => (
                  <SelectItem key={v} value={v}>{t(`employmentStatuses.${v}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={tOrg("title")}>
            <Select
              value={watch("orgUnitId") ?? "__none__"}
              onValueChange={(v) => setValue("orgUnitId", v === "__none__" ? null : v)}
              disabled={disabled}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {(orgUnits?.data ?? []).map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

      {/* 個人資料 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("personalInfo")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Field label={t("gender")}>
            <Select
              value={watch("gender") ?? "__none__"}
              onValueChange={(v) => setValue("gender", v === "__none__" ? null : (v as never))}
              disabled={disabled}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {GENDERS.map((v) => (
                  <SelectItem key={v} value={v}>{t(`genders.${v}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("birthDate")}>
            <DatePicker
              value={watch("birthDate") ?? undefined}
              onChange={(v) => setValue("birthDate", v ?? null)}
              placeholder={t("birthDate")}
              disabled={disabled}
            />
          </Field>
          <Field label={t("nationalId")}>
            <Input {...register("nationalId")} disabled={disabled} />
          </Field>
          <Field label={t("nationality")}>
            <Input {...register("nationality")} placeholder="TW" disabled={disabled} />
          </Field>
          <Field label={t("phone")}>
            <Input {...register("phone")} disabled={disabled} />
          </Field>
          <Field label={t("address")} className="col-span-full">
            <Input {...register("address")} disabled={disabled} />
          </Field>
        </div>
      </section>

      {/* 緊急聯絡人 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("emergencyContact")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Field label={t("emergencyContactName")}>
            <Input {...register("emergencyContactName")} disabled={disabled} />
          </Field>
          <Field label={t("emergencyContactPhone")}>
            <Input {...register("emergencyContactPhone")} disabled={disabled} />
          </Field>
        </div>
      </section>
    </form>
  );
}
