import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { Currency } from "~/lib/api/kompello";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { useImperativeHandle } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export const currencySchema = z.object({
    symbol: z.string().min(1, "Symbol is required").max(5),
    shortName: z.string().min(1, "Short name is required").max(10),
    longName: z.string().min(1, "Long name is required").max(100),
});

export type CurrencyFormSchema = z.infer<typeof currencySchema>;

interface CurrencyFormProps {
    currency: Currency | null;
    companyId: string;
    onSave?: () => void;
    ref?: React.ForwardedRef<{ submitForm: () => void }>;
}

export default function CurrencyForm({ currency, companyId, onSave, ref }: CurrencyFormProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const form = useForm<CurrencyFormSchema>({
        resolver: zodResolver(currencySchema),
        mode: "onChange",
        defaultValues: {
            symbol: currency?.symbol || "",
            shortName: currency?.shortName || "",
            longName: currency?.longName || "",
        },
    });

    // Expose form methods to parent component
    useImperativeHandle(ref, () => ({
        submitForm: () => {
            form.handleSubmit(handleSubmit)();
        },
    }));

    async function handleSubmit(values: CurrencyFormSchema) {
        try {
            if (currency?.uuid) {
                // Update existing currency
                const patchData = {
                    symbol: values.symbol,
                    shortName: values.shortName,
                    longName: values.longName,
                };

                await KompelloApi.currenciesApi.currenciesPartialUpdate({
                    uuid: currency.uuid,
                    patchedCurrency: patchData as any,
                });
                queryClient.invalidateQueries({ queryKey: ["currencies", currency.uuid] });
            } else {
                // Create new currency
                const createData = {
                    company: companyId,
                    symbol: values.symbol,
                    shortName: values.shortName,
                    longName: values.longName,
                };

                await KompelloApi.currenciesApi.currenciesCreate({
                    currency: createData as any,
                });
                queryClient.invalidateQueries({ queryKey: ["currencies", companyId] });
            }
            onSave?.();
        } catch (error) {
            console.error("Error saving currency:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("views.currencies.details")}</CardTitle>
                        <CardDescription>{t("views.currencies.detailsDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="symbol"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.currencies.symbol")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="€" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shortName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.currencies.shortName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="EUR" {...field} />
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
                                    <FormLabel>{t("views.currencies.longName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Euro" {...field} />
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
