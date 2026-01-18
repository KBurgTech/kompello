import { useTitle } from "~/components/titleContext";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import type { Company } from "~/lib/api/kompello";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { KompelloApi } from "~/lib/api/kompelloApi";
import UnitForm from "~/components/unit/unitForm";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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

export default function UnitDetail() {
    const { setTitle, setHeaderAction } = useTitle();
    const company = useOutletContext<Company>();
    const { unitId } = useParams();
    const { t } = useTranslation();
    const formRef = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Check if this is a new unit
    const isNew = unitId === "new";

    // Fetch unit if not new
    const { data: unit, isLoading, error } = useQuery({
        queryKey: ["units", unitId],
        queryFn: async () => {
            if (isNew) return null;
            const result = await KompelloApi.unitsApi.unitsRetrieve({
                uuid: unitId!,
            });
            return result;
        },
        enabled: !isNew && !!unitId,
    });

    useEffect(() => {
        const title = isNew
            ? t("views.units.addUnit")
            : unit
            ? `${unit.shortName} - ${unit.longName}`
            : t("views.units.title");

        setTitle(title);

        const handleSave = () => {
            formRef.current?.submitForm();
        };

        // Set header actions with breadcrumbs
        setHeaderAction({
            breadcrumbs: [
                {
                    label: t("views.units.title"),
                    href: `/${company.uuid}/units`,
                },
                {
                    label: title,
                },
            ],
            rightContent: (
                <div className="flex items-center gap-3">
                    {/* Metadata */}
                    {(unit?.createdOn || unit?.modifiedOn) && (
                        <div className="text-xs text-gray-500 hidden md:block">
                            {unit?.modifiedOn && (
                                <div>
                                    {t("common.lastModified")}: {formatDate(unit.modifiedOn)}
                                </div>
                            )}
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
    }, [unit, isNew, setTitle, setHeaderAction, t, company.uuid, isSaving]);

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
                <UnitForm 
                    ref={formRef}
                    unit={unit || null} 
                    companyId={company.uuid!} 
                    onSavingChange={setIsSaving}
                />
            </div>
        </div>
    );
}
