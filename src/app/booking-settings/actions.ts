"use server";

import { auth } from "@/auth";

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
  /** Per-weekday overrides. Keys are ISO weekday strings "1"–"7". null = use global for all days. */
  dayOverrides: Record<string, string[]> | null;
};

export type UpdateBookingSettingsPayload = Partial<{
  enabledSlots: string[];
  enabledWeekdays: number[];
  durationMinutes: number;
  availabilityDays: number;
  minimumLeadHours: number;
  bookingUnavailableUntil: string | null;
  /** Pass null to clear all per-day overrides. */
  dayOverrides: Record<string, string[]> | null;
}>;
async function getAuthToken(): Promise<string> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return (session as any).accessToken as string;
}

export async function getBookingSettings(): Promise<BookingSettingsData> {
  const token = await getAuthToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/bookings/admin/settings`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as any).message || "Failed to fetch booking settings"
    );
  }

  return res.json();
}

export async function updateBookingSettings(
  payload: UpdateBookingSettingsPayload
): Promise<BookingSettingsData> {
  const token = await getAuthToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/bookings/admin/settings`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as any).message || "Failed to update booking settings"
    );
  }

  return res.json();
}
