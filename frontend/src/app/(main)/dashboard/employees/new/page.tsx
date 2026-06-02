"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { employeesApi, type CreateEmployeeData } from "@/lib/employees-api";
import { EmployeeForm } from "../_components/employee-form";

export default function NewEmployeePage() {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: CreateEmployeeData) => employeesApi.create(data),
    onSuccess: () => {
      toast.success(`${t("createEmployee")} 成功`);
      router.push("/dashboard/employees");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("createEmployee")}</h1>
      </div>

      <EmployeeForm
        formId="new-employee"
        onSubmit={(values) => mutation.mutate(values)}
        disabled={mutation.isPending}
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>
          {tc("cancel")}
        </Button>
        <Button type="submit" form="new-employee" disabled={mutation.isPending}>
          {mutation.isPending ? tc("creating") : tc("create")}
        </Button>
      </div>
    </div>
  );
}
