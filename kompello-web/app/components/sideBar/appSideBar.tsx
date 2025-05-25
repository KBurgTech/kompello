import * as React from "react"
import {
    BriefcaseBusiness,
    ChevronRight,
    Command,
    LayoutDashboard,
    Settings,
    type LucideIcon,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { SideBarUser } from "./appSideBarUser"
import ThemeSwitcher from "./themeSwitcher"

interface MenuItem {
    type: "group" | "single" | "multi",
    title?: string
    icon?: LucideIcon
    href?: string,
    children?: MenuItem[],
}

const menuItems: MenuItem[] = [
    {
        type: "single",
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        type: "group",
        title: "Settings",
        children: [
            {
                type: "single",
                title: "System Settings",
                icon: Settings,
                href: "/settings/system",
            },
            {
                type: "single",
                title: "Business Settings",
                icon: BriefcaseBusiness,
                href: "/settings/business",
            }
        ]
    },
    {
        type: "group",
        title: "Test Group",
        children: [
            {
                type: "single",
                title: "Single Item",
                icon: Settings,
                href: "/settings/system",
            },
            {
                type: "multi",
                title: "Multi Item",
                icon: BriefcaseBusiness,
                href: "/settings/business",
                children: [
                    {
                        type: "single",
                        title: "Sub Item 1",
                        icon: Settings,
                        href: "/settings/system/sub1",
                    },
                    {
                        type: "single",
                        title: "Sub Item 2",
                        icon: Settings,
                        href: "/settings/system/sub2",
                    }
                ]
            }
        ]
    }
]

function checkActive(item: MenuItem): boolean {
    // This is a placeholder for actual active state logic
    // You can implement your own logic to determine if the item is active
    return window.location.pathname === item.href;
}

function renderGroup(item: MenuItem): React.ReactNode {
    return (<>
        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
        <SidebarMenu>
            {item.children && item.children.map(renderMenuItem)}
        </SidebarMenu></>
    )
}

function renderSingleMenuItem(item: MenuItem): React.ReactNode {
    return (
        <SidebarMenu>
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={checkActive(item)}>
                    <a href={item.href}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                    </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

function renderSubMenuItem(item: MenuItem): React.ReactNode {
    return (
        <SidebarMenuSubItem key={item.title}>
            <SidebarMenuButton asChild isActive={checkActive(item)}>
                <a href={item.href}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </a>
            </SidebarMenuButton>
        </SidebarMenuSubItem>
    )
}

function renderMultiMenuItem(item: MenuItem): React.ReactNode {
    const Icon = item.icon
    return (
        <SidebarMenu>
            <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {item.children && item.children.map(renderSubMenuItem)}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu >
    )
}

function renderMenuItem(item: MenuItem): React.ReactNode {
    switch (item.type) {
        case "group":
            return renderGroup(item)
        case "single":
            return renderSingleMenuItem(item)
        case "multi":
            return renderMultiMenuItem(item)
    }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Acme Inc</span>
                                    <span className="truncate text-xs">Enterprise</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((item, index) => {
                    return <SidebarGroup key={index}>
                        {renderMenuItem(item)}
                    </SidebarGroup>
                })}
            </SidebarContent>
            <SidebarFooter>
                <ThemeSwitcher />
                <SideBarUser />
            </SidebarFooter>
        </Sidebar>
    )
}
