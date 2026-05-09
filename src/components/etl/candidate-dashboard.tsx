"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Loader2,
  Star,
  Calendar,
  Search,
  X,
  Download,
  MessageCircle,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import { CommentsDialog } from "@/components/etl/comments-dialog";
import { StatsCards } from "@/components/etl/stats-cards";
import { ApplicationsChart } from "@/components/etl/applications-chart";
import {
  EtlService,
  type JobApplication,
  type EtlStats,
} from "@/api-client/services/EtlService";
import { OpenAPI } from "@/api-client/core/OpenAPI";

interface Props {
  initialApplications: JobApplication[];
  initialStats: EtlStats | null;
  accessToken: string;
  currentUserName?: string;
}

const STATUS_STYLES: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-700 border-blue-200",
  "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Expired: "bg-gray-100 text-gray-600 border-gray-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Confirmed: "bg-green-100 text-green-700 border-green-200",
};

const ALL_STATUSES = ["Applied", "On Hold", "Expired", "Rejected", "Confirmed"];

export function CandidateDashboard({
  initialApplications,
  initialStats,
  accessToken,
  currentUserName,
}: Props) {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [stats, setStats] = useState<EtlStats | null>(initialStats);
  const [loading, setLoading] = useState(false);

  // Comments dialog
  const [commentsApp, setCommentsApp] = useState<JobApplication | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Resume download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterShortlisted, setFilterShortlisted] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Inject bearer token
  useEffect(() => {
    OpenAPI.TOKEN = accessToken;
  }, [accessToken]);

  // Derived counts for stat cards
  const shortlistedCount = useMemo(
    () =>
      applications.filter(
        (a) => a.shortlisted && !["Confirmed", "Rejected", "Expired"].includes(a.status || "")
      ).length,
    [applications]
  );
  const confirmedCount = useMemo(
    () => applications.filter((a) => a.status === "Confirmed").length,
    [applications]
  );

  const uniquePlatforms = useMemo(() => {
    const set = new Set(applications.map((a) => a.platform).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [applications]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return applications.filter((app) => {
      if (q) {
        const hay = [app.companyName, app.jobRole, app.location, app.platform]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterStatus !== "all" && app.status !== filterStatus) return false;
      if (filterPlatform !== "all" && app.platform !== filterPlatform) return false;
      if (filterShortlisted === "yes" && !app.shortlisted) return false;
      if (filterShortlisted === "no" && app.shortlisted) return false;
      return true;
    });
  }, [applications, search, filterStatus, filterPlatform, filterShortlisted]);

  const activeFilterCount = [
    filterStatus !== "all",
    filterPlatform !== "all",
    filterShortlisted !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterPlatform("all");
    setFilterShortlisted("all");
  };

  const handleDownloadResume = async (app: JobApplication) => {
    if (!app.resumeUrl) return;
    setDownloadingId(app.id);
    try {
      await EtlService.downloadResume(app.resumeUrl);
    } catch {
      window.open(app.resumeUrl, "_blank", "noopener,noreferrer");
      toast.info("Opened in new tab — sign in to Microsoft if prompted.");
    } finally {
      setDownloadingId(null);
    }
  };

  const openCommentsDialog = (app: JobApplication) => {
    setCommentsApp(app);
    setCommentsOpen(true);
  };

  // Sync comment updates back into local state
  const handleCommentSaved = (updated: JobApplication) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setCommentsApp(updated);
  };

  return (
    <div className="space-y-5">
      {/* KPI Stat Cards */}
      {stats && (
        <StatsCards
          stats={stats}
          shortlistedCount={shortlistedCount}
          confirmedCount={confirmedCount}
          hideCandidatesCount
        />
      )}

      {/* Applications Chart */}
      {stats && <ApplicationsChart stats={stats} />}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">My Applications</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length !== applications.length
              ? `${filtered.length} of ${applications.length} application${applications.length !== 1 ? "s" : ""}`
              : `${applications.length} application${applications.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/20 py-10 text-center text-sm text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium mb-1">No applications yet</p>
          <p>Your assigned applications will appear here once added by an admin.</p>
        </div>
      )}

      {applications.length > 0 && (
        <>
          {/* Search & Filter bar */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search company, role, location…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <Button
                variant={filtersOpen || activeFilterCount > 0 ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFiltersOpen((v) => !v)}
                className="gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {(search || activeFilterCount > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {filtersOpen && (
              <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {uniquePlatforms.length > 0 && (
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="h-8 text-xs w-[140px]">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {uniquePlatforms.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={filterShortlisted} onValueChange={setFilterShortlisted}>
                  <SelectTrigger className="h-8 text-xs w-[130px]">
                    <SelectValue placeholder="Shortlisted" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Shortlist</SelectItem>
                    <SelectItem value="yes">⭐ Shortlisted</SelectItem>
                    <SelectItem value="no">Not Shortlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Table */}
          <Card className="border">
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[600px]">
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="min-w-[150px]">Company / Role</TableHead>
                      <TableHead className="hidden md:table-cell">Platform</TableHead>
                      <TableHead className="hidden lg:table-cell">Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Shortlisted</TableHead>
                      <TableHead className="hidden md:table-cell">Applied Date</TableHead>
                      <TableHead className="hidden xl:table-cell">Interview</TableHead>
                      <TableHead className="hidden sm:table-cell">Resume</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                          Loading applications…
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                          <p className="font-medium mb-1">No results match your filters</p>
                          <button
                            onClick={clearFilters}
                            className="text-xs text-primary hover:underline"
                          >
                            Clear all filters
                          </button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((app) => (
                        <TableRow
                          key={app.id}
                          className="hover:bg-muted/10 transition-colors"
                        >
                          {/* Company / Role */}
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground">
                                  {app.companyName}
                                </span>
                                {app.jobUrl && (
                                  <a
                                    href={app.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {app.jobRole}
                              </span>
                              {app.workplaceType && (
                                <span className="text-xs text-muted-foreground/70">
                                  {app.workplaceType}
                                  {app.contractType ? ` · ${app.contractType}` : ""}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Platform */}
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {app.platform ?? "—"}
                          </TableCell>

                          {/* Location */}
                          <TableCell
                            className="hidden lg:table-cell text-muted-foreground text-sm max-w-[120px] truncate"
                            title={app.location}
                          >
                            {app.location ?? "—"}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            {app.status ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                  STATUS_STYLES[app.status] ??
                                  "bg-muted text-muted-foreground border-muted"
                                }`}
                              >
                                {app.status}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>

                          {/* Shortlisted */}
                          <TableCell className="hidden sm:table-cell">
                            {app.shortlisted ? (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                            ) : (
                              <span className="text-muted-foreground/40 text-xs">—</span>
                            )}
                          </TableCell>

                          {/* Applied Date */}
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                            {app.applicationDate ? (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-sky-500/70" />
                                {format(new Date(app.applicationDate), "MMM d, yyyy")}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>

                          {/* Interview */}
                          <TableCell className="hidden xl:table-cell text-sm text-muted-foreground whitespace-nowrap">
                            {app.interviewScheduled ? (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                                {format(new Date(app.interviewScheduled), "MMM d, yyyy")}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>

                          {/* Resume */}
                          <TableCell className="hidden sm:table-cell">
                            {app.resumeUrl ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary"
                                      disabled={downloadingId === app.id}
                                      onClick={() => handleDownloadResume(app)}
                                    >
                                      {downloadingId === app.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Download className="w-3 h-3" />
                                      )}
                                      {app.resumeFileName
                                        ? app.resumeFileName.length > 12
                                          ? app.resumeFileName.slice(0, 12) + "…"
                                          : app.resumeFileName
                                        : "Download"}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs truncate">
                                      {app.resumeFileName ?? "Download resume"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground/40 text-xs">—</span>
                            )}
                          </TableCell>

                          {/* Comments — candidates CAN add comments */}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 gap-1 text-xs"
                              onClick={() => openCommentsDialog(app)}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {app.comments?.length > 0 ? (
                                <span className="font-medium">{app.comments.length}</span>
                              ) : (
                                <span className="text-muted-foreground/50">Add</span>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Comments dialog (read + comment — no edit/delete of application) */}
      <CommentsDialog
        application={commentsApp}
        open={commentsOpen}
        onOpenChange={(open) => {
          setCommentsOpen(open);
          if (!open) setCommentsApp(null);
        }}
        currentUserName={currentUserName ?? "You"}
        onSaved={handleCommentSaved}
      />
    </div>
  );
}
