"use server";

import { getApiUrl } from "@/lib/utils";

export async function getJobs() {
  try {
    const res = await fetch(getApiUrl("/jobs"), {
      cache: "no-store",
    });
    if (!res.ok) return {};
    return res.json();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return {};
  }
}

export interface CrawlerStatusResponse {
  crawlerName: string;
  isActive: boolean;
  isOnline: boolean;
  lastHeartbeatAt: string | null;
  offlineThresholdMinutes: number;
  message?: string | null;
}

export async function getCrawlerStatus(): Promise<CrawlerStatusResponse | null> {
  try {
    const res = await fetch(getApiUrl("/jobs/crawler-status"), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching crawler status:", error);
    return null;
  }
}
