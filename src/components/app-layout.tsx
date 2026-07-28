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
  user?: any;
  chatPanel?: React.ReactNode;
}

export function AppLayout({ children, breadcrumbs, user, chatPanel }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="min-w-0 overflow-hidden flex flex-col" style={{ height: '100svh', minHeight: 'unset' }}>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs}
          </div>
        </header>

        {/* Main content + inline chat panel side by side */}
        <div className="flex flex-1 overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="flex flex-col gap-4 p-4 pt-4 min-w-0 overflow-x-hidden">
              {children}
            </div>
          </div>

          {/* Inline chat panel — rendered here so it's always visible */}
          {chatPanel}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
