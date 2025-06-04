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
import { Button } from "~/components/ui/button"
import { useNavigate } from "react-router"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"

export default function UserPasswordChangeForm({ user }: { user: User }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const passwordChangeSchema = z.object({
        password: z.string().min(8, t("views.accountSettings.password.passwordLengthError", { length: 8 })),
        passwordConfirm: z.string().min(8, t("views.accountSettings.password.passwordLengthError", { length: 8 }))
    }).refine((data) => data.password === data.passwordConfirm, {
        message: t("views.accountSettings.password.passwordMatchError"),
        path: ["passwordConfirm"],
    });

    const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
        resolver: zodResolver(passwordChangeSchema),
        mode: "onChange",
        defaultValues: {
            password: "",
            passwordConfirm: "",
        },
    });

    async function onSavePassword(values: z.infer<typeof passwordChangeSchema>) {
        const content = {
            uuid: user.uuid,
            password: {
                password: values.password
            }
        };
        await KompelloApi.userApi.usersSetPassword(content);
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate("/auth/login")
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>{t("views.accountSettings.password.title")}</CardTitle>
                <CardDescription>{t("views.accountSettings.password.description")}</CardDescription>
                <CardAction>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button disabled={!passwordForm.formState.isValid}>
                                <Save />
                                {t("actions.save")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="leading-none font-medium">{t("common.confirmationRequired")}</h4>
                                    <p className="text-muted-foreground text-sm">
                                        {t("views.accountSettings.password.saveConfirmation")}
                                    </p>
                                </div>
                                <ActionButton icon={Save} action={() => passwordForm.handleSubmit(onSavePassword, () => { throw new Error("Form is not valid!") })()}>{t("actions.save")}</ActionButton>
                            </div>
                        </PopoverContent>
                    </Popover>
                </CardAction>
            </CardHeader>
            <CardContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onSavePassword)} className="space-y-8">
                        <FormField
                            control={passwordForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.password")}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t("views.accountSettings.password.passwordDescription")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="passwordConfirm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.password")}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t("Please confirm your new Password")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>)
}

