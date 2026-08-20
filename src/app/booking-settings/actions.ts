"use server";

import { auth } from "@/auth";
import { getApiUrl } from "@/lib/utils";

export type BookingSlotDefinition = {
  value: string;
  label: string;
  hour: number;
  minute: number;
};

export type BookingSettingsData = {
  enabledSlots: string[];
  enabledWeekdays: number[];
  durationMinutes: number;
  availabilityDays: number;
  minimumLeadHours: number;
  bookingUnavailableUntil: string | null;
  updatedAt: string;
  allSlotDefinitions: BookingSlotDefinition[];
  /** Per-date overrides. Keys are "YYYY-MM-DD" date strings. null = use global for all dates. */
  dateOverrides: Record<string, string[]> | null;
  timezone: string;
};

export type UpdateBookingSettingsPayload = Partial<{
  enabledSlots: string[];
  enabledWeekdays: number[];
  durationMinutes: number;
  availabilityDays: number;
  minimumLeadHours: number;
  bookingUnavailableUntil: string | null;
  /** Pass null to clear all per-date overrides. */
  dateOverrides: Record<string, string[]> | null;
  timezone: string;
}>;

type BookingSettingsResult =
  | { ok: true; data: BookingSettingsData }
  | { ok: false; error: string };

async function getAuthToken(): Promise<string | null> {
  const session = await auth();
  const authenticatedSession = session as (typeof session & {
    accessToken?: string;
  });
  return authenticatedSession?.accessToken ?? null;
}

function errorForStatus(status: number, operation: "load" | "update") {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to manage booking settings.";
  return `Unable to ${operation} booking settings. Please try again shortly.`;
}

export async function getBookingSettings(): Promise<BookingSettingsResult> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Please sign in again." };

  try {
    const res = await fetch(getApiUrl("/bookings/admin/settings"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[Booking settings] Load failed", { status: res.status });
      return { ok: false, error: errorForStatus(res.status, "load") };
    }

    return { ok: true, data: await res.json() };
  } catch (error) {
    console.error("[Booking settings] Load request failed", error);
    return {
      ok: false,
      error: "The booking service is temporarily unavailable. Please try again.",
    };
  }
}

export async function updateBookingSettings(
  payload: UpdateBookingSettingsPayload
): Promise<BookingSettingsResult> {
  const token = await getAuthToken();
  if (!token) return { ok: false, error: "Please sign in again." };

  try {
    const res = await fetch(getApiUrl("/bookings/admin/settings"), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[Booking settings] Update failed", { status: res.status });
      return { ok: false, error: errorForStatus(res.status, "update") };
    }

    return { ok: true, data: await res.json() };
  } catch (error) {
    console.error("[Booking settings] Update request failed", error);
    return {
      ok: false,
      error: "The booking service is temporarily unavailable. Please try again.",
    };
  }
}
