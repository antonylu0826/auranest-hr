"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { employeesApi, type UpdateEmployeeData } from "@/lib/employees-api";
import { EmployeeForm } from "../../_components/employee-form";

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeesApi.get(id),
  });

  const mutation = useMutation({
    mutationFn: (input: UpdateEmployeeData) => employeesApi.update(id, input),
    onSuccess: () => {
      toast.success(`${t("editEmployee")} 成功`);
      router.push("/dashboard/employees");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("editEmployee")}</h1>
        {data && (
          <p className="text-muted-foreground text-sm">
            {data.employeeNumber} · {data.name}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <EmployeeForm
          formId="edit-employee"
          defaultValues={data}
          onSubmit={(values) => mutation.mutate(values)}
          disabled={mutation.isPending}
        />
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>
          {tc("cancel")}
        </Button>
        <Button type="submit" form="edit-employee" disabled={mutation.isPending || isLoading}>
          {mutation.isPending ? tc("saving") : tc("save")}
        </Button>
      </div>
    </div>
  );
}
