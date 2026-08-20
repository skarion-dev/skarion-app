"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string;
  isActive: boolean;
  referralCode: string;
  roles: Role[];
}

interface RoleManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  accessToken?: string;
  onSuccess: (updatedUser: User) => void;
}

const ROLE_COLORS: Record<string, string> = {
  admin:            "bg-red-100 text-red-700",
  affiliate_user:   "bg-amber-100 text-amber-700",
  candidate:        "bg-violet-100 text-violet-700",
  customer_support: "bg-sky-100 text-sky-700",
  booking_manager:  "bg-emerald-100 text-emerald-700",
  user:             "bg-slate-100 text-slate-600",
};

const ROLE_LABELS: Record<string, string> = {
  admin:            "Admin",
  affiliate_user:   "Affiliate",
  candidate:        "Candidate",
  customer_support: "Customer Support",
  booking_manager:  "Booking Manager",
  user:             "User",
};

export function RoleManagementSheet({
  open,
  onOpenChange,
  user,
  accessToken,
  onSuccess,
}: RoleManagementSheetProps) {
  const [referralCode, setReferralCode] = useState(user?.username || "");
  const [loading, setLoading] = useState<"affiliate" | "candidate" | "support" | "booking" | null>(null);

  const hasRole = (name: string) => user.roles?.some((r) => r.name === name);

  async function callApi(endpoint: string, method: "POST" | "PATCH", body?: object) {
    const res = await fetch(getApiUrl(endpoint), {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
  }

  async function handleAffiliate() {
    if (!referralCode.trim() || referralCode.trim().length < 3) {
      toast.error("Referral code must be at least 3 characters");
      return;
    }
    setLoading("affiliate");
    try {
      const data = await callApi(`/users/${user.id}/affiliate`, "PATCH", { referralCode: referralCode.trim() });
      toast.success(`${user.name} is now an affiliate!`);
      onSuccess(data.user);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleCandidate() {
    setLoading("candidate");
    try {
      const data = await callApi(`/users/${user.id}/assign-candidate`, "POST");
      toast.success(`${user.name} is now a candidate!`);
      onSuccess(data.user);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleSupport() {
    setLoading("support");
    try {
      const data = await callApi(`/users/${user.id}/assign-customer-support`, "POST");
      toast.success(`${user.name} is now on the support team!`);
      onSuccess(data.user);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleBookingManager() {
    setLoading("booking");
    try {
      const data = await callApi(`/users/${user.id}/assign-booking-manager`, "POST");
      toast.success(`${user.name} can now manage booking settings.`);
      onSuccess(data.user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  if (!user) return null;

  const isAffiliate = hasRole("affiliate_user");
  const isCandidate = hasRole("candidate");
  const isSupport = hasRole("customer_support");
  const isBookingManager = hasRole("booking_manager");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm overflow-y-auto">
        <SheetHeader className="pb-5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} />
              <AvatarFallback className="font-semibold">
                {user.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="text-base leading-tight">{user.name}</SheetTitle>
              <SheetDescription className="text-xs mt-0">@{user.username} · {user.email}</SheetDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {user.roles?.length > 0 ? (
              user.roles.map((r) => (
                <span
                  key={r.id}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[r.name] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {ROLE_LABELS[r.name] ?? r.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No roles</span>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-3 px-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Assign Roles
          </p>

          {/* Affiliate */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Affiliate</p>
              {isAffiliate && (
                <span className="text-xs text-amber-600 font-medium">
                  {user.referralCode ? `Code: ${user.referralCode}` : "Assigned"}
                </span>
              )}
            </div>
            {!isAffiliate ? (
              <div className="flex gap-2">
                <Input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Referral code"
                  className="h-8 text-sm uppercase flex-1"
                  maxLength={20}
                />
                <Button
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={handleAffiliate}
                  disabled={loading !== null}
                >
                  {loading === "affiliate" ? "..." : "Assign"}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Already an affiliate.</p>
            )}
          </div>

          {/* Candidate */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Candidate</p>
              {isCandidate && <span className="text-xs text-violet-600 font-medium">Assigned</span>}
            </div>
            {!isCandidate ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-full"
                onClick={handleCandidate}
                disabled={loading !== null}
              >
                {loading === "candidate" ? "Assigning..." : "Assign Candidate Role"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Already a candidate.</p>
            )}
          </div>

          {/* Customer Support */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Customer Support</p>
              {isSupport && <span className="text-xs text-sky-600 font-medium">Assigned</span>}
            </div>
            {!isSupport ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-full"
                onClick={handleSupport}
                disabled={loading !== null}
              >
                {loading === "support" ? "Assigning..." : "Assign Support Role"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Already on support team.</p>
            )}
          </div>

          {/* Booking Manager */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Booking Manager</p>
              {isBookingManager && (
                <span className="text-xs text-emerald-600 font-medium">Assigned</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Can change the time slots shown on skarion.com/book.
            </p>
            {!isBookingManager ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-full"
                onClick={handleBookingManager}
                disabled={loading !== null}
              >
                {loading === "booking" ? "Assigning..." : "Assign Booking Manager"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Already a booking manager.</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
