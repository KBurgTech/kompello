import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Company, CustomFieldDefinition, CustomFieldMetadata, DataTypeEnum } from "~/lib/api/kompello";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import { CustomFieldDialog, type CustomFieldFormValues } from "./customFieldDialog";
import { CustomFieldRow } from "./customFieldRow";
import { toast } from "sonner"

type CreatePayload = Omit<CustomFieldDefinition, "uuid" | "createdOn" | "modifiedOn" | "created_on" | "modified_on">;
type PatchPayload = Partial<CreatePayload>;

function toCreatePayload(values: CustomFieldFormValues, companyUuid: string): CreatePayload {
    return {
        key: values.key,
        name: values.name,
        dataType: values.dataType as DataTypeEnum,
        modelType: values.modelType,
        company: companyUuid,
        trackHistory: values.trackHistory,
        showInUi: values.showInUi,
        isArchived: values.isArchived,
        extraData: undefined,
    };
}

export default function CompanyCustomFieldsSettings({ company }: { company: Company }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);

    const metadataQuery = useQuery({
        queryKey: ["custom-fields", "metadata"],
        queryFn: () => KompelloApi.customFieldsApi.customFieldsMetadataRetrieve(),
    });

    const fieldsQuery = useQuery({
        queryKey: ["custom-fields", company.uuid],
        queryFn: async () => {
            const result = await KompelloApi.customFieldsApi.customFieldsList();
            return result.filter((field) => field.company === company.uuid);
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (values: CustomFieldFormValues) => {
            const payload = toCreatePayload(values, company.uuid);
            if (editingField) {
                return KompelloApi.customFieldsApi.customFieldsPartialUpdate({
                    uuid: editingField.uuid,
                    patchedCustomFieldDefinition: payload as PatchPayload,
                });
            }
            return KompelloApi.customFieldsApi.customFieldsCreate({
                customFieldDefinition: payload as Omit<CustomFieldDefinition, "uuid" | "created_on" | "modified_on">,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["custom-fields", company.uuid] });
            setDialogOpen(false);
            setEditingField(null);
            toast.success(t("actions.messages.saveSuccess"));
        },
        onError: (error) => {
            toast.error(t("actions.messages.saveError") + " " + error);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (uuid: string) => KompelloApi.customFieldsApi.customFieldsDestroy({ uuid }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["custom-fields", company.uuid] });
        },
    });

    async function handleSubmit(values: CustomFieldFormValues) {
        await saveMutation.mutateAsync(values);
    }

    function handleDialogChange(open: boolean) {
        setDialogOpen(open);
        if (!open) {
            setEditingField(null);
        }
    }

    function openCreateDialog() {
        setEditingField(null);
        setDialogOpen(true);
    }

    function openEditDialog(field: CustomFieldDefinition) {
        setEditingField(field);
        setDialogOpen(true);
    }

    async function handleDelete(field: CustomFieldDefinition) {
        await deleteMutation.mutateAsync(field.uuid);
    }

    function dataTypeLabel(value: number | any, metadata?: CustomFieldMetadata) {
        if (typeof value === "number") {
            return metadata?.dataTypes?.find((type) => type.value === value)?.label ?? value;
        }
        // fallback if API ever returns an object
        const v = value?.value ?? value;
        return metadata?.dataTypes?.find((type) => type.value === v)?.label ?? v;
    }

    function modelTypeLabel(value: number | { id: number; app_label?: string; appLabel?: string; model: string } | any, metadata?: CustomFieldMetadata) {
        if (typeof value === "number") {
            const model = metadata?.modelTypes?.find((type) => type.id === value);
            if (!model) return value;
            return `${model.model} (${model.appLabel})`;
        }
        if (value && typeof value === "object") {
            const app = value.app_label ?? value.appLabel;
            return `${value.model} (${app ?? ""})`;
        }
        return value;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("views.companySettings.customFields.title")}</CardTitle>
                <CardDescription>{t("views.companySettings.customFields.description")}</CardDescription>
                <CardAction>
                    <CustomFieldDialog
                        open={dialogOpen}
                        onOpenChange={handleDialogChange}
                        trigger={(
                            <Button className="gap-2" onClick={openCreateDialog}>
                                <Plus className="h-4 w-4" />
                                {t("views.companySettings.customFields.addField")}
                            </Button>
                        )}
                        metadata={metadataQuery.data}
                        editingField={editingField}
                        isSaving={saveMutation.isPending}
                        onSubmit={handleSubmit}
                    />
                </CardAction>
            </CardHeader>
            <CardContent>
                {fieldsQuery.isLoading ? (
                    <Skeleton className="h-12 w-full" />
                ) : fieldsQuery.data && fieldsQuery.data.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("views.companySettings.customFields.name")}</TableHead>
                                    <TableHead>{t("views.companySettings.customFields.key")}</TableHead>
                                    <TableHead>{t("views.companySettings.customFields.modelType")}</TableHead>
                                    <TableHead>{t("views.companySettings.customFields.dataType")}</TableHead>
                                    <TableHead>{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fieldsQuery.data.map((field) => (
                                    <CustomFieldRow
                                        key={field.uuid}
                                        field={field}
                                        modelLabel={modelTypeLabel(field.modelType, metadataQuery.data)}
                                        dataTypeLabel={dataTypeLabel(field.dataType, metadataQuery.data)}
                                        onEdit={openEditDialog}
                                        onDelete={handleDelete}
                                        disableDelete={deleteMutation.isPending}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-muted-foreground py-4">
                        {t("views.companySettings.customFields.empty")}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
