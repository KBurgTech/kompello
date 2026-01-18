import * as React from "react"
import {
    BriefcaseBusiness,
    ChevronRight,
    Coins,
    Command,
    LayoutDashboard,
    Package,
    Replace,
    Ruler,
    Settings,
    Users,
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
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { SideBarUser } from "./appSideBarUser"
import ThemeSwitcher from "./themeSwitcher"
import type { Company } from "~/lib/api/kompello"
import { NavLink } from "react-router"
import { useTranslation } from 'react-i18next';

interface MenuItem {
    type: "group" | "single" | "multi",
    title?: string
    icon?: LucideIcon
    href?: string,
    children?: MenuItem[],
}

const menuItems = (baseUrl: string): MenuItem[] => [
    {
        type: "single",
        title: "views.sideBar.dashboard",
        icon: LayoutDashboard,
        href: `/${baseUrl}`,
    },
    {
        type: "group",
        title: "views.sideBar.resources",
        children: [
            {
                type: "single",
                title: "views.sideBar.customers",
                icon: Users,
                href: `/${baseUrl}/customers`,
            },
            {
                type: "single",
                title: "views.sideBar.items",
                icon: Package,
                href: `/${baseUrl}/items`,
            },
            {
                type: "single",
                title: "views.sideBar.currencies",
                icon: Coins,
                href: `/${baseUrl}/currencies`,
            },
            {
                type: "single",
                title: "views.sideBar.units",
                icon: Ruler,
                href: `/${baseUrl}/units`,
            },
        ]
    },
    {
        type: "group",
        title: "views.sideBar.settings.title",
        children: [
            {
                type: "single",
                title: "views.sideBar.settings.system",
                icon: Settings,
                href: `/settings/system`,
            },
            {
                type: "single",
                title: "views.sideBar.settings.company",
                icon: BriefcaseBusiness,
                href: `/${baseUrl}/settings`,
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
    const { t } = useTranslation();
    return (<>
        <SidebarGroupLabel>{t(item.title)}</SidebarGroupLabel>
        <SidebarMenu>
            {item.children && item.children.map(renderMenuItem)}
        </SidebarMenu></>
    )
}

function renderSingleMenuItem(item: MenuItem): React.ReactNode {
    const { t } = useTranslation();
    return (
        <SidebarMenu key={item.href}>
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={checkActive(item)}>
                    <NavLink to={item.href}>
                        {item.icon && <item.icon />}
                        <span>{t(item.title)}</span></NavLink>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

function renderSubMenuItem(item: MenuItem): React.ReactNode {
    const { t } = useTranslation();
    return (
        <SidebarMenuSubItem key={item.title}>
            <SidebarMenuButton asChild isActive={checkActive(item)}>
                <NavLink to={item.href}>
                    {item.icon && <item.icon />}
                    <span>{t(item.title)}</span>
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuSubItem>
    )
}

function renderMultiMenuItem(item: MenuItem): React.ReactNode {
    const { t } = useTranslation();
    return (
        <SidebarMenu key={item.href}>
            <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{t(item.title)}</span>
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

export function AppSidebar({ company, ...props }: { company: Company }) {
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
                                <div className="grid flex-1 text-left text-sm">
                                    <span className="truncate font-semibold">{company.name}</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                        <SidebarMenuAction asChild>
                            <NavLink to={`/`}>
                                <Replace className="size-4" />
                            </NavLink>
                        </SidebarMenuAction>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {menuItems(company.uuid).map((item, index) => {
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
