import { Outlet } from "react-router"
import { AppSidebar } from "./sideBar/appSideBar"
import { Separator } from "./ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "./ui/sidebar"
import { useTitle } from "./titleContext"
import { type JSX } from "react"
import { KompelloApi } from "~/lib/api/kompelloApi"
import type { Route } from "../+types/root"
import { useQuery } from '@tanstack/react-query'
import { useAuth } from "./authContext"

/**
 * The `AppLayout` component provides the main layout structure for the application.
 * It wraps its children with a `SidebarProvider` and renders the sidebar, header, and main content area.
 * The header displays the current page title, a sidebar trigger, and a separator.
 * The main content is rendered via the `Outlet` component, allowing for nested routing.
 *
 * @returns {JSX.Element} The layout structure including sidebar, header, and content outlet.
 */
export default function AppLayout({ params }: Route.ComponentProps): JSX.Element {
    const { title } = useTitle()
    const auth = useAuth()

    const query = useQuery({ 
        queryKey: ["company", params.companyId],
        queryFn: async () => {
            const companyData = await KompelloApi.companyApi.companiesRetrieve({ uuid: params.companyId });
            return companyData;
        }
    })

    return (
        query.data &&
        <SidebarProvider>
            <AppSidebar company={query.data} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="text-sm font-medium leading-none">{title}</div>
                    </div>
                </header>
                <Separator orientation="horizontal" />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <Outlet context={query.data} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
