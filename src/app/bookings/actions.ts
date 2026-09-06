"use server";

import { auth } from "@/auth";
import { getApiUrl } from "@/lib/utils";

export type AdminBooking = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  note?: string;
  meetingSummary?: string | null;
  slotDate: string;
  slotValue: string;
  slotLabel: string;
  slotStartAt: string;
  slotEndAt: string;
  timezone: string;
  meetingJoinUrl?: string;
  resumeUrl?: string | null;
  reminderScheduled: boolean;
  createdAt: string;
  status: BookingStatus;
};
export type BookingStatus =
  | "ghosted"
  | "followup"
  | "converted"
  | "scheduled"
  | "cancelled";
export type BookingStats = {
  total: number;
  scheduled: number;
  cancelled: number;
  upcoming: number;
  thisMonth: number;
};
export type AdminBookingsData = {
  bookings: AdminBooking[];
  stats: BookingStats;
};
export type Availability = {
  date: string;
  slots: { value: string; label: string; startAt: string; endAt: string }[];
}[];

async function request(path: string, init?: RequestInit) {
  const session = await auth();
  const token = (session as (typeof session & { accessToken?: string }) | null)
    ?.accessToken;
  if (!token) return { ok: false as const, error: "Please sign in again." };
  try {
    const response = await fetch(getApiUrl(path), {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
      cache: "no-store",
    });
    if (!response.ok) {
      let detail = "Booking service request failed.";
      try {
        const body = (await response.json()) as { message?: string | string[] };
        if (body.message)
          detail = Array.isArray(body.message)
            ? body.message.join(" ")
            : body.message;
      } catch {
        // Keep the status-based fallback when the API does not return JSON.
      }
      return {
        ok: false as const,
        error:
          response.status === 403
            ? "You do not have permission to manage bookings."
            : detail,
      };
    }
    return { ok: true as const, data: await response.json() };
  } catch {
    return {
      ok: false as const,
      error: "The booking service is temporarily unavailable.",
    };
  }
}

export async function getAdminBookings() {
  return request("/bookings/admin") as Promise<
    { ok: true; data: AdminBookingsData } | { ok: false; error: string }
  >;
}
export async function getBookingAvailability(timezone?: string) {
  const result = await request(
    `/bookings/availability${timezone ? `?timezone=${encodeURIComponent(timezone)}` : ""}`,
  );
  return result.ok
    ? {
        ok: true as const,
        data: result.data as { days: Availability; timezone: string },
      }
    : result;
}
export async function cancelBooking(id: string) {
  return request(`/bookings/admin/${id}`, { method: "DELETE" });
}
export async function rescheduleBooking(
  id: string,
  payload: { slotDate: string; slotValue: string; timezone?: string },
) {
  return request(`/bookings/admin/${id}/reschedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateMeetingSummary(id: string, meetingSummary: string) {
  return request(`/bookings/admin/${id}/summary`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meetingSummary }),
  });
}

export async function deleteMeetingSummary(id: string) {
  return request(`/bookings/admin/${id}/summary`, { method: "DELETE" });
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  return request(`/bookings/admin/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
