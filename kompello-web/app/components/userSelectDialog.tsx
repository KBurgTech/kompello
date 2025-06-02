import { useState, type ReactNode } from "react"
import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog"
import type { User } from "~/lib/api/kompello"
import { UserSelectInput } from "./userSelectInput"
import { useTranslation } from "react-i18next"

type UserSelectPopupProps = {
    trigger: ReactNode
    value: User | null
    onClose: (value: User | null) => Promise<void>
}

export function UserSelectDialog({ trigger, value, onClose }: UserSelectPopupProps) {
    const { t } = useTranslation();
    const [user, setUser] = useState<User | null>(value)

    // Called when the select button in the dialog is clicked
    function handleSelect() {
        onClose(user)
    }

    // Called when the cancel button in the dialog is clicked
    function handleCancel() {
        onClose(null)
    }

    // Called when a user is selected in the UserSelectInput field
    function onUserSelect(user: User | null) {
        setUser(user)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("views.userSelect.title")}</DialogTitle>
                    <DialogDescription>
                        {t("views.userSelect.description")}
                    </DialogDescription>
                </DialogHeader>
                <UserSelectInput onChange={onUserSelect} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={handleCancel}>{t("actions.cancel")}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button" onClick={handleSelect}>{t("actions.select")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
