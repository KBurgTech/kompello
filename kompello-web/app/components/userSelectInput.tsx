import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import { useQuery } from '@tanstack/react-query'
import { KompelloApi } from "~/lib/api/kompelloApi"
import { Skeleton } from "./ui/skeleton"
import type { User } from "~/lib/api/kompello"
import { useState } from "react"
import { useTranslation } from "react-i18next"


export function UserSelectInput({ onChange }: { onChange: (value: User | null) => void }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<User | null>(null)

    // Handle setting the value and calling the onChange callback
    const handleSetValue = (newValue: User | null) => {
        setValue(newValue)
        onChange(newValue)
    }

    // Fetch users from the API
    const userQuery = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const members = await KompelloApi.userApi.usersList();
            return members;
        }
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between"
                >
                    {value
                        ? userQuery.data.find((user) => user.uuid === value.uuid)?.email
                        : t("views.userSelect.title")}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                {userQuery.isLoading ? (<Skeleton className="h-12 w-full max-w-2xl" />) : (
                    <Command>
                        <CommandInput placeholder={t("common.search")} className="h-9" />
                        <CommandList>
                            <CommandEmpty>{t("common.noResults")}</CommandEmpty>
                            <CommandGroup>
                                {userQuery.data.map((user) => (
                                    <CommandItem
                                        key={user.uuid}
                                        value={user.uuid}
                                        onSelect={(currentValue) => {
                                            handleSetValue(userQuery.data.find((user) => user.uuid === currentValue))
                                            setOpen(false)
                                        }}
                                    >
                                        {user.email}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value?.uuid === user.uuid ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                )}
            </PopoverContent>
        </Popover>
    )
}
