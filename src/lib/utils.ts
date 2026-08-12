import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiUrl(path: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NODE_ENV === "production" && !configuredUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const baseUrl = (configuredUrl || "http://localhost:5001").replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
