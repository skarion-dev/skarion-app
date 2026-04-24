import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export type Candidate = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  text: string;
  author: string;
  authorId?: string;
  timestamp: string;
  parentId?: string; // for threaded replies
};

export type JobApplication = {
  id: string;
  candidateId: string;
  candidate?: Candidate;
  companyName: string;
  jobRole: string;
  jobUrl?: string;
  workplaceType?: string;
  contractType?: string;
  location?: string;
  platform?: string;
  status?: string;
  shortlisted: boolean;
  interviewScheduled?: string;
  applicationDate?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  appliedById?: string;
  appliedBy?: { id: string; name: string; email: string };
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
};

export type EtlStats = {
  totalCandidates: number;
  totalApplications: number;
  byStatus: Record<string, number>;
  byDay: { date: string; count: number }[];
  byMonth: { month: string; count: number }[];
  byYear: { year: string; count: number }[];
};

export type CreateCandidatePayload = { name: string };

export type CreateJobApplicationPayload = {
  candidateId: string;
  companyName: string;
  jobRole: string;
  jobUrl?: string;
  workplaceType?: string;
  contractType?: string;
  location?: string;
  platform?: string;
  status?: string;
  shortlisted?: boolean;
  interviewScheduled?: string;
  applicationDate?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  comments?: Comment[];
};

export type UpdateJobApplicationPayload = Partial<CreateJobApplicationPayload>;

export class EtlService {
  public static getCandidates(): CancelablePromise<Candidate[]> {
    return __request(OpenAPI, { method: "GET", url: "/etl/candidates" });
  }

  public static createCandidate(
    requestBody: CreateCandidatePayload
  ): CancelablePromise<Candidate> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/etl/candidates",
      body: requestBody,
      mediaType: "application/json",
    });
  }

  public static getJobApplications(): CancelablePromise<JobApplication[]> {
    return __request(OpenAPI, { method: "GET", url: "/etl/job-applications" });
  }

  public static createJobApplication(
    requestBody: CreateJobApplicationPayload
  ): CancelablePromise<JobApplication> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/etl/job-applications",
      body: requestBody,
      mediaType: "application/json",
    });
  }

  public static updateJobApplication(
    id: string,
    requestBody: UpdateJobApplicationPayload
  ): CancelablePromise<JobApplication> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/etl/job-applications/${id}`,
      body: requestBody,
      mediaType: "application/json",
    });
  }

  public static deleteJobApplication(id: string): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/etl/job-applications/${id}`,
    });
  }

  public static getStats(): CancelablePromise<EtlStats> {
    return __request(OpenAPI, { method: "GET", url: "/etl/stats" });
  }

  /**
   * Upload a resume file to SharePoint.
   * Returns { url, name } from the server.
   */
  public static async uploadResume(
    file: File,
    candidateName?: string
  ): Promise<{ url: string; name: string }> {
    const token = typeof OpenAPI.TOKEN === "string" ? OpenAPI.TOKEN : undefined;
    const baseUrl = OpenAPI.BASE ?? "";
    const params = candidateName
      ? `?candidateName=${encodeURIComponent(candidateName)}`
      : "";
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${baseUrl}/etl/resume/upload${params}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message ?? "Upload failed");
    }
    return res.json() as Promise<{ url: string; name: string }>;
  }

  /**
   * Download a resume from SharePoint via the backend proxy.
   * Triggers a browser file download without requiring MS auth.
   */
  public static async downloadResume(webUrl: string): Promise<void> {
    const token = typeof OpenAPI.TOKEN === "string" ? OpenAPI.TOKEN : undefined;
    const baseUrl = OpenAPI.BASE ?? "";

    const res = await fetch(
      `${baseUrl}/etl/resume/download?url=${encodeURIComponent(webUrl)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message ?? "Download failed");
    }

    // Trigger browser download
    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") ?? "";
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const fileName = match
      ? match[1].replace(/['"]/g, "")
      : "resume";

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }
}
