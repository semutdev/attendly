"use client"

import * as React from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  LogOut,
  User,
  School,
  Book,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/attendance", icon: CheckSquare, label: "Absensi" },
    { href: "/dashboard/classes", icon: School, label: "Kelas" },
    { href: "/dashboard/subjects", icon: Book, label: "Pelajaran" },
    { href: "/dashboard/reports", icon: FileText, label: "Laporan" },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
             <Logo />
             <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <Separator className="my-2" />
           <div className="flex items-center gap-2 p-2">
            <Avatar>
              <AvatarImage src="https://placehold.co/100x100.png" alt="User" />
              <AvatarFallback>WK</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-foreground">Wali Kelas</span>
              <span className="text-muted-foreground">teacher@school.com</span>
            </div>
          </div>
           <SidebarMenuButton asChild tooltip="Keluar">
            <Link href="/">
              <LogOut />
              <span>Keluar</span>
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in-up">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
