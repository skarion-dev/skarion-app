import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { AppLayout } from "@/components/app-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { CopyCodeButton } from "@/components/CopyCodeButton";
import CreateCourseModal from "@/components/CreateCourseModal";

export default async function AppRootPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  console.log(session.user.permissions)

  const breadcrumbs = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={session.user}>
      <div className="flex justify-between items-center p-2 mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <CreateCourseModal>
          <Button>Create New Course</Button>
        </CreateCourseModal>
      </div>

      {session.user?.permissions?.includes("ACCESS_AFFILIATE_DASHBOARD") && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-primary mb-1">Affiliate Dashboard</h2>
            <p className="text-sm text-muted-foreground mr-4">
              Share this code with your audience.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded border font-mono font-bold tracking-wide text-lg shadow-sm">
              {session.user?.referralCode}
            </div>
            <CopyCodeButton code={session.user?.referralCode} />
          </div>
        </div>
      )}

    </AppLayout>
  );
}
