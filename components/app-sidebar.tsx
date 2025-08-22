import { Brain, Calendar, Home, Inbox, Proportions, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Playground",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: Inbox,
  },
  {
    title: "TechSpecs",
    url: "/techspec",
    icon: Proportions,
  },
  {
    title: "Argumentation",
    url: "/argumentation",
    icon: Brain,
  },
  // {
  //   title: "Agenten",
  //   url: "/agents",
  //   icon: Calendar,
  // },
  // {
  //   title: "Einstellungen",
  //   url: "/settings",
  //   icon: Settings,
  // },
]

export function AppSidebar() {
  return (
    <Sidebar className="h-full mt-16 ">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}