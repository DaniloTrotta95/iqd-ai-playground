"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full relative">
        <div className="flex flex-col h-full">
          <SidebarTrigger />
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}