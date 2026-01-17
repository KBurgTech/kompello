import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import type { CustomerFormSchema } from "./customerForm";

interface FormSectionProps {
    form: UseFormReturn<CustomerFormSchema>;
    onSubmit: (values: CustomerFormSchema) => void;
}

export function PersonalInfoSection({ form, onSubmit }: FormSectionProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("views.customers.personalInfo")}</CardTitle>
                <CardDescription>{t("views.customers.personalInfoDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.customers.title")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Mr., Ms., Dr." {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="firstname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("common.firstName")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("common.lastName")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="birthdate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.customers.birthdate")}</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export function ContactInfoSection({ form, onSubmit }: FormSectionProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("views.customers.contactInfo")}</CardTitle>
                <CardDescription>{t("views.customers.contactInfoDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.email")}</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="mobilePhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.customers.mobilePhone")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="landlinePhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.customers.landlinePhone")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export function AddressSection({ form, onSubmit }: FormSectionProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("views.customers.address")}</CardTitle>
                <CardDescription>{t("views.customers.addressDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="address.street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.customers.street")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address.street2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.customers.street2")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Apt. 123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="address.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.customers.city")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="New York" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address.state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.customers.state")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="NY" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address.postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.customers.postalCode")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="10001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address.country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.customers.country")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="United States" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export function NotesSection({ form, onSubmit }: FormSectionProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("views.customers.notes")}</CardTitle>
                <CardDescription>{t("views.customers.notesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.notes")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any notes about this customer..."
                                            className="resize-none"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
