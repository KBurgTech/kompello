import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { Unit } from "~/lib/api/kompello";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { useImperativeHandle } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export const unitSchema = z.object({
    shortName: z.string().min(1, "Short name is required").max(20),
    longName: z.string().min(1, "Long name is required").max(100),
});

export type UnitFormSchema = z.infer<typeof unitSchema>;

interface UnitFormProps {
    unit: Unit | null;
    companyId: string;
    onSave?: () => void;
    ref?: React.ForwardedRef<{ submitForm: () => void }>;
}

export default function UnitForm({ unit, companyId, onSave, ref }: UnitFormProps) {
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

    // Expose form methods to parent component
    useImperativeHandle(ref, () => ({
        submitForm: () => {
            form.handleSubmit(handleSubmit)();
        },
    }));

    async function handleSubmit(values: UnitFormSchema) {
        try {
            if (unit?.uuid) {
                // Update existing unit
                const patchData = {
                    shortName: values.shortName,
                    longName: values.longName,
                };

                await KompelloApi.unitsApi.unitsPartialUpdate({
                    uuid: unit.uuid,
                    patchedUnit: patchData as any,
                });
                queryClient.invalidateQueries({ queryKey: ["units", unit.uuid] });
            } else {
                // Create new unit
                const createData = {
                    company: companyId,
                    shortName: values.shortName,
                    longName: values.longName,
                };

                await KompelloApi.unitsApi.unitsCreate({
                    unit: createData as any,
                });
                queryClient.invalidateQueries({ queryKey: ["units", companyId] });
            }
            onSave?.();
        } catch (error) {
            console.error("Error saving unit:", error);
        }
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
