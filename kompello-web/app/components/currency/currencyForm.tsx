import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { Currency } from "~/lib/api/kompello";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { useImperativeHandle } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { ResponseError } from "~/lib/api/kompello/runtime";

export const currencySchema = z.object({
    symbol: z.string().min(1, "Symbol is required").max(5),
    shortName: z.string().min(1, "Short name is required").max(10),
    longName: z.string().min(1, "Long name is required").max(100),
});

export type CurrencyFormSchema = z.infer<typeof currencySchema>;

interface CurrencyFormProps {
    currency: Currency | null;
    companyId: string;
    onSavingChange?: (saving: boolean) => void;
    ref?: React.ForwardedRef<{ submitForm: () => void }>;
}

export default function CurrencyForm({ currency, companyId, onSavingChange, ref }: CurrencyFormProps) {
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

    const mutation = useMutation({
        mutationFn: async (values: CurrencyFormSchema) => {
            if (currency?.uuid) {
                const patchData = {
                    symbol: values.symbol,
                    shortName: values.shortName,
                    longName: values.longName,
                };
                await KompelloApi.currenciesApi.currenciesPartialUpdate({
                    uuid: currency.uuid,
                    patchedCurrency: patchData as any,
                });
            } else {
                const createData = {
                    company: companyId,
                    symbol: values.symbol,
                    shortName: values.shortName,
                    longName: values.longName,
                };
                await KompelloApi.currenciesApi.currenciesCreate({
                    currency: createData as any,
                });
            }
        },
        onMutate: async () => {
            onSavingChange?.(true);
        },
        onSuccess: async () => {
            if (currency?.uuid) {
                await queryClient.invalidateQueries({ queryKey: ["currencies", currency.uuid] });
            } else {
                await queryClient.invalidateQueries({ queryKey: ["currencies", companyId] });
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

    function handleSubmit(values: CurrencyFormSchema) {
        mutation.mutate(values);
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
