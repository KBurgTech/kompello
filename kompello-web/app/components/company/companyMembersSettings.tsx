import type { Company, User } from "~/lib/api/kompello"
import { UserMinus, UserPlus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "~/components/ui/card"
import { KompelloApi } from "~/lib/api/kompelloApi"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from "~/components/ui/button"
import { DataTable } from "~/components/dataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { Skeleton } from "~/components/ui/skeleton"
import { UserSelectDialog } from "~/components/userSelectDialog"

export default function MemberSettings({ company }: { company: Company }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    // Fetch the members of the company
    const memberQuery = useQuery({
        queryKey: ["company", "members", company.uuid],
        queryFn: async () => {
            const members = await KompelloApi.companyApi.companyMembers({ uuid: company.uuid });
            return members;
        }
    })

    // Mutation for adding members
    const addMutation = useMutation({
        mutationFn: async (user: User) => {
            const content = {
                uuid: company.uuid,
                patchedUuidList: {
                    uuids: [user.uuid]
                }
            };
            return await KompelloApi.companyApi.companyMembersAdd(content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company", "members", company.uuid] });
        },
    })

    // Mutation for deleting members
    const deleteMutation = useMutation({
        mutationFn: async (user: User) => {
            const content = {
                uuid: company.uuid,
                patchedUuidList: {
                    uuids: [user.uuid]
                }
            };
            return await KompelloApi.companyApi.companyMembersDelete(content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company", "members", company.uuid] });
        },
    })

    // Define the columns for the data table
    const columns: ColumnDef<User>[] = [
        {
            accessorFn: (row) => {
                return `${row.firstName} ${row.lastName}`;
            },
            header: t("common.name"),
        },
        {
            accessorKey: "email",
            header: t("common.email"),
        },
        {
            header: t("common.actions"),
            cell: ({ row }) => (
                <div className="">
                    <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutateAsync(row.original)}><UserMinus /></Button>
                </div>
            )
        }
    ]

    // Handle the dialog close event when a user is selected or not seleceted
    async function onDialogClose(value: User | null) {
        if (!value) {
            return
        }
        await addMutation.mutateAsync(value);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("views.companySettings.members.title")}</CardTitle>
                <CardDescription>{t("views.companySettings.members.description")}</CardDescription>
                <CardAction>
                    <UserSelectDialog
                        trigger={<Button><UserPlus/> {t("actions.add")}</Button>}
                        value={null}
                        onClose={onDialogClose}
                    />
                </CardAction>
            </CardHeader>
            <CardContent>
                {memberQuery.isLoading ? <Skeleton className="h-12 w-full max-w-2xl" /> : <DataTable columns={columns} data={memberQuery.data} />}
            </CardContent>
        </Card>
    )
}
