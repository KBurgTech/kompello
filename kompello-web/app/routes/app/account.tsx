import { KompelloApi } from "~/lib/api/kompelloApi"
import type { User } from "~/lib/api/kompello"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "~/components/ui/card"
import { useTranslation } from "react-i18next"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import ActionButton from "~/components/actionButton"
import { MoveLeft, Save } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from "~/components/ui/skeleton"
import { useNavigate } from "react-router"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"

function UserDetailsForm({ user }: { user: User }) {
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

function UserPasswordChangeForm({ user }: { user: User }) {
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

export default function AccountSettings() {
    const { t } = useTranslation();

    const currentUserQuery = useQuery({
        queryKey: ["currentuser"],
        queryFn: async () => {
            const user = await KompelloApi.userApi.usersMe();
            return user;
        }
    })

    return (
        <div className="flex flex-col items-center justify-center min-h-svh gap-4">
            <Button className="flex justify-start w-full max-w-2xl mb-4" variant="link" onClick={() => history.back()}>
                <MoveLeft /> {t("actions.back")}
            </Button>
            {currentUserQuery.isLoading ? <Skeleton className="h-12 w-full max-w-2xl" /> : <UserDetailsForm user={currentUserQuery.data} />}
            {currentUserQuery.isLoading ? <Skeleton className="h-12 w-full max-w-2xl" /> : <UserPasswordChangeForm user={currentUserQuery.data} />}
        </div>
    )
}
