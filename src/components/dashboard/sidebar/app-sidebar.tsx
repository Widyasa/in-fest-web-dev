"use client"

import * as React from "react"
import {
  IconCategory,
  IconDashboard,
  IconInnerShadowTop,
  IconPackage,
} from "@tabler/icons-react"

import { NavMain } from "@/components/dashboard/sidebar/nav-main"
import { NavUser } from "@/components/dashboard/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Categories",
      url: "/dashboard/category",
      icon: IconCategory,
    },
    {
      title: "Products",
      url: "/dashboard/product",
      icon: IconPackage,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {/* <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Avara</span>
              </a> */}
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="flex !size-8 items-center justify-center rounded-lg bg-main">
                      <img src="/img/logo-icon.svg" alt="Avara Logo" className="w-5 h-5 object-contain"/>
                    </div>
                    <span className="title-font text-2xl text-main">Avara</span>
                </Link>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
