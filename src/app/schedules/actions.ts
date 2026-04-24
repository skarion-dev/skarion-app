"use server";

import { auth } from "@/auth";

export async function getSchedules(referralCode?: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const token = (session as any).accessToken;
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/forms`);
  
  if (referralCode) {
    url.searchParams.append("referralCode", referralCode);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // Adding no-cache so the form responses are always up to date
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch schedules");
  }

  return res.json();
}
