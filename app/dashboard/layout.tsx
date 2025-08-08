"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.role === 'superadmin';

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full relative">
        {isSuperAdmin && (
          <div className="absolute inset-0 h-full w-full overflow-hidden">
            <div className="bg-primary/10 absolute -top-8 left-1/4 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-md filter" />
            <div className="bg-secondary/10 absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-md filter delay-700" />
            <div className="bg-primary/10 absolute top-1/4 right-1/3 h-64 w-64 animate-pulse rounded-full mix-blend-normal blur-md filter delay-1000" />
          </div>
        )}
        <div className={isSuperAdmin ? undefined : "relative"}>
          {!isSuperAdmin && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/60 pointer-events-auto">
              <span className="px-4 py-2 rounded-md bg-white border text-sm sm:text-2xl font-medium">
                Dieser Bereich ist nur für SuperAdmins
              </span>
            </div>
          )}
          <div className={isSuperAdmin ? undefined : "select-none pointer-events-none"}>
            <SidebarTrigger />
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}