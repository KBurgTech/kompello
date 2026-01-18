import { useTitle } from "~/components/titleContext";
import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import type { Company } from "~/lib/api/kompello";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { Button } from "~/components/ui/button";
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

export default function CurrenciesList() {
    const { setTitle, setHeaderAction } = useTitle();
    const company = useOutletContext<Company>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(t("views.currencies.title"));
        setHeaderAction(undefined);
    }, [company.name, setTitle, setHeaderAction, t]);

    // Fetch currencies for this company
    const { data: currenciesData, isLoading, error } = useQuery({
        queryKey: ["currencies", company.uuid],
        queryFn: async () => {
            const result = await KompelloApi.currenciesApi.currenciesList({
                company: company.uuid,
            });
            return Array.isArray(result) ? result : [];
        },
    });

    const currencies = currenciesData || [];

    const handleAddCurrency = () => {
        navigate(`/${company.uuid}/currencies/new`);
    };

    const handleSelectCurrency = (currencyId: string) => {
        navigate(`/${company.uuid}/currencies/${currencyId}`);
    };

    return (
        <div className="grid auto-rows-min gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t("views.currencies.title")}</CardTitle>
                    <CardDescription>{t("views.currencies.description")}</CardDescription>
                    <CardAction>
                        <Button onClick={handleAddCurrency} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("views.currencies.addCurrency")}
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8">{t("common.loading")}</div>}
                    {error && <div className="text-center py-8 text-red-500">{t("common.error")}</div>}
                    {currencies.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-gray-500">{t("common.noData")}</div>
                    )}
                    {currencies.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("views.currencies.symbol")}</TableHead>
                                        <TableHead>{t("views.currencies.shortName")}</TableHead>
                                        <TableHead>{t("views.currencies.longName")}</TableHead>
                                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currencies.map((currency) => (
                                        <TableRow
                                            key={currency.uuid}
                                            onClick={() => handleSelectCurrency(currency.uuid!)}
                                        >
                                            <TableCell className="font-medium">
                                                {currency.symbol}
                                            </TableCell>
                                            <TableCell>{currency.shortName}</TableCell>
                                            <TableCell>{currency.longName}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectCurrency(currency.uuid!);
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
