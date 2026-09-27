import { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { toolGroups, toolsInGroup } from "./toolConfig"
import { ModeToggle } from "@/components/mode-toggle"
import { NavLink, useLocation } from "react-router"
import { Button } from "@/components/ui/button";
import { Github, Search } from "lucide-react";
import { useCommandPalette } from "@/components/command-palette-context";
import { CommandPalette } from "@/components/command-palette";
import { isMac } from "@/utils/platform";

export default function ToolBar({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { toggle: togglePalette } = useCommandPalette();
  // Modifier label differs per platform, so it can only be read on the client.
  const [mac, setMac] = useState(false);

  useEffect(() => setMac(isMac()), []);

  // Groups with no tools are omitted rather than rendered empty.
  const groups = toolGroups
    .map((group) => ({ group, tools: toolsInGroup(group) }))
    .filter((g) => g.tools.length > 0);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarContent className="gap-0">
          <div className="shrink-0 px-2 pt-3 pb-2 group-data-[collapsible=icon]:hidden">
            <NavLink
              to="/"
              className="flex items-baseline gap-1.5 text-foreground"
            >
              <span className="text-sm font-semibold tracking-tight">
                devtools
              </span>
              <span className="text-fg-subtle text-xs">/</span>
              <span className="text-fg-subtle font-mono text-xs">local</span>
            </NavLink>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={togglePalette}
            // shrink-0: SidebarContent is a flex column with min-h-0 and
            // overflow-auto, so once the tool list is taller than the
            // viewport every flex child is a shrink candidate. Without this
            // the search box gets squashed to its content height (18px)
            // instead of 32px. Only the tool list should scroll.
            className="text-fg-muted mx-2 mb-3 h-8 shrink-0 justify-start gap-2 font-normal group-data-[collapsible=icon]:hidden"
          >
            <Search className="size-3.5" />
            <span className="text-xs">Search tools</span>
            <kbd className="bg-surface-2 text-fg-subtle ml-auto rounded border px-1 font-mono text-[10px]">
              {mac ? "⌘" : "Ctrl"}K
            </kbd>
          </Button>

          {groups.map(({ group, tools }) => (
            <SidebarGroup key={group} className="py-0">
              <SidebarGroupLabel className="text-fg-subtle text-[11px] font-medium tracking-wide uppercase">
                {group}
              </SidebarGroupLabel>
              <SidebarMenu>
                {tools.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="font-mono text-[13px]"
                    >
                      <NavLink to={item.url}>
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="flex-row items-center gap-1.5">
          <ModeToggle />
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/Kailash-Sankar/dev-tools"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </a>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <main className="bg-background flex min-h-svh min-w-0 flex-1 flex-col">
        {children}
      </main>

      <CommandPalette />
    </SidebarProvider>
  )
}
