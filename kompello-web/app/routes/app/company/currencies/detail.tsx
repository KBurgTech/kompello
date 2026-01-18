import { useTitle } from "~/components/titleContext";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import type { Company } from "~/lib/api/kompello";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { KompelloApi } from "~/lib/api/kompelloApi";
import CurrencyForm from "~/components/currency/currencyForm";
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

export default function CurrencyDetail() {
    const { setTitle, setHeaderAction } = useTitle();
    const company = useOutletContext<Company>();
    const { currencyId } = useParams();
    const { t } = useTranslation();
    const formRef = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Check if this is a new currency
    const isNew = currencyId === "new";

    // Fetch currency if not new
    const { data: currency, isLoading, error } = useQuery({
        queryKey: ["currencies", currencyId],
        queryFn: async () => {
            if (isNew) return null;
            const result = await KompelloApi.currenciesApi.currenciesRetrieve({
                uuid: currencyId!,
            });
            return result;
        },
        enabled: !isNew && !!currencyId,
    });

    useEffect(() => {
        const title = isNew
            ? t("views.currencies.addCurrency")
            : currency
            ? `${currency.symbol} - ${currency.shortName}`
            : t("views.currencies.title");

        setTitle(title);

        const handleSave = () => {
            formRef.current?.submitForm();
        };

        // Set header actions with breadcrumbs
        setHeaderAction({
            breadcrumbs: [
                {
                    label: t("views.currencies.title"),
                    href: `/${company.uuid}/currencies`,
                },
                {
                    label: title,
                },
            ],
            rightContent: (
                <div className="flex items-center gap-3">
                    {/* Metadata */}
                    {(currency?.createdOn || currency?.modifiedOn) && (
                        <div className="text-xs text-gray-500 hidden md:block">
                            {currency?.modifiedOn && (
                                <div>
                                    {t("common.lastModified")}: {formatDate(currency.modifiedOn)}
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
    }, [currency, isNew, setTitle, setHeaderAction, t, company.uuid, isSaving]);

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
                <CurrencyForm 
                    ref={formRef}
                    currency={currency || null} 
                    companyId={company.uuid!} 
                    onSavingChange={setIsSaving}
                />
            </div>
        </div>
    );
}
