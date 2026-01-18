import { useTitle } from "~/components/titleContext";
import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { Company } from "~/lib/api/kompello";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "~/components/ui/card";

export default function CustomersList() {
    const { setTitle, setHeaderAction } = useTitle();
    const company = useOutletContext<Company>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(t("views.customers.title"));
        setHeaderAction(undefined);
    }, [company.name, setTitle, setHeaderAction, t]);

    // Fetch customers for this company
    const { data: customersData, isLoading, error } = useQuery({
        queryKey: ["customers", company.uuid],
        queryFn: async () => {
            const result = await KompelloApi.customersApi.customersList({
                company: company.uuid,
            });
            return Array.isArray(result) ? result : [];
        },
    });

    const customers = customersData || [];

    const handleAddCustomer = () => {
        navigate(`/${company.uuid}/customers/new`);
    };

    const handleSelectCustomer = (customerId: string) => {
        navigate(`/${company.uuid}/customers/${customerId}`);
    };

    return (
        <div className="grid auto-rows-min gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t("views.customers.title")}</CardTitle>
                    <CardDescription>{t("views.customers.description")}</CardDescription>
                    <CardAction>
                        <Button onClick={handleAddCustomer} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("views.customers.addCustomer")}
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8">{t("common.loading")}</div>}
                    {error && <div className="text-center py-8 text-red-500">{t("common.error")}</div>}
                    {customers.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-gray-500">{t("common.noData")}</div>
                    )}
                    {customers.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("views.customers.name")}</TableHead>
                                        <TableHead>{t("common.email")}</TableHead>
                                        <TableHead>{t("views.customers.mobilePhone")}</TableHead>
                                        <TableHead>{t("views.customers.address")}</TableHead>
                                        <TableHead>{t("views.customers.status")}</TableHead>
                                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow
                                            key={customer.uuid}
                                            onClick={() => handleSelectCustomer(customer.uuid!)}
                                        >
                                            <TableCell className="font-medium">
                                                {customer.firstname} {customer.lastname}
                                            </TableCell>
                                            <TableCell>{customer.email || "-"}</TableCell>
                                            <TableCell>{customer.mobilePhone || "-"}</TableCell>
                                            <TableCell>{customer.addressSummary || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={customer.isActive ? "default" : "secondary"}>
                                                    {customer.isActive ? t("views.customers.active") : t("views.customers.inactive")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectCustomer(customer.uuid!);
                                                    }}
                                                >
                                                    {t("actions.edit")}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
