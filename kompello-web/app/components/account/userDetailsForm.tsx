import { KompelloApi } from "~/lib/api/kompelloApi"
import type { User } from "~/lib/api/kompello"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "~/components/ui/card"
import { useTranslation } from "react-i18next"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import ActionButton from "~/components/actionButton"
import { Save } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function UserDetailsForm({ user }: { user: User }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const userSchema = z.object({
        firstName: z.string().min(2).max(100),
        lastName: z.string().min(2).max(100),
        email: z.string().email(),
    });

    const userForm = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        mode: "onChange",
        defaultValues: {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
        },
    })

    const saveMutation = useMutation({
        mutationFn: async (values: z.infer<typeof userSchema>) => {
            const content = {
                uuid: user.uuid,
                patchedUser: {
                    ...values
                }
            };
            return await KompelloApi.userApi.usersPartialUpdate(content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currentuser"] });
        },
    })

    async function onSaveUser(values: z.infer<typeof userSchema>) {
        await saveMutation.mutateAsync(values);
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>{t("views.accountSettings.basic.title")}</CardTitle>
                <CardDescription>{t("views.accountSettings.basic.description")}</CardDescription>
                <CardAction>
                    <ActionButton disabled={!userForm.formState.isValid} icon={Save} action={() => userForm.handleSubmit(onSaveUser, () => { throw new Error("Form is not valid!") })()}>{t("actions.save")}</ActionButton></CardAction>
            </CardHeader>
            <CardContent>
                <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onSaveUser)} className="space-y-8">
                        <FormField
                            control={userForm.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.firstName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Max" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t("views.accountSettings.basic.firstNameDescription")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={userForm.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.lastName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mustermann" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t("views.accountSettings.basic.lastNameDescription")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={userForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.email")}</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="max@mustermann.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t("views.accountSettings.basic.emailDescription")}
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
