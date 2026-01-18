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

export default function UnitsList() {
    const { setTitle, setHeaderAction } = useTitle();
    const company = useOutletContext<Company>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(t("views.units.title"));
        setHeaderAction(undefined);
    }, [company.name, setTitle, setHeaderAction, t]);

    // Fetch units for this company
    const { data: unitsData, isLoading, error } = useQuery({
        queryKey: ["units", company.uuid],
        queryFn: async () => {
            const result = await KompelloApi.unitsApi.unitsList({
                company: company.uuid,
            });
            return Array.isArray(result) ? result : [];
        },
    });

    const units = unitsData || [];

    const handleAddUnit = () => {
        navigate(`/${company.uuid}/units/new`);
    };

    const handleSelectUnit = (unitId: string) => {
        navigate(`/${company.uuid}/units/${unitId}`);
    };

    return (
        <div className="grid auto-rows-min gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t("views.units.title")}</CardTitle>
                    <CardDescription>{t("views.units.description")}</CardDescription>
                    <CardAction>
                        <Button onClick={handleAddUnit} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("views.units.addUnit")}
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center py-8">{t("common.loading")}</div>}
                    {error && <div className="text-center py-8 text-red-500">{t("common.error")}</div>}
                    {units.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-gray-500">{t("common.noData")}</div>
                    )}
                    {units.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("views.units.shortName")}</TableHead>
                                        <TableHead>{t("views.units.longName")}</TableHead>
                                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {units.map((unit) => (
                                        <TableRow
                                            key={unit.uuid}
                                            onClick={() => handleSelectUnit(unit.uuid!)}
                                        >
                                            <TableCell className="font-medium">
                                                {unit.shortName}
                                            </TableCell>
                                            <TableCell>{unit.longName}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectUnit(unit.uuid!);
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
