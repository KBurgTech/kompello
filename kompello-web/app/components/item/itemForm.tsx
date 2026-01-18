import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { Item } from "~/lib/api/kompello";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { useImperativeHandle, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { Currency, Unit } from "~/lib/api/kompello";

export const itemSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().optional().nullable(),
    currency: z.string().min(1, "Currency is required"),
    unit: z.string().min(1, "Unit is required"),
    pricePerUnit: z.string().min(1, "Price per unit is required"),
    priceMax: z.string().optional().nullable(),
});

export type ItemFormSchema = z.infer<typeof itemSchema>;

interface ItemFormProps {
    item: Item | null;
    companyId: string;
    onSave?: () => void;
    ref?: React.ForwardedRef<{ submitForm: () => void }>;
}

export default function ItemForm({ item, companyId, onSave, ref }: ItemFormProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);

    const form = useForm<ItemFormSchema>({
        resolver: zodResolver(itemSchema),
        mode: "onChange",
        defaultValues: {
            name: item?.name || "",
            description: item?.description || "",
            currency: item?.currency || "",
            unit: item?.unit || "",
            pricePerUnit: item?.pricePerUnit || "",
            priceMax: item?.priceMax || "",
        },
    });

    // Fetch currencies and units for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [currenciesData, unitsData] = await Promise.all([
                    KompelloApi.currenciesApi.currenciesList({ company: companyId }),
                    KompelloApi.unitsApi.unitsList({ company: companyId }),
                ]);
                setCurrencies(Array.isArray(currenciesData) ? currenciesData : []);
                setUnits(Array.isArray(unitsData) ? unitsData : []);
            } catch (error) {
                console.error("Error fetching currencies/units:", error);
            }
        };
        fetchData();
    }, [companyId]);

    // Expose form methods to parent component
    useImperativeHandle(ref, () => ({
        submitForm: () => {
            form.handleSubmit(handleSubmit)();
        },
    }));

    async function handleSubmit(values: ItemFormSchema) {
        try {
            if (item?.uuid) {
                // Update existing item
                const patchData = {
                    name: values.name,
                    description: values.description || "",
                    currency: values.currency,
                    unit: values.unit,
                    pricePerUnit: values.pricePerUnit,
                    priceMax: values.priceMax || null,
                };

                await KompelloApi.itemsApi.itemsPartialUpdate({
                    uuid: item.uuid,
                    patchedItem: patchData as any,
                });
                queryClient.invalidateQueries({ queryKey: ["items", item.uuid] });
            } else {
                // Create new item
                const createData = {
                    company: companyId,
                    name: values.name,
                    description: values.description || "",
                    currency: values.currency,
                    unit: values.unit,
                    pricePerUnit: values.pricePerUnit,
                    priceMax: values.priceMax || null,
                };

                await KompelloApi.itemsApi.itemsCreate({
                    item: createData as any,
                });
                queryClient.invalidateQueries({ queryKey: ["items", companyId] });
            }
            onSave?.();
        } catch (error) {
            console.error("Error saving item:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("views.items.details")}</CardTitle>
                        <CardDescription>{t("views.items.detailsDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.items.name")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("views.items.namePlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.items.description")}</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder={t("views.items.descriptionPlaceholder")} 
                                            {...field} 
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pricePerUnit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.items.pricePerUnit")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="priceMax"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.items.priceMax")}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="0.00" 
                                                {...field} 
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.items.currency")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("views.items.selectCurrency")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {currencies.map((currency) => (
                                                    <SelectItem key={currency.uuid} value={currency.uuid}>
                                                        {currency.symbol} - {currency.shortName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.items.unit")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("views.items.selectUnit")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.uuid} value={unit.uuid}>
                                                        {unit.shortName} - {unit.longName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
