"use server";

import { auth } from "@/auth";
import { getApiUrl } from "@/lib/utils";
import type { Candidate, JobApplication, EtlStats } from "@/api-client/services/EtlService";

async function getAuthHeaders() {
  const session = await auth();
  return {
    Authorization: `Bearer ${(session as any)?.accessToken ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function getCandidates(): Promise<Candidate[]> {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(getApiUrl("/etl/candidates"), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getJobApplications(): Promise<JobApplication[]> {
  const headers = await getAuthHeaders();
  try {
    const url = getApiUrl("/etl/job-applications");
    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[ETL] Failed to fetch job applications", {
        url,
        status: res.status,
        statusText: res.statusText,
        response: text,
      });
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("[ETL] Error fetching job applications", error);
    return [];
  }
}

export async function getEtlStats(): Promise<EtlStats | null> {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(getApiUrl("/etl/stats"), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getMyApplications(): Promise<JobApplication[]> {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(getApiUrl("/etl/my-applications"), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getMyStats(): Promise<EtlStats | null> {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(getApiUrl("/etl/my-stats"), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
