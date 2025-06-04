import { KompelloApi } from "~/lib/api/kompelloApi"
import { useTranslation } from "react-i18next"
import { MoveLeft } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from "~/components/ui/skeleton"
import UserDetailsForm from "~/components/account/userDetailsForm"
import UserPasswordChangeForm from "~/components/account/userPasswordChangeForm"


export default function AccountSettings() {
    const { t } = useTranslation();

    const currentUserQuery = useQuery({
        queryKey: ["currentuser"],
        queryFn: async () => {
            const user = await KompelloApi.userApi.usersMe();
            return user;
        }
    })

    return (
        <div className="flex flex-col items-center justify-center min-h-svh gap-4">
            <Button className="flex justify-start w-full max-w-2xl mb-4" variant="link" onClick={() => history.back()}>
                <MoveLeft /> {t("actions.back")}
            </Button>
            {currentUserQuery.isLoading ? <Skeleton className="h-12 w-full max-w-2xl" /> : <UserDetailsForm user={currentUserQuery.data} />}
            {currentUserQuery.isLoading ? <Skeleton className="h-12 w-full max-w-2xl" /> : <UserPasswordChangeForm user={currentUserQuery.data} />}
        </div>
    )
}
