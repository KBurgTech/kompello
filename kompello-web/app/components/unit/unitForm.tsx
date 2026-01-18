import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { Unit } from "~/lib/api/kompello";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { useImperativeHandle } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { ResponseError } from "~/lib/api/kompello/runtime";

export const unitSchema = z.object({
    shortName: z.string().min(1, "Short name is required").max(20),
    longName: z.string().min(1, "Long name is required").max(100),
});

export type UnitFormSchema = z.infer<typeof unitSchema>;

interface UnitFormProps {
    unit: Unit | null;
    companyId: string;
    onSavingChange?: (saving: boolean) => void;
    ref?: React.ForwardedRef<{ submitForm: () => void }>;
}

export default function UnitForm({ unit, companyId, onSavingChange, ref }: UnitFormProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const form = useForm<UnitFormSchema>({
        resolver: zodResolver(unitSchema),
        mode: "onChange",
        defaultValues: {
            shortName: unit?.shortName || "",
            longName: unit?.longName || "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: UnitFormSchema) => {
            if (unit?.uuid) {
                const patchData = {
                    shortName: values.shortName,
                    longName: values.longName,
                };
                await KompelloApi.unitsApi.unitsPartialUpdate({
                    uuid: unit.uuid,
                    patchedUnit: patchData as any,
                });
            } else {
                const createData = {
                    company: companyId,
                    shortName: values.shortName,
                    longName: values.longName,
                };
                await KompelloApi.unitsApi.unitsCreate({
                    unit: createData as any,
                });
            }
        },
        onMutate: async () => {
            onSavingChange?.(true);
        },
        onSuccess: async () => {
            if (unit?.uuid) {
                await queryClient.invalidateQueries({ queryKey: ["units", unit.uuid] });
            } else {
                await queryClient.invalidateQueries({ queryKey: ["units", companyId] });
            }
            toast.success(t("actions.messages.saveSuccess"));
        },
        onError: async (error: unknown) => {
            let message = t("common.error");
            if (error && typeof error === "object" && "response" in error && (error as ResponseError).response) {
                const data = await (error as ResponseError).response.clone().text();
                message = data || message;
            }
            toast.error(t("actions.messages.saveError"), { description: message });
        },
        onSettled: async () => {
            onSavingChange?.(false);
        },
    });

    // Expose form methods to parent component
    useImperativeHandle(ref, () => ({
        submitForm: () => {
            form.handleSubmit((values) => mutation.mutate(values))();
        },
    }));

    function handleSubmit(values: UnitFormSchema) {
        mutation.mutate(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("views.units.details")}</CardTitle>
                        <CardDescription>{t("views.units.detailsDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="shortName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.units.shortName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="kg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="longName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.units.longName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Kilograms" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
