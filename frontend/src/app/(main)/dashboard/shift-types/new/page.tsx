"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { shiftTypesApi } from "@/lib/shift-types-api";
import { ShiftTypeForm, type ShiftTypeFormValues } from "../_components/shift-type-form";

export default function NewShiftTypePage() {
  const t = useTranslations("shiftTypes");
  const tc = useTranslations("common");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: ShiftTypeFormValues) => shiftTypesApi.create(data),
    onSuccess: () => { toast.success(`${t("createShiftType")} 成功`); router.push("/dashboard/shift-types"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("createShiftType")}</h1>
      <ShiftTypeForm formId="new-shift-type" onSubmit={(v) => mutation.mutate(v)} disabled={mutation.isPending} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>{tc("cancel")}</Button>
        <Button type="submit" form="new-shift-type" disabled={mutation.isPending}>
          {mutation.isPending ? tc("creating") : tc("create")}
        </Button>
      </div>
    </div>
  );
}
