"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTranslations } from "@/i18n/provider";
import { employeesApi, type UpdateEmployeeData } from "@/lib/employees-api";
import { EmployeeForm } from "./employee-form";

interface Props {
  employeeId: string;
}

export function EditEmployeeSheet({ employeeId }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => employeesApi.get(employeeId),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (input: UpdateEmployeeData) => employeesApi.update(employeeId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employee", employeeId] });
      setOpen(false);
      toast.success(`${t("editEmployee")} 成功`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("editEmployee")}</SheetTitle>
          </SheetHeader>

          <div className="px-1 py-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{tc("loading")}</p>
            ) : (
              <EmployeeForm
                formId="edit-employee"
                defaultValues={data}
                onSubmit={(values) => mutation.mutate(values)}
                disabled={mutation.isPending}
              />
            )}
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              {tc("cancel")}
            </Button>
            <Button type="submit" form="edit-employee" disabled={mutation.isPending || isLoading}>
              {mutation.isPending ? tc("saving") : tc("save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
