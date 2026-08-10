import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isGroupActive = item.items?.some((subItem) =>
            location.pathname.includes(subItem.url)
          )
          const defaultOpen = item.isActive || isGroupActive

          return (
            <Collapsible
              key={item.title}
              defaultOpen={defaultOpen}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                className="group"
                render={<SidebarMenuButton tooltip={item.title} />}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-panel-open:rotate-90" />
              </CollapsibleTrigger>

              <CollapsibleContent className="overflow-hidden text-sm">
                <SidebarMenuSub>
                  {item.items?.map((subItem) => {
                    const isSubActive = location.pathname === subItem.url

                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          render={<Link to={subItem.url} />}
                          className={
                            isSubActive
                              ? "bg-primary/15 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          }
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
              </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}