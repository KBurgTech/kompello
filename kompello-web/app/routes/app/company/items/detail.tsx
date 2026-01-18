import { useTitle } from "~/components/titleContext";
import { useEffect, useRef } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router";
import type { Company } from "~/lib/api/kompello";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { KompelloApi } from "~/lib/api/kompelloApi";
import ItemForm from "~/components/item/itemForm";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

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

export default function ItemDetail() {
    const { setTitle, setHeaderAction } = useTitle();
    const company = useOutletContext<Company>();
    const { itemId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const formRef = useRef<any>(null);

    // Check if this is a new item
    const isNew = itemId === "new";

    // Fetch item if not new
    const { data: item, isLoading, error } = useQuery({
        queryKey: ["items", itemId],
        queryFn: async () => {
            if (isNew) return null;
            const result = await KompelloApi.itemsApi.itemsRetrieve({
                uuid: itemId!,
            });
            return result;
        },
        enabled: !isNew && !!itemId,
    });

    useEffect(() => {
        const title = isNew
            ? t("views.items.addItem")
            : item
            ? item.name
            : t("views.items.title");

        setTitle(title);

        const handleSave = () => {
            formRef.current?.submitForm();
        };

        // Set header actions with breadcrumbs
        setHeaderAction({
            breadcrumbs: [
                {
                    label: t("views.items.title"),
                    href: `/${company.uuid}/items`,
                },
                {
                    label: title,
                },
            ],
            rightContent: (
                <div className="flex items-center gap-3">
                    {/* Metadata */}
                    {(item?.createdOn || item?.modifiedOn) && (
                        <div className="text-xs text-gray-500 hidden md:block">
                            {item?.modifiedOn && (
                                <div>
                                    {t("common.lastModified")}: {formatDate(item.modifiedOn)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Save Button */}
                    <Button onClick={handleSave} size="sm">
                        {t("actions.save")}
                    </Button>
                </div>
            ),
        });
    }, [item, isNew, setTitle, setHeaderAction, t, company.uuid, navigate]);

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
                <ItemForm 
                    ref={formRef}
                    item={item || null} 
                    companyId={company.uuid!} 
                    onSave={() => navigate(`/${company.uuid}/items`)} 
                />
            </div>
        </div>
    );
}
