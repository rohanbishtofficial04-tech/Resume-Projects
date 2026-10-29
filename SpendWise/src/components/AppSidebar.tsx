"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, Info, LayoutDashboard, Settings, Tags, WalletCards } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar } from "@/components/ui/sidebar";

const navigation = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Transactions", href: "/transactions", icon: CreditCard },
  { title: "Budgets", href: "/budgets", icon: WalletCards },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Categories", href: "/categories", icon: Tags },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return <Sidebar collapsible="icon" className="border-r">
    <SidebarHeader className="px-4 py-5">
      <SidebarMenu><SidebarMenuItem>
        <SidebarMenuButton asChild size="lg">
          <Link href="/" className="gap-3" onClick={closeMobileSidebar}>
            <Image src="/logo.svg" alt="" width={28} height={28} className="rounded-md" />
            <span className="text-base font-semibold tracking-tight">SpendWise</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem></SidebarMenu>
    </SidebarHeader>
    <SidebarSeparator />
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigation.map((item) => <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                <Link href={item.href} onClick={closeMobileSidebar}><item.icon /><span>{item.title}</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter className="p-3">
      <SidebarMenu><SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === "/settings"} tooltip="Settings">
          <Link href="/settings" onClick={closeMobileSidebar}><Settings /><span>Settings</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem><SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === "/about"} tooltip="About">
          <Link href="/about" onClick={closeMobileSidebar}><Info /><span>About</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem></SidebarMenu>
      <p className="px-2 pb-1 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">Your finances, made clearer.</p>
    </SidebarFooter>
  </Sidebar>;
}
