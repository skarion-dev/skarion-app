"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import {
  Plus,
  UserPlus,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
  Star,
  Calendar,
  Search,
  X,
  SlidersHorizontal,
  Download,
  MessageCircle,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { CandidateFormModal } from "@/components/etl/candidate-form-modal";
import { JobApplicationFormModal } from "@/components/etl/job-application-form-modal";
import { CommentsDialog } from "@/components/etl/comments-dialog";
import { StatsCards } from "@/components/etl/stats-cards";
import { ApplicationsChart } from "@/components/etl/applications-chart";
import {
  EtlService,
  type Candidate,
  type JobApplication,
  type EtlStats,
} from "@/api-client/services/EtlService";
import { OpenAPI } from "@/api-client/core/OpenAPI";

interface Props {
  initialCandidates: Candidate[];
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

export function EtlDashboard({
  initialCandidates,
  initialApplications,
  initialStats,
  accessToken,
  currentUserName,
}: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [stats, setStats] = useState<EtlStats | null>(initialStats);
  const [loading, setLoading] = useState(false);

  // Modals
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Comments dialog
  const [commentsApp, setCommentsApp] = useState<JobApplication | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Delete
  const [deletingApp, setDeletingApp] = useState<JobApplication | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Resume download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCandidate, setFilterCandidate] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterShortlisted, setFilterShortlisted] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Inject bearer token
  useEffect(() => {
    OpenAPI.TOKEN = accessToken;
  }, [accessToken]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [cands, apps, newStats] = await Promise.all([
        EtlService.getCandidates(),
        EtlService.getJobApplications(),
        EtlService.getStats(),
      ]);
      setCandidates(cands);
      setApplications(apps);
      setStats(newStats);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Derived counts for stat cards ────────────────────────────────────────
  const shortlistedCount = useMemo(
    () => applications.filter((a) => a.shortlisted && !["Confirmed", "Rejected", "Expired"].includes(a.status || "")).length,
    [applications]
  );
  const confirmedCount = useMemo(
    () => applications.filter((a) => a.status === "Confirmed").length,
    [applications]
  );

  // ── Derived lists for filter dropdowns ───────────────────────────────────
  const uniquePlatforms = useMemo(() => {
    const set = new Set(applications.map((a) => a.platform).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [applications]);

  // ── Filtered applications ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return applications.filter((app) => {
      if (q) {
        const hay = [
          app.companyName,
          app.jobRole,
          app.location,
          app.platform,
          app.candidate?.name,
          candidates.find((c) => c.id === app.candidateId)?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterStatus !== "all" && app.status !== filterStatus) return false;
      if (filterCandidate !== "all" && app.candidateId !== filterCandidate) return false;
      if (filterPlatform !== "all" && app.platform !== filterPlatform) return false;
      if (filterShortlisted === "yes" && !app.shortlisted) return false;
      if (filterShortlisted === "no" && app.shortlisted) return false;
      return true;
    });
  }, [applications, candidates, search, filterStatus, filterCandidate, filterPlatform, filterShortlisted]);

  const activeFilterCount = [
    filterStatus !== "all",
    filterCandidate !== "all",
    filterPlatform !== "all",
    filterShortlisted !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterCandidate("all");
    setFilterPlatform("all");
    setFilterShortlisted("all");
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCandidateCreated = (candidate: Candidate) => {
    setCandidates((prev) => [candidate, ...prev]);
    // refresh stats to update totalCandidates
    EtlService.getStats().then(setStats).catch(() => {});
  };

  const handleAppSaved = (app: JobApplication) => {
    setApplications((prev) => {
      const exists = prev.find((a) => a.id === app.id);
      if (exists) return prev.map((a) => (a.id === app.id ? app : a));
      return [app, ...prev];
    });
    // Refresh stats counts
    EtlService.getStats().then(setStats).catch(() => {});
  };

  const handleDeleteConfirm = async () => {
    if (!deletingApp) return;
    setDeleteLoading(true);
    try {
      await EtlService.deleteJobApplication(deletingApp.id);
      setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
      EtlService.getStats().then(setStats).catch(() => {});
    } catch {
      toast.error("Failed to delete application");
    } finally {
      setDeleteLoading(false);
      setDeletingApp(null);
    }
  };

  const handleDownloadResume = async (app: JobApplication) => {
    if (!app.resumeUrl) return;
    setDownloadingId(app.id);
    try {
      await EtlService.downloadResume(app.resumeUrl);
    } catch {
      // Fallback: open the SharePoint webUrl in new tab
      window.open(app.resumeUrl, "_blank", "noopener,noreferrer");
      toast.info("Opened in new tab — sign in to Microsoft if prompted.");
    } finally {
      setDownloadingId(null);
    }
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setAppModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingApp(null);
    setAppModalOpen(true);
  };

  const openCommentsDialog = (app: JobApplication) => {
    setCommentsApp(app);
    setCommentsOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* ── KPI Stat Cards ─────────────────────────────────── */}
      {stats && (
        <StatsCards
          stats={stats}
          shortlistedCount={shortlistedCount}
          confirmedCount={confirmedCount}
        />
      )}

      {/* ── Applications Chart ─────────────────────────────── */}
      {stats && (
        <ApplicationsChart stats={stats} />
      )}

      {/* ── Header bar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Application Tracker</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length !== applications.length
              ? `${filtered.length} of ${applications.length} application${applications.length !== 1 ? "s" : ""}`
              : `${applications.length} application${applications.length !== 1 ? "s" : ""}`}
            {candidates.length > 0 &&
              ` · ${candidates.length} candidate${candidates.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCandidateModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            New Candidate
          </Button>
          <Button size="sm" onClick={openCreateModal} disabled={candidates.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Log Application
          </Button>
        </div>
      </div>

      {/* Empty state – no candidates */}
      {candidates.length === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/20 py-10 text-center text-sm text-muted-foreground">
          <UserPlus className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium mb-1">No candidates yet</p>
          <p className="mb-4">Create a candidate profile before logging applications.</p>
          <Button variant="outline" size="sm" onClick={() => setCandidateModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create First Candidate
          </Button>
        </div>
      )}

      {candidates.length > 0 && (
        <>
          {/* ── Search & Filter bar ──────────────────────────── */}
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
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
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
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCandidate} onValueChange={setFilterCandidate}>
                  <SelectTrigger className="h-8 text-xs w-[150px]">
                    <SelectValue placeholder="Candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Candidates</SelectItem>
                    {candidates.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
                        <SelectItem key={p} value={p}>{p}</SelectItem>
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

          {/* ── Table ────────────────────────────────────────── */}
          <Card className="border">
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[600px]">
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="min-w-[110px]">Candidate</TableHead>
                      <TableHead className="min-w-[150px]">Company / Role</TableHead>
                      <TableHead className="hidden md:table-cell">Platform</TableHead>
                      <TableHead className="hidden lg:table-cell">Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Shortlisted</TableHead>
                      <TableHead className="hidden md:table-cell">Applied Date</TableHead>
                      <TableHead className="hidden xl:table-cell">Interview</TableHead>
                      <TableHead className="hidden lg:table-cell">Applied By</TableHead>
                      <TableHead className="hidden sm:table-cell">Resume</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead className="hidden xl:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={13} className="h-32 text-center text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                          Loading applications…
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="h-32 text-center text-muted-foreground">
                          {applications.length === 0 ? (
                            <>
                              <p className="font-medium mb-1">No applications logged yet</p>
                              <p className="text-xs mb-3">Click &quot;Log Application&quot; to get started.</p>
                              <Button size="sm" variant="outline" onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Log Application
                              </Button>
                              
                                
                            </>
                          ) : (
                            <>
                              
                              <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                              <p className="font-medium mb-1">No results match your filters</p>
                              <button
                                onClick={clearFilters}
                                className="text-xs text-primary hover:underline"
                              >
                                Clear all filters
                              </button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((app) => (
                        <TableRow key={app.id} className="hover:bg-muted/10 transition-colors">
                          {/* Candidate */}
                          <TableCell className="font-medium">
                            {app.candidate?.name ??
                              candidates.find((c) => c.id === app.candidateId)?.name ??
                              "—"}
                          </TableCell>

                          {/* Company / Role */}
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{app.companyName}</span>
                              <span className="text-xs text-muted-foreground">{app.jobRole}</span>
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
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[app.status] ?? "bg-muted text-muted-foreground border-muted"}`}
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

                          {/* Applied By */}
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {app.appliedBy?.name ?? "—"}
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

                          {/* Comments */}
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

                          {/* Created At */}
                          <TableCell className="hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                            {app.createdAt
                              ? format(new Date(app.createdAt), "MMM d, yyyy")
                              : "—"}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditModal(app)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeletingApp(app)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
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

      {/* ── Modals ──────────────────────────────────────────── */}
      <CandidateFormModal
        open={candidateModalOpen}
        onOpenChange={setCandidateModalOpen}
        onCreated={handleCandidateCreated}
        accessToken={accessToken}
      />
      <JobApplicationFormModal
        open={appModalOpen}
        onOpenChange={(open) => {
          setAppModalOpen(open);
          if (!open) setEditingApp(null);
        }}
        candidates={candidates}
        editingApplication={editingApp}
        currentUserName={currentUserName}
        onSaved={handleAppSaved}
      />

      {/* Comments dialog (from table) */}
      <CommentsDialog
        application={commentsApp}
        open={commentsOpen}
        onOpenChange={(open) => {
          setCommentsOpen(open);
          if (!open) setCommentsApp(null);
        }}
        currentUserName={currentUserName ?? "You"}
        onSaved={(updated) => {
          handleAppSaved(updated);
          // Keep commentsApp in sync so panel reflects new comments
          setCommentsApp(updated);
        }}
      />

      {/* ── Delete confirmation ──────────────────────────────── */}
      <AlertDialog
        open={!!deletingApp}
        onOpenChange={(open) => { if (!open) setDeletingApp(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the{" "}
              <span className="font-semibold text-foreground">
                {deletingApp?.jobRole}
              </span>{" "}
              role at{" "}
              <span className="font-semibold text-foreground">
                {deletingApp?.companyName}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
