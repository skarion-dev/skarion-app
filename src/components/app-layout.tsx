import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  user?: any; // Accepting user from session
}

export function AppLayout({ children, breadcrumbs, user }: AppLayoutProps) {
  
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
