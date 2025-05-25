import { Button } from "~/components/ui/button"

import type { Route } from "./+types/login"
import { cn } from "~/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useAuth } from "~/components/authContext"
import { useNavigate } from "react-router"
import { useEffect, useState, type JSX } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert"

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Login" },
        { name: "description", content: "Login to your account" },
    ]
}

const loginFormSchema = z.object({
    username: z.string().email(),
    password: z.string()
})

/**
 * Renders the login form for user authentication.
 *
 * This component displays a form with username and password fields,
 * validates input using Zod schema, and handles user login via the `auth` context.
 * On successful login, the user is redirected to the home page.
 * If the user is already authenticated, they are automatically redirected.
 *
 * @returns {JSX.Element} The login form UI.
 */
export default function Login(): JSX.Element {
    const auth = useAuth()
    const navigate = useNavigate();
    const [loginFailed, setLoginFailed] = useState(false)
    const [loginInProgress, setLoginInProgress] = useState(false)

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: ""
        },
    })

    /**
     * Handles the login process by authenticating the user with the provided credentials.
     * If authentication is successful, navigates to the home page.
     *
     * @param values - The form values containing the username and password, inferred from `loginFormSchema`.
     * @returns A promise that resolves when the login process is complete.
     */
    async function onLogin(values: z.infer<typeof loginFormSchema>) {
        setLoginFailed(false)
        setLoginInProgress(true)

        const success = await auth.login(values.username, values.password)
        setLoginFailed(!success)
        setLoginInProgress(false)

        if (success) {
            navigate("/")
        }
    }

    useEffect(() => {
        // If the user is already authenticated, redirect to the home page
        if (auth.user) {
            navigate("/");
        }
    }, []);

    return (<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
            <div className={cn("flex flex-col gap-6")}>
                {loginFailed && !auth.user && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failure</AlertTitle>
                        <AlertDescription>
                            Authenticating you in with the provided credentials failed. Please check your username and password.
                        </AlertDescription>
                    </Alert>
                )}
                <Card>

                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onLogin)} className="space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
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
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="••••••••" type="password" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        This is your account password.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button disabled={loginInProgress} className="w-full" type="submit">
                                            {loginInProgress && (<Loader2 className="animate-spin" />)}
                                            Login
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
    )
}
