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

export default function ItemsList() {
    const { setTitle, setHeaderAction } = useTitle();
    const company = useOutletContext<Company>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(t("views.items.title"));
        setHeaderAction(undefined);
    }, [company.name, setTitle, setHeaderAction, t]);

    // Fetch items for this company
    const { data: itemsData, isLoading, error } = useQuery({
        queryKey: ["items", company.uuid],
        queryFn: async () => {
            const result = await KompelloApi.itemsApi.itemsList({
                company: company.uuid,
            });
            return Array.isArray(result) ? result : [];
        },
    });

    const items = itemsData || [];

    const handleAddItem = () => {
        navigate(`/${company.uuid}/items/new`);
    };

    const handleSelectItem = (itemId: string) => {
        navigate(`/${company.uuid}/items/${itemId}`);
    };

    return (
        <div className="grid auto-rows-min gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t("views.items.title")}</CardTitle>
                    <CardDescription>{t("views.items.description")}</CardDescription>
                    <CardAction>
                        <Button onClick={handleAddItem} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("views.items.addItem")}
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8">{t("common.loading")}</div>}
                    {error && <div className="text-center py-8 text-red-500">{t("common.error")}</div>}
                    {items.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-gray-500">{t("common.noData")}</div>
                    )}
                    {items.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("views.items.name")}</TableHead>
                                        <TableHead>{t("views.items.pricePerUnit")}</TableHead>
                                        <TableHead>{t("views.items.currency")}</TableHead>
                                        <TableHead>{t("views.items.unit")}</TableHead>
                                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow
                                            key={item.uuid}
                                            onClick={() => handleSelectItem(item.uuid!)}
                                        >
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell>
                                                {item.pricePerUnit}
                                                {item.priceMax && ` - ${item.priceMax}`}
                                            </TableCell>
                                            <TableCell>
                                                {item.currencySymbol}
                                            </TableCell>
                                            <TableCell>
                                                {item.unitShortName}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectItem(item.uuid!);
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
