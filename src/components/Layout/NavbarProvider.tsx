import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../app-sidebar";

export default async function NavbarProvider({
  children,
  user,
}: Readonly<{
  children: React.ReactNode;
  user?: any;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="ml-[sidebar-width] w-full">
        <div className="border-b flex justify-between items-center w-full px-4 py-3 sticky top-0 z-10">
          <SidebarTrigger />
        </div>
        <div className="flex-1 w-full h-[calc(100vh - 56px)] overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
