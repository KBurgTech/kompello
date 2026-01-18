import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { CustomFieldDefinition, CustomFieldMetadata } from "~/lib/api/kompello";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
    key: z.string().min(2).max(50).regex(/^[A-Za-z0-9_-]+$/, { message: "Use letters, numbers, dashes or underscores." }),
    name: z.string().min(2).max(100),
    dataType: z.coerce.number(),
    modelType: z.coerce.number(),
    trackHistory: z.boolean().default(false),
    showInUi: z.boolean().default(true),
    isArchived: z.boolean().default(false),
});

export type CustomFieldFormValues = z.infer<typeof formSchema>;

type CustomFieldDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    metadata?: CustomFieldMetadata;
    editingField: CustomFieldDefinition | null;
    isSaving: boolean;
    onSubmit: (values: CustomFieldFormValues) => Promise<void>;
};

export function CustomFieldDialog({
    open,
    onOpenChange,
    trigger,
    metadata,
    editingField,
    isSaving,
    onSubmit,
}: CustomFieldDialogProps) {
    const { t } = useTranslation();
    const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

    const defaultValues = useMemo<CustomFieldFormValues>(() => ({
        key: "",
        name: "",
        dataType: metadata?.dataTypes?.[0]?.value ?? 1,
        modelType: metadata?.modelTypes?.[0]?.id ?? 0,
        trackHistory: false,
        showInUi: true,
        isArchived: false,
    }), [metadata]);

    const form = useForm<CustomFieldFormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues,
    });

    useEffect(() => {
        if (!open) return;

        if (editingField) {
            // existing key should not be auto-overwritten unless user clears it
            setKeyManuallyEdited(true);
            const dataTypeValue = typeof (editingField as any).dataType === "number"
                ? (editingField as any).dataType
                : (editingField as any).dataType?.value ?? 1;

            const modelTypeValue = typeof (editingField as any).modelType === "number"
                ? (editingField as any).modelType
                : (editingField as any).modelType?.id ?? 0;

            form.reset({
                key: editingField.key,
                name: editingField.name,
                dataType: dataTypeValue,
                modelType: modelTypeValue,
                trackHistory: editingField.trackHistory ?? false,
                showInUi: editingField.showInUi ?? true,
                isArchived: editingField.isArchived ?? false,
            });
        } else {
            form.reset(defaultValues);
            setKeyManuallyEdited(false);
        }
    }, [open, editingField, form, defaultValues]);

    // Auto-generate key from name unless user has manually edited the key
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "name" && !keyManuallyEdited) {
                const inputName = (value.name ?? "") as string;
                const generated = inputName
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "_")
                    .replace(/[^A-Z0-9_]/g, "");
                form.setValue("key", generated, { shouldValidate: true });
            }
        });
        return () => subscription.unsubscribe();
    }, [form, keyManuallyEdited]);

    async function handleSubmit(values: CustomFieldFormValues) {
        await onSubmit(values);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editingField ? t("views.companySettings.customFields.editField") : t("views.companySettings.customFields.addField")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("views.companySettings.customFields.formDescription")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.companySettings.customFields.name")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t("views.companySettings.customFields.nameHelper")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("views.companySettings.customFields.key")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            onChange={(e) => {
                                                setKeyManuallyEdited(true);
                                                field.onChange(e);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t("views.companySettings.customFields.keyHelper")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="dataType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.companySettings.customFields.dataType")}</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={String(field.value ?? "")}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                disabled={!metadata}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("views.companySettings.customFields.dataTypePlaceholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {metadata?.dataTypes?.map((type) => (
                                                        <SelectItem key={type.value} value={String(type.value)}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="modelType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("views.companySettings.customFields.modelType")}</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={String(field.value ?? "")}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                disabled={!metadata}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("views.companySettings.customFields.modelTypePlaceholder")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {metadata?.modelTypes?.map((model) => (
                                                        <SelectItem key={model.id} value={String(model.id)}>
                                                            {model.model} ({model.appLabel})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="trackHistory"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>{t("views.companySettings.customFields.trackHistory")}</FormLabel>
                                            <FormDescription>
                                                {t("views.companySettings.customFields.trackHistoryHelper")}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="showInUi"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>{t("views.companySettings.customFields.showInUi")}</FormLabel>
                                            <FormDescription>
                                                {t("views.companySettings.customFields.showInUiHelper")}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isArchived"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>{t("views.companySettings.customFields.archive")}</FormLabel>
                                            <FormDescription>
                                                {t("views.companySettings.customFields.archiveHelper")}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                {t("actions.cancel")}
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? t("common.saving") : editingField ? t("actions.update") : t("actions.add")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
