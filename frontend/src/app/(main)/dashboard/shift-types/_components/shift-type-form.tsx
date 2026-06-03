"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "@/i18n/provider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import type { ShiftType, CreateShiftTypeData, ShiftCategory } from "@/lib/shift-types-api";

const TIME_RE = /^\d{2}:\d{2}$/;
const time = z.string().regex(TIME_RE, "HH:mm").nullable().optional();

const schema = z.object({
  name: z.string().min(1, "必填"),
  code: z.string().min(1, "必填"),
  category: z.enum(["FIXED", "ROTATING"]),
  workStart: time,
  workEnd: time,
  breakStart: time,
  breakEnd: time,
  observeHolidays: z.boolean(),
  flexEarliestStart: time,
  flexLatestStart: time,
  workDaysInCycle: z.number().int().positive().nullable().optional(),
  restDaysInCycle: z.number().int().positive().nullable().optional(),
  isActive: z.boolean(),
});

export type ShiftTypeFormValues = z.infer<typeof schema>;

interface Props {
  formId: string;
  defaultValues?: ShiftType;
  onSubmit: (values: ShiftTypeFormValues) => void;
  disabled?: boolean;
}

function TimeField({ label, value, onChange, disabled }: {
  label: string;
  value?: string | null;
  onChange: (v: string | undefined) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <TimePicker value={value ?? undefined} onChange={onChange} placeholder={label} disabled={disabled} />
    </div>
  );
}

export function ShiftTypeForm({ formId, defaultValues, onSubmit, disabled }: Props) {
  const t = useTranslations("shiftTypes");

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<ShiftTypeFormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        category: "FIXED",
        observeHolidays: true,
        isActive: true,
      },
    });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name,
        code: defaultValues.code,
        category: defaultValues.category,
        workStart: defaultValues.workStart ?? undefined,
        workEnd: defaultValues.workEnd ?? undefined,
        breakStart: defaultValues.breakStart ?? undefined,
        breakEnd: defaultValues.breakEnd ?? undefined,
        observeHolidays: defaultValues.observeHolidays,
        flexEarliestStart: defaultValues.flexEarliestStart ?? undefined,
        flexLatestStart: defaultValues.flexLatestStart ?? undefined,
        workDaysInCycle: defaultValues.workDaysInCycle,
        restDaysInCycle: defaultValues.restDaysInCycle,
        isActive: defaultValues.isActive,
      });
    }
  }, [defaultValues, reset]);

  const category = watch("category");

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* 基本設定 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t("basicSettings")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>{t("name")} *</Label>
            <Input {...register("name")} placeholder="早班" disabled={disabled} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{t("code")} *</Label>
            <Input {...register("code")} placeholder="MORNING" className="uppercase" disabled={disabled} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{t("category")}</Label>
            <Select
              value={category}
              onValueChange={(v) => setValue("category", v as ShiftCategory)}
              disabled={disabled}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">{t("categories.FIXED")}</SelectItem>
                <SelectItem value="ROTATING">{t("categories.ROTATING")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TimeField label={t("workStart")} value={watch("workStart")} onChange={(v) => setValue("workStart", v ?? null)} disabled={disabled} />
          <TimeField label={t("workEnd")} value={watch("workEnd")} onChange={(v) => setValue("workEnd", v ?? null)} disabled={disabled} />
          <TimeField label={t("breakStart")} value={watch("breakStart")} onChange={(v) => setValue("breakStart", v ?? null)} disabled={disabled} />
          <TimeField label={t("breakEnd")} value={watch("breakEnd")} onChange={(v) => setValue("breakEnd", v ?? null)} disabled={disabled} />
          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(v) => setValue("isActive", v === true)}
              disabled={disabled}
            />
            <Label htmlFor="isActive" className="cursor-pointer">{t("isActive")}</Label>
          </div>
        </div>
      </section>

      {/* 固定班 */}
      {category === "FIXED" && (
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            {t("fixedSettings")} <Badge variant="secondary">FIXED</Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TimeField label={t("flexEarliestStart")} value={watch("flexEarliestStart")} onChange={(v) => setValue("flexEarliestStart", v ?? null)} disabled={disabled} />
            <TimeField label={t("flexLatestStart")} value={watch("flexLatestStart")} onChange={(v) => setValue("flexLatestStart", v ?? null)} disabled={disabled} />
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="observeHolidays"
                checked={watch("observeHolidays")}
                onCheckedChange={(v) => setValue("observeHolidays", v === true)}
                disabled={disabled}
              />
              <Label htmlFor="observeHolidays" className="cursor-pointer">{t("observeHolidays")}</Label>
            </div>
          </div>
        </section>
      )}

      {/* 輪班 */}
      {category === "ROTATING" && (
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            {t("rotatingSettings")} <Badge>ROTATING</Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>{t("workDaysInCycle")}</Label>
              <Input type="number" min={1} {...register("workDaysInCycle", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })} placeholder="4" disabled={disabled} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("restDaysInCycle")}</Label>
              <Input type="number" min={1} {...register("restDaysInCycle", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })} placeholder="2" disabled={disabled} />
            </div>
          </div>
        </section>
      )}

    </form>
  );
}
