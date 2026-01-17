import { NavLink, Outlet, useLocation } from "react-router"
import { Fragment } from "react"
import { AppSidebar } from "./sideBar/appSideBar"
import { Separator } from "./ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "./ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "./ui/breadcrumb"
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
    const { title, headerAction } = useTitle()
    const auth = useAuth()
    const location = useLocation()

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
                <header className="flex h-16 shrink-0 items-center gap-2 justify-between px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        {headerAction?.breadcrumbs && headerAction.breadcrumbs.length > 0 ? (
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {headerAction.breadcrumbs.map((item, index) => (
                                        <Fragment key={index}>
                                            <BreadcrumbItem>
                                                {item.href ? (
                                                    <BreadcrumbLink asChild>
                                                        <NavLink to={item.href || ""}>
                                                            {item.label}
                                                        </NavLink>
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                            {index < headerAction.breadcrumbs.length - 1 && (
                                                <BreadcrumbSeparator />
                                            )}
                                        </Fragment>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        ) : (
                            <div className="text-sm font-medium leading-none">{title}</div>
                        )}
                    </div>
                    {headerAction?.rightContent && (
                        <div className="flex items-center gap-4">
                            {headerAction.rightContent}
                        </div>
                    )}
                </header>
                <Separator orientation="horizontal" />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <Outlet context={query.data} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
