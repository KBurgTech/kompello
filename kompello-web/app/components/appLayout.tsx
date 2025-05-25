import { Outlet } from "react-router"
import { AppSidebar } from "./sideBar/appSideBar"
import { Separator } from "./ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "./ui/sidebar"
import { useTitle } from "./titleContext"
import type { JSX } from "react"

/**
 * The `AppLayout` component provides the main layout structure for the application.
 * It wraps its children with a `SidebarProvider` and renders the sidebar, header, and main content area.
 * The header displays the current page title, a sidebar trigger, and a separator.
 * The main content is rendered via the `Outlet` component, allowing for nested routing.
 *
 * @returns {JSX.Element} The layout structure including sidebar, header, and content outlet.
 */
export default function AppLayout(): JSX.Element {
    const { title } = useTitle()
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="text-sm font-medium leading-none">{title}</div>
                    </div>
                </header>
                <Separator orientation="horizontal" />
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}
