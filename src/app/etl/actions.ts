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
    const res = await fetch(getApiUrl("/etl/job-applications"), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
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
