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
import { UsersTable } from "@/components/Users/UsersTable";
import { getApiUrl } from "@/lib/utils";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  if (!session.user?.permissions?.includes("MANAGE_USERS")) {
    redirect("/");
  }

  // Fetch users from API
  let users = [];
  try {
    const res = await fetch(getApiUrl("/users"), {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
    
    if (res.ok) {
      users = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch users", error);
  }

  const breadcrumbs = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Active Users</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={session.user}>
      <div className="max-w-6xl w-full mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">Manage Users</h1>
        <UsersTable initialUsers={users} accessToken={session.accessToken} />
      </div>
    </AppLayout>
  );
}
