import type { Route } from "./+types/settings"
import { useTitle } from "~/components/titleContext"
import { useEffect } from "react"
import { useOutletContext } from "react-router"
import type { Company} from "~/lib/api/kompello"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "~/components/ui/card"
import ActionButton from "~/components/actionButton"
import { KompelloApi } from "~/lib/api/kompelloApi"
import { useTranslation } from "react-i18next"
import { useQueryClient } from '@tanstack/react-query'

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ]
}

const companySchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().min(10).max(500),
});

export default function Settings() {
    const { setTitle } = useTitle()
    const context = useOutletContext<Company>()
    const { t } = useTranslation();
    const queryClient = useQueryClient()

    useEffect(() => {
        setTitle(`${t("views.companySettings.settings")} - ${context.name || "Company"}`)
    }, [context.name])

    const form = useForm<z.infer<typeof companySchema>>({
        resolver: zodResolver(companySchema),
        mode: "onChange",
        defaultValues: {
            name: context.name || "",
            description: context.description || "",
        },
    })

    async function onSave(values: z.infer<typeof companySchema>) {
        const content = {
            uuid: context.uuid,
            patchedCompany: {
                ...values
            }
        };
        await KompelloApi.companyApi.companiesPartialUpdate(content);
        queryClient.invalidateQueries({queryKey: ["company", context.uuid]});
    }

    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="grid grid-cols-1 gap-2 md:col-span-3">
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
            </div>
        </div>
    )
}
