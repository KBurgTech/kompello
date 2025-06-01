import type { Route } from "./+types/settings"
import { useTitle } from "~/components/titleContext"
import { useEffect } from "react"
import { useOutletContext, useNavigate } from "react-router"
import type { Company} from "~/lib/api/kompello"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from "~/components/ui/card"
import ActionButton from "~/components/actionButton"
import { KompelloApi } from "~/lib/api/kompelloApi"

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
    const navigate = useNavigate()

    useEffect(() => {
        setTitle(`Settings - ${context.name || "Company"}`)
    }, [])

    const form = useForm<z.infer<typeof companySchema>>({
        resolver: zodResolver(companySchema),
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
        navigate(0); // Refresh the page to reflect changes
    }

    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="grid grid-cols-1 gap-2 md:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Settings</CardTitle>
                        <CardDescription>Change the company name and description</CardDescription>
                        <CardAction><ActionButton icon={Save} action={() => form.handleSubmit(onSave)()}>Save</ActionButton></CardAction>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="shadcn" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                This is your public display name.
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us a little bit about yourself"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                This is your company description.
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
