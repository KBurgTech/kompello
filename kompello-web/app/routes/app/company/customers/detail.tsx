import { useTitle } from "~/components/titleContext";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import type { Company } from "~/lib/api/kompello";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { KompelloApi } from "~/lib/api/kompelloApi";
import CustomerForm from "~/components/customer/customerForm";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Spinner } from "~/components/ui/spinner";

function formatDate(date: Date | string | undefined): string {
    if (!date) return "-";
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function CustomerDetail() {
    const { setTitle, setHeaderAction } = useTitle();
    const company = useOutletContext<Company>();
    const { customerId } = useParams();
    const { t } = useTranslation();
    const formRef = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Check if this is a new customer
    const isNew = customerId === "new";

    // Fetch customer if not new
    const { data: customer, isLoading, error } = useQuery({
        queryKey: ["customers", customerId],
        queryFn: async () => {
            if (isNew) return null;
            const result = await KompelloApi.customersApi.customersRetrieve({
                uuid: customerId!,
            });
            return result;
        },
        enabled: !isNew && !!customerId,
    });

    useEffect(() => {
        const title = isNew
            ? t("views.customers.addCustomer")
            : customer
            ? `${customer.firstname} ${customer.lastname}`
            : t("views.customers.title");

        setTitle(title);

        const handleSave = () => {
            formRef.current?.submitForm();
        };

        const handleActiveChange = (active: boolean) => {
            formRef.current?.setActive(active);
        };

        // Set header actions with breadcrumbs
        setHeaderAction({
            breadcrumbs: [
                {
                    label: t("views.customers.title"),
                    href: `/${company.uuid}/customers`,
                },
                {
                    label: title,
                },
            ],
            rightContent: (
                <div className="flex items-center gap-3">
                    {/* Metadata */}
                    {(customer?.createdOn || customer?.modifiedOn) && (
                        <div className="text-xs text-gray-500 hidden md:block">
                            {customer?.modifiedOn && (
                                <div>
                                    {t("common.lastModified")}: {formatDate(customer.modifiedOn)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Active Status Toggle */}
                    {!isNew && (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="active-status"
                                checked={customer?.isActive ?? true}
                                onCheckedChange={handleActiveChange}
                            />
                            <label htmlFor="active-status" className="text-xs text-gray-600 cursor-pointer">
                                {customer?.isActive ? t("views.customers.active") : t("views.customers.inactive")}
                            </label>
                        </div>
                    )}

                    {/* Save Button */}
                    <Button onClick={handleSave} size="sm" disabled={isSaving} aria-busy={isSaving}>
                        {isSaving && <Spinner className="mr-2" />}
                        {isSaving ? t("common.saving") : t("actions.save")}
                    </Button>
                </div>
            ),
        });
    }, [customer, isNew, setTitle, setHeaderAction, t, company.uuid, isSaving]);

    if (!isNew && isLoading) {
        return (
            <div className="grid auto-rows-min gap-4">
                <Card>
                    <CardContent className="text-center py-8">{t("common.loading")}</CardContent>
                </Card>
            </div>
        );
    }

    if (!isNew && error) {
        return (
            <div className="grid auto-rows-min gap-4">
                <Card>
                    <CardContent className="text-center py-8 text-red-500">{t("common.error")}</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="px-4">
                <CustomerForm 
                    ref={formRef}
                    customer={customer || null} 
                    companyId={company.uuid!} 
                    onSavingChange={setIsSaving}
                />
            </div>
        </div>
    );
}
