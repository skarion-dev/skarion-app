"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CalendarIcon, Upload, FileText, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  EtlService,
  type Candidate,
  type JobApplication,
  type Comment,
} from "@/api-client/services/EtlService";
import { CommentsPanel } from "@/components/etl/comments-panel";

const PLATFORMS = [
  "LinkedIn", "Indeed", "Mail", "Simplify", "SmartRecruiter",
  "SimplyHired", "Glassdoor", "ZipRecruiter", "Greenhouse",
  "Company Website", "HiringCafe", "Other",
];
const STATUSES = ["Applied", "On Hold", "Expired", "Rejected", "Confirmed"];
const WORKPLACE_TYPES = ["Remote", "Hybrid", "On-site"];
const CONTRACT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];

const schema = z.object({
  candidateId: z.string().min(1, "Please select a candidate"),
  companyName: z.string().min(1, "Company name is required"),
  jobRole: z.string().min(1, "Job role is required"),
  jobUrl: z.string().optional(),
  workplaceType: z.string().optional(),
  contractType: z.string().optional(),
  location: z.string().optional(),
  platform: z.string().optional(),
  status: z.string().optional(),
  shortlisted: z.boolean(),
  interviewScheduled: z.date().optional(),
  applicationDate: z.date().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
  editingApplication?: JobApplication | null;
  currentUserName?: string;
  onSaved: (app: JobApplication) => void;
}

const DEFAULT_VALUES: FormValues = {
  candidateId: "",
  companyName: "",
  jobRole: "",
  jobUrl: "",
  workplaceType: undefined,
  contractType: undefined,
  location: "",
  platform: undefined,
  status: "Applied",
  shortlisted: false,
  interviewScheduled: undefined,
  applicationDate: new Date(),
};

export function JobApplicationFormModal({
  open,
  onOpenChange,
  candidates,
  editingApplication,
  currentUserName,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingApplication;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      if (editingApplication) {
        form.reset({
          candidateId: editingApplication.candidateId,
          companyName: editingApplication.companyName,
          jobRole: editingApplication.jobRole,
          jobUrl: editingApplication.jobUrl ?? "",
          workplaceType: editingApplication.workplaceType ?? undefined,
          contractType: editingApplication.contractType ?? undefined,
          location: editingApplication.location ?? "",
          platform: editingApplication.platform ?? undefined,
          status: editingApplication.status ?? undefined,
          shortlisted: editingApplication.shortlisted ?? false,
          interviewScheduled: editingApplication.interviewScheduled
            ? new Date(editingApplication.interviewScheduled)
            : undefined,
          applicationDate: editingApplication.applicationDate
            ? new Date(editingApplication.applicationDate)
            : undefined,
        });
        setComments(editingApplication.comments ?? []);
        setResumeUrl(editingApplication.resumeUrl ?? "");
        setResumeFileName(editingApplication.resumeFileName ?? "");
      } else {
        form.reset(DEFAULT_VALUES);
        setComments([]);
        setResumeUrl("");
        setResumeFileName("");
      }
      setResumeFile(null);
    }
  }, [editingApplication, open, form]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);

    // Get candidate name for subfolder
    const selectedCandidate = candidates.find(
      (c) => c.id === form.getValues("candidateId")
    );

    setUploadingResume(true);
    try {
      const result = await EtlService.uploadResume(file, selectedCandidate?.name);
      setResumeUrl(result.url);
      setResumeFileName(result.name);
      toast.success("Resume uploaded to SharePoint");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to upload resume");
      setResumeFile(null);
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearResume = () => {
    setResumeFile(null);
    setResumeUrl("");
    setResumeFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setLoading(true);
    try {
      const payload = {
        candidateId: values.candidateId,
        companyName: values.companyName,
        jobRole: values.jobRole,
        jobUrl: values.jobUrl || undefined,
        workplaceType: values.workplaceType || undefined,
        contractType: values.contractType || undefined,
        location: values.location || undefined,
        platform: values.platform || undefined,
        status: values.status || undefined,
        shortlisted: values.shortlisted,
        interviewScheduled: values.interviewScheduled?.toISOString(),
        applicationDate: values.applicationDate?.toISOString(),
        resumeUrl: resumeUrl || undefined,
        resumeFileName: resumeFileName || undefined,
        comments,
      };

      let result: JobApplication;
      if (isEditing && editingApplication) {
        result = await EtlService.updateJobApplication(editingApplication.id, payload);
        toast.success("Application updated successfully");
      } else {
        result = await EtlService.createJobApplication(payload);
        toast.success("Application logged successfully");
      }

      onSaved(result);
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Application" : "Log New Application"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this job application."
              : "Fill in the details of the job application you want to track."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5 pt-1">
            {/* Candidate */}
            <FormField
              control={form.control as any}
              name="candidateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidate <span className="text-destructive">*</span></FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a candidate..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {candidates.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Google" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="jobRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Role <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Software Engineer" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job URL */}
            <FormField
              control={form.control as any}
              name="jobUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job URL</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location / Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="e.g. London, UK" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select platform..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Workplace / Contract */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="workplaceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workplace Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Optional..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WORKPLACE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Optional..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTRACT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status / Shortlisted */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control as any}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="shortlisted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border p-3 h-10">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-medium cursor-pointer mb-0">
                      Shortlisted
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Application Date / Interview Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="applicationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="interviewScheduled"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Interview Scheduled</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Resume upload */}
            <div className="space-y-2">
              <FormLabel>Resume</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
              {resumeUrl ? (
                <div className="flex items-center gap-2 p-2.5 rounded-md border bg-muted/30 text-sm">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="flex-1 truncate font-medium">{resumeFileName || "Resume"}</span>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 shrink-0"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={clearResume}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingResume}
                >
                  {uploadingResume ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading to SharePoint…</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Upload Resume (PDF / DOCX)</>
                  )}
                </Button>
              )}
              <p className="text-[11px] text-muted-foreground">
                Files are stored in your SharePoint folder.
              </p>
            </div>

            <Separator />

            {/* Threaded Comments */}
            <CommentsPanel
              comments={comments}
              onChange={setComments}
              currentUserName={currentUserName ?? "You"}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploadingResume}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Save Changes" : "Log Application"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
