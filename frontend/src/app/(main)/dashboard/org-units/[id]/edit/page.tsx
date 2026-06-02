"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orgUnitsApi } from "@/lib/org-units-api";
import { OrgUnitForm, type OrgUnitFormValues } from "../../_components/org-unit-form";

export default function EditOrgUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("orgUnits");
  const tc = useTranslations("common");
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["org-unit", id],
    queryFn: () => orgUnitsApi.get(id),
  });

  const mutation = useMutation({
    mutationFn: (input: OrgUnitFormValues) => orgUnitsApi.update(id, input),
    onSuccess: () => {
      toast.success(`${t("editOrgUnit")} 成功`);
      router.push("/dashboard/org-units");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("editOrgUnit")}</h1>
        {data && <p className="text-muted-foreground text-sm">{data.name}</p>}
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <OrgUnitForm
          formId="edit-org-unit"
          defaultValues={data}
          editId={id}
          onSubmit={(v) => mutation.mutate(v)}
          disabled={mutation.isPending}
        />
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>
          {tc("cancel")}
        </Button>
        <Button type="submit" form="edit-org-unit" disabled={mutation.isPending || isLoading}>
          {mutation.isPending ? tc("saving") : tc("save")}
        </Button>
      </div>
    </div>
  );
}
