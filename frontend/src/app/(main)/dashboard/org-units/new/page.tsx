"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { orgUnitsApi } from "@/lib/org-units-api";
import { OrgUnitForm, type OrgUnitFormValues } from "../_components/org-unit-form";

export default function NewOrgUnitPage() {
  const t = useTranslations("orgUnits");
  const tc = useTranslations("common");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: OrgUnitFormValues) => orgUnitsApi.create(data),
    onSuccess: () => {
      toast.success(`${t("createOrgUnit")} 成功`);
      router.push("/dashboard/org-units");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("createOrgUnit")}</h1>
      <OrgUnitForm
        formId="new-org-unit"
        onSubmit={(v) => mutation.mutate(v)}
        disabled={mutation.isPending}
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>
          {tc("cancel")}
        </Button>
        <Button type="submit" form="new-org-unit" disabled={mutation.isPending}>
          {mutation.isPending ? tc("creating") : tc("create")}
        </Button>
      </div>
    </div>
  );
}
