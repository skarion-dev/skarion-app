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
import { EtlDashboard } from "@/components/etl/etl-dashboard";
import { CandidateDashboard } from "@/components/etl/candidate-dashboard";
import {
  getCandidates,
  getJobApplications,
  getEtlStats,
  getMyApplications,
  getMyStats,
} from "@/app/etl/actions";
import { getCrawlerStatus, getJobs } from "@/app/jobs/actions";
import { JobsList } from "@/components/JobsList";
import { ScheduleTable } from "@/components/schedules/schedule-table";
import { ChatPanel } from "@/components/chat/chat-panel";
import { BookingSettingsPanel } from "@/components/booking/booking-settings-panel";
import { Lock } from "lucide-react";

export default async function AppRootPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  const permissions: string[] = session.user?.permissions ?? [];

  const hasEtlAccess = permissions.includes("ACCESS_ETL_DASHBOARD");
  const canManageBookingSettings = permissions.includes(
    "MANAGE_BOOKING_SETTINGS"
  );
  const isCandidateOnly =
    permissions.includes("ACCESS_CANDIDATE_DASHBOARD") &&
    !hasEtlAccess &&
    !canManageBookingSettings;
  const isCandidate = permissions.includes("ACCESS_CANDIDATE_DASHBOARD");
  const isCustomerSupport = permissions.includes(
    "ACCESS_CUSTOMER_SUPPORT_DASHBOARD"
  );

  const showChat = isCandidate || isCustomerSupport;

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

  const chatPanel = showChat ? (
    <ChatPanel
      accessToken={(session as any).accessToken ?? ""}
      currentUserId={session.user?.id ?? ""}
      isCandidate={isCandidate}
      isCustomerSupport={isCustomerSupport}
    />
  ) : undefined;

  // ── Candidate-only view ───────────────────────────────────────────────────
  if (isCandidateOnly) {
    const [myApplications, myStats] = await Promise.all([
      getMyApplications(),
      getMyStats(),
    ]);

    return (
      <AppLayout breadcrumbs={breadcrumbs} user={session.user} chatPanel={chatPanel}>
        <div className="p-4">
          <CandidateDashboard
            initialApplications={myApplications}
            initialStats={myStats}
            accessToken={(session as any).accessToken ?? ""}
            currentUserName={session.user?.name ?? "You"}
          />
        </div>
      </AppLayout>
    );
  }

  // ── Full ETL dashboard view ───────────────────────────────────────────────
  if (hasEtlAccess) {
    const [candidates, applications, stats, jobs, crawlerStatus] =
      await Promise.all([
        getCandidates(),
        getJobApplications(),
        getEtlStats(),
        getJobs(),
        getCrawlerStatus(),
      ]);

    return (
      <AppLayout breadcrumbs={breadcrumbs} user={session.user} chatPanel={chatPanel}>
        <div>
          <div className="flex justify-end items-center mb-6">
            {permissions.includes("MANAGE_COURSE") && (
              <CreateCourseModal>
                <Button>Create New Course</Button>
              </CreateCourseModal>
            )}
          </div>

          {permissions.includes("ACCESS_AFFILIATE_DASHBOARD") && (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-primary mb-1">
                    Affiliate Dashboard
                  </h2>
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
              <div className="mb-6">
                <ScheduleTable />
              </div>
            </>
          )}

          {canManageBookingSettings && (
            <div className="mb-6">
              <BookingSettingsPanel />
            </div>
          )}

          <div className="space-y-6 mb-6">
            <JobsList groupedJobs={jobs} crawlerStatus={crawlerStatus} />
          </div>

          <div className="pt-10 border-t">
            <EtlDashboard
              initialCandidates={candidates}
              initialApplications={applications}
              initialStats={stats}
              accessToken={(session as any).accessToken ?? ""}
              currentUserName={session.user?.name ?? "You"}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Booking-manager-only view ───────────────────────────────────────────
  if (canManageBookingSettings) {
    return (
      <AppLayout breadcrumbs={breadcrumbs} user={session.user} chatPanel={chatPanel}>
        <div className="p-4">
          <BookingSettingsPanel />
        </div>
      </AppLayout>
    );
  }

  // ── No relevant permissions ───────────────────────────────────────────────
  return (
    <AppLayout breadcrumbs={breadcrumbs} user={session.user} chatPanel={chatPanel}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No dashboard access</h2>
          <p className="text-sm text-muted-foreground">
            Your account does not have access to any dashboard sections yet.
            Please contact an administrator to get your role assigned.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
