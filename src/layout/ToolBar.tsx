import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar"
import { toolList } from "./toolConfig"
import { ModeToggle } from "@/components/mode-toggle"
import { NavLink, useLocation } from "react-router"
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function ToolBar({ children }: { children: React.ReactNode }) {

  const { pathname } = useLocation();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Dev Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {toolList.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <NavLink to={item.url}>
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-row">
            <ModeToggle />
            <Button variant="outline" size="icon">
              <a href="https://github.com/Kailash-Sankar/dev-tools" target="_BLANK"><Github /></a>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
        {children}
    </SidebarProvider>
  )
}
