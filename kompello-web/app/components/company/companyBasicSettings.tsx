import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { Company } from "~/lib/api/kompello";
import { KompelloApi } from "~/lib/api/kompelloApi";
import ActionButton from "../actionButton";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "../ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export default function CompanyBasicSettings({ company }: { company: Company }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const companySchema = z.object({
        name: z.string().min(2).max(100),
        description: z.string().min(10).max(500),
    });

    const form = useForm<z.infer<typeof companySchema>>({
        resolver: zodResolver(companySchema),
        mode: "onChange",
        defaultValues: {
            name: company.name || "",
            description: company.description || "",
        },
    })

    async function onSave(values: z.infer<typeof companySchema>) {
        const content = {
            uuid: company.uuid,
            patchedCompany: {
                ...values
            }
        };
        await KompelloApi.companyApi.companiesPartialUpdate(content);
        queryClient.invalidateQueries({ queryKey: ["company", company.uuid] });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("views.companySettings.basic.title")}</CardTitle>
                <CardDescription>{t("views.companySettings.basic.description")}</CardDescription>
                <CardAction><ActionButton icon={Save} action={() => form.handleSubmit(onSave)()}>{t("actions.save")}</ActionButton></CardAction>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.companySettings.basic.companyName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="shadcn" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t("views.companySettings.basic.companyNameDescription")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.companySettings.basic.companyDescription")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us a little bit about yourself"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t("views.companySettings.basic.companyDescriptionDescription")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
