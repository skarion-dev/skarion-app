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
import { ScheduleTable } from "@/components/schedules/schedule-table";

export default async function SchedulesPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  // Optionally perform RBAC here, but the backend also protects the endpoint

  const breadcrumbs = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Schedules</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={session.user}>
      <div className="p-6">
        <div className="mb-8 font-inter">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 border-b pb-2">
            Forms & Schedules
          </h1>
          <p className="text-muted-foreground mt-2">
            View booking details and filter by affiliate referral code.
          </p>
        </div>
        <ScheduleTable />
      </div>
    </AppLayout>
  );
}
