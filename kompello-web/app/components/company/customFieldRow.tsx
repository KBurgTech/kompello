import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CustomFieldDefinition } from "~/lib/api/kompello";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { TableCell, TableRow } from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type CustomFieldRowProps = {
    field: CustomFieldDefinition;
    modelLabel: string | number;
    dataTypeLabel: string | number;
    onEdit: (field: CustomFieldDefinition) => void;
    onDelete: (field: CustomFieldDefinition) => void;
    disableDelete?: boolean;
};

export function CustomFieldRow({ field, modelLabel, dataTypeLabel, onEdit, onDelete, disableDelete }: CustomFieldRowProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex flex-col">
                    <span>{field.name}</span>
                    <div className="flex gap-2 pt-2">
                        {field.trackHistory ? <Badge variant="secondary">{t("views.companySettings.customFields.historyBadge")}</Badge> : null}
                        {field.showInUi ? <Badge variant="secondary">{t("views.companySettings.customFields.uiBadge")}</Badge> : null}
                        {field.isArchived ? <Badge variant="destructive">{t("views.companySettings.customFields.archivedBadge")}</Badge> : null}
                    </div>
                </div>
            </TableCell>
            <TableCell>{field.key}</TableCell>
            <TableCell>{modelLabel}</TableCell>
            <TableCell>{dataTypeLabel}</TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(field)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={disableDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <div className="space-y-2">
                                <div className="text-sm font-medium">
                                    {t("views.companySettings.customFields.confirmDelete")}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                                        {t("actions.cancel")}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            onDelete(field);
                                            setOpen(false);
                                        }}
                                        disabled={disableDelete}
                                    >
                                        {t("actions.delete")}
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </TableCell>
        </TableRow>
    );
}
