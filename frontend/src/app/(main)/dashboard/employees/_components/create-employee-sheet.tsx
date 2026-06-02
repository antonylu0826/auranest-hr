"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTranslations } from "@/i18n/provider";
import { employeesApi, type CreateEmployeeData } from "@/lib/employees-api";
import { EmployeeForm } from "./employee-form";

export function CreateEmployeeSheet() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateEmployeeData) => employeesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
      toast.success(`${t("createEmployee")} 成功`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 size-4" />
        {t("newEmployee")}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("createEmployee")}</SheetTitle>
          </SheetHeader>

          <div className="px-1 py-4">
            <EmployeeForm
              formId="create-employee"
              onSubmit={(values) => mutation.mutate(values)}
              disabled={mutation.isPending}
            />
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              {tc("cancel")}
            </Button>
            <Button type="submit" form="create-employee" disabled={mutation.isPending}>
              {mutation.isPending ? tc("creating") : tc("create")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
