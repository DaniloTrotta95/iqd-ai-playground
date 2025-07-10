"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { signOut, User as UserType } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function UserDropdown({ user }: { user: UserType }) {
  const router = useRouter();

  return (
    <DropdownMenu >
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-10 px-3 py-2 rounded-lg group transition-colors duration-200 hover:bg-gray-100 cursor-pointer">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gray-100 group-hover:bg-white transition-colors duration-200 text-gray-600 text-sm">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </div>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profil")}>
        <User className="mr-2 h-4 w-4" />
        <span>Profil</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
        <Settings className="mr-2 h-4 w-4" />
        <span>Einstellungen</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/"); // redirect to login page
    },
  },
})}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Abmelden</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}
