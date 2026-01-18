import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Checkbox } from "~/components/ui/checkbox";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton,
} from "~/components/ui/input-group";
import { X } from "lucide-react";
import type { CustomFieldDefinitionRead } from "~/lib/api/kompello/models/CustomFieldDefinitionRead";
import { KompelloApi } from "~/lib/api/kompelloApi";
import type { UseFormReturn } from "react-hook-form";

/**
 * Data type enum values from the API
 */
const DATA_TYPE_TEXT = 1;
const DATA_TYPE_NUMBER = 2;
const DATA_TYPE_BOOLEAN = 3;

interface CustomFieldsSectionProps {
    modelTypeId: number; // ContentType ID from metadata endpoint
    companyId: string; // Company UUID
    form: UseFormReturn<any, any, any>; // react-hook-form instance
    showInUIOnly?: boolean; // Only show fields with show_in_ui=true (default: true)
}

/**
 * Reusable component for displaying and editing custom fields for any model.
 * Supports TEXT, NUMBER, and BOOLEAN data types.
 * Allows users to delete field values by setting them to null.
 *
 * Usage:
 * ```tsx
 * const form = useForm({
 *   resolver: zodResolver(schema),
 *   defaultValues: { customFields: { field_key: "value" } }
 * });
 *
 * <CustomFieldsSection
 *   modelTypeId={contentTypeId}
 *   companyId={companyUuid}
 *   form={form}
 * />
 * ```
 */
export function CustomFieldsSection({
    modelTypeId,
    companyId,
    form,
    showInUIOnly = true,
}: CustomFieldsSectionProps) {
    const { t } = useTranslation();
    const [customFieldDefinitions, setCustomFieldDefinitions] = useState<
        CustomFieldDefinitionRead[]
    >([]);

    // Fetch custom field definitions for this model and company
    const { isLoading } = useQuery({
        queryKey: ["customFieldDefinitions", modelTypeId, companyId],
        queryFn: async () => {
            try {
                const fields = await KompelloApi.customFieldsApi.customFieldsForModelList({
                    modelTypeId: modelTypeId!,
                    companyUuid: companyId,
                    showInUi: showInUIOnly,
                });

                const fieldsArray = Array.isArray(fields) ? fields : [];
                setCustomFieldDefinitions(fieldsArray);
                return fieldsArray;
            } catch (error) {
                console.error("Error fetching custom fields:", error);
                return [];
            }
        },
        enabled: modelTypeId !== null && modelTypeId !== undefined,
    });

    if (!customFieldDefinitions || customFieldDefinitions.length === 0) {
        if (isLoading) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("views.companySettings.customFields.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{t("common.loading", "Loading...")}</p>
                    </CardContent>
                </Card>
            );
        }
        return null;
    }

    const renderCustomFieldInput = (field: CustomFieldDefinitionRead) => {
        const fieldKey = field.key;
        const dataType = field.dataType;
        const fieldPath = `customFields.${fieldKey}`;

        switch (dataType) {
            case DATA_TYPE_TEXT:
                return (
                    <FormField
                        key={fieldKey}
                        control={form.control}
                        name={fieldPath}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>{field.name}</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupInput
                                            placeholder={`Enter ${field.name.toLowerCase()}`}
                                            {...formField}
                                            value={formField.value || ""}
                                            onChange={(e) => formField.onChange(e.target.value || null)}
                                        />
                                        {formField.value && (
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupButton
                                                    aria-label="Clear"
                                                    title="Clear"
                                                    size="icon-xs"
                                                    type="button"
                                                    onClick={() => formField.onChange(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </InputGroupButton>
                                            </InputGroupAddon>
                                        )}
                                    </InputGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            case DATA_TYPE_NUMBER:
                return (
                    <FormField
                        key={fieldKey}
                        control={form.control}
                        name={fieldPath}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>{field.name}</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupInput
                                            type="number"
                                            placeholder={`Enter ${field.name.toLowerCase()}`}
                                            {...formField}
                                            value={formField.value ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === "") {
                                                    formField.onChange(null);
                                                } else {
                                                    const parsed = parseFloat(value);
                                                    formField.onChange(isNaN(parsed) ? value : parsed);
                                                }
                                            }}
                                        />
                                        {formField.value !== null && formField.value !== undefined && (
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupButton
                                                    aria-label="Clear"
                                                    title="Clear"
                                                    size="icon-xs"
                                                    type="button"
                                                    onClick={() => formField.onChange(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </InputGroupButton>
                                            </InputGroupAddon>
                                        )}
                                    </InputGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            case DATA_TYPE_BOOLEAN:
                return (
                    <FormField
                        key={fieldKey}
                        control={form.control}
                        name={fieldPath}
                        render={({ field: formField }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={formField.value === true}
                                        onCheckedChange={(checked) => {
                                            formField.onChange(checked ? true : null);
                                        }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                    {field.name}
                                </FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            default:
                console.warn(`Unknown data type: ${dataType}`);
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("views.companySettings.customFields.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <p>{t("common.loading", "Loading...")}</p>
                ) : customFieldDefinitions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t("views.companySettings.customFields.empty")}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {customFieldDefinitions.map((field) => {
                            return renderCustomFieldInput(field);
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
