"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { toast } from "sonner";
import {
  Save,
  Clock3,
  CalendarDays,
  AlertCircle,
  RefreshCw,
  Settings2,
  Trash2,
  PlusCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getBookingSettings,
  updateBookingSettings,
  type BookingSettingsData,
} from "@/app/booking-settings/actions";

const WEEKDAY_LABELS: { iso: number; label: string; short: string }[] = [
  { iso: 1, label: "Monday", short: "Mon" },
  { iso: 2, label: "Tuesday", short: "Tue" },
  { iso: 3, label: "Wednesday", short: "Wed" },
  { iso: 4, label: "Thursday", short: "Thu" },
  { iso: 5, label: "Friday", short: "Fri" },
  { iso: 6, label: "Saturday", short: "Sat" },
  { iso: 7, label: "Sunday", short: "Sun" },
];

/** Format a YYYY-MM-DD string to a readable label, e.g. "Aug 20, 2026 (Wed)" */
function formatDateLabel(dateStr: string): string {
  try {
    // Parse as local date to avoid UTC offset shifts
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      weekday: "short",
    }).format(dt);
  } catch {
    return dateStr;
  }
}

/** Today's date in YYYY-MM-DD (local timezone) */
function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Date Override Row ─────────────────────────────────────────────────────────

function DateOverrideRow({
  dateStr,
  slots,
  allSlots,
  onSlotsChange,
  onRemove,
}: {
  dateStr: string;
  slots: string[];
  allSlots: BookingSettingsData["allSlotDefinitions"];
  onSlotsChange: (slots: string[]) => void;
  onRemove: () => void;
}) {
  const toggle = (value: string) => {
    const next = slots.includes(value)
      ? slots.filter((s) => s !== value)
      : [...slots, value];
    onSlotsChange(next);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      {/* Date header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-sm">{formatDateLabel(dateStr)}</span>
          {slots.length === 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-auto">
              No slots — date hidden
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          title="Remove override — revert to global slots"
          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Slot toggles */}
      <div className="flex flex-wrap gap-2">
        {allSlots.map((slot) => {
          const active = slots.includes(slot.value);
          return (
            <button
              key={slot.value}
              type="button"
              onClick={() => toggle(slot.value)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 select-none",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
              ].join(" ")}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      {slots.length === 0 && (
        <p className="text-xs text-destructive">
          No slots selected — this date will not appear in the booking calendar.
        </p>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function BookingSettingsPanel() {
  const [settings, setSettings] = useState<BookingSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Editable state
  const [enabledSlots, setEnabledSlots] = useState<string[]>([]);
  const [enabledWeekdays, setEnabledWeekdays] = useState<number[]>([]);
  const [dateOverrides, setDateOverrides] = useState<Record<string, string[]>>({});
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [availabilityDays, setAvailabilityDays] = useState(30);
  const [minimumLeadHours, setMinimumLeadHours] = useState(2);
  const [blockUntil, setBlockUntil] = useState<string>("");

  // New override form
  const [newDate, setNewDate] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBookingSettings();
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      const data = result.data;
      setSettings(data);
      setEnabledSlots(data.enabledSlots);
      setEnabledWeekdays(data.enabledWeekdays.map(Number));
      setDateOverrides(data.dateOverrides ?? {});
      setDurationMinutes(data.durationMinutes);
      setAvailabilityDays(data.availabilityDays);
      setMinimumLeadHours(data.minimumLeadHours);
      setBlockUntil(
        data.bookingUnavailableUntil
          ? data.bookingUnavailableUntil.slice(0, 16)
          : ""
      );
      setHasUnsavedChanges(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load settings";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleSlot = (value: string) => {
    setHasUnsavedChanges(true);
    setEnabledSlots((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const toggleWeekday = (iso: number) => {
    setHasUnsavedChanges(true);
    setEnabledWeekdays((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]
    );
  };

  const addDateOverride = () => {
    if (!newDate) {
      toast.error("Please pick a date first.");
      return;
    }
    if (newDate in dateOverrides) {
      toast.info(`${formatDateLabel(newDate)} already has an override.`);
      return;
    }
    // Seed with the current global enabled slots so the user starts from a
    // sensible default rather than an empty selection.
    setDateOverrides((prev) => ({
      ...prev,
      [newDate]: [...enabledSlots],
    }));
    setHasUnsavedChanges(true);
    setNewDate("");
  };

  const updateDateOverrideSlots = (dateStr: string, slots: string[]) => {
    setHasUnsavedChanges(true);
    setDateOverrides((prev) => ({ ...prev, [dateStr]: slots }));
  };

  const removeDateOverride = (dateStr: string) => {
    setHasUnsavedChanges(true);
    setDateOverrides((prev) => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
  };

  const handleSave = () => {
    if (enabledSlots.length === 0) {
      toast.error("At least one global time slot must be enabled.");
      return;
    }
    if (enabledWeekdays.length === 0) {
      toast.error("At least one weekday must be enabled.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          enabledSlots,
          enabledWeekdays,
          dateOverrides: Object.keys(dateOverrides).length > 0 ? dateOverrides : null,
          durationMinutes,
          availabilityDays,
          minimumLeadHours,
          bookingUnavailableUntil: blockUntil
            ? new Date(blockUntil).toISOString()
            : null,
        };
        const result = await updateBookingSettings(payload);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        const updated = result.data;
        setSettings(updated);
        setDateOverrides(updated.dateOverrides ?? {});
        setHasUnsavedChanges(false);
        toast.success("Booking settings saved successfully.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to save settings";
        toast.error(msg);
      }
    });
  };

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="flex items-center justify-center py-16">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground text-sm">Loading booking settings…</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const sessionExpired =
      error.includes("session has expired") || error.includes("sign in again");

    return (
      <Card className="border border-red-200 bg-red-50/30 shadow-sm">
        <CardContent className="flex items-center gap-3 py-8">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-medium text-red-700 text-sm">Failed to load settings</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <div className="ml-auto flex gap-2">
            {!sessionExpired && (
              <Button variant="outline" size="sm" onClick={loadSettings}>
                Retry
              </Button>
            )}
            {sessionExpired && (
              <Button
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth" })}
              >
                Sign in again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const allSlots = settings?.allSlotDefinitions ?? [];
  const lastUpdated = settings?.updatedAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(settings.updatedAt))
    : null;

  // Sort overridden dates chronologically
  const sortedOverrideDates = Object.keys(dateOverrides).sort();
  const overrideCount = sortedOverrideDates.length;

  return (
    <Card className="border shadow-sm">
      {/* Header */}
      <CardHeader className="border-b bg-muted/20 px-5 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Booking Settings</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Control available hours, days, and booking window
                {lastUpdated && ` · Last saved ${lastUpdated}`}
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || !hasUnsavedChanges}
            className="gap-1.5"
          >
            {isPending ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isPending
              ? "Saving…"
              : hasUnsavedChanges
                ? "Save changes"
                : "Saved"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">

        {/* ── Working Days ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Working Days</h3>
            <Badge variant="secondary" className="text-xs ml-auto">
              {enabledWeekdays.length} / 7 enabled
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map(({ iso, label, short }) => {
              const active = enabledWeekdays.includes(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  title={label}
                  onClick={() => toggleWeekday(iso)}
                  className={[
                    "w-12 h-10 rounded-lg text-xs font-semibold border transition-all duration-150 select-none",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {short}
                </button>
              );
            })}
          </div>
          {enabledWeekdays.length === 0 && (
            <p className="text-xs text-red-500 mt-2">
              At least one day must be selected.
            </p>
          )}
        </section>

        <Separator />

        {/* ── Global Default Slots ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Default Time Slots</h3>
            <Badge variant="secondary" className="text-xs ml-auto">
              {enabledSlots.length} / {allSlots.length} enabled
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These slots appear on every available date unless you override a specific date below.
          </p>
          <div className="flex flex-wrap gap-2">
            {allSlots.map((slot) => {
              const active = enabledSlots.includes(slot.value);
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => toggleSlot(slot.value)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 select-none",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
          {enabledSlots.length === 0 && (
            <p className="text-xs text-red-500 mt-2">
              At least one slot must be selected.
            </p>
          )}
        </section>

        <Separator />

        {/* ── Date-Specific Overrides ──────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Date-Specific Time Overrides</h3>
            {overrideCount > 0 && (
              <Badge variant="default" className="text-xs ml-auto">
                {overrideCount} date{overrideCount !== 1 ? "s" : ""} overridden
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Override the time slots for a <strong>specific date</strong> in the booking calendar.
            Use this to offer different hours on a particular day — or set it to no slots
            to block that date entirely. Dates without an override use the default slots above.
          </p>

          {/* Add new override */}
          <div className="flex gap-2 items-end flex-wrap">
            <div className="space-y-1">
              <Label htmlFor="new-date-override" className="text-xs font-medium">
                Pick a date to override
              </Label>
              <Input
                id="new-date-override"
                type="date"
                value={newDate}
                min={todayLocal()}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-9 text-sm w-48"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDateOverride}
              className="gap-1.5 h-9"
            >
              <PlusCircle className="h-4 w-4" />
              Add override
            </Button>
          </div>

          {/* Existing overrides */}
          {sortedOverrideDates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No date overrides yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pick a date above to customise its available slots.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedOverrideDates.map((dateStr) => (
                <DateOverrideRow
                  key={dateStr}
                  dateStr={dateStr}
                  slots={dateOverrides[dateStr]}
                  allSlots={allSlots}
                  onSlotsChange={(slots) => updateDateOverrideSlots(dateStr, slots)}
                  onRemove={() => removeDateOverride(dateStr)}
                />
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* ── Numeric Controls ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bs-duration" className="text-xs font-medium">
              Slot Duration (minutes)
            </Label>
            <Input
              id="bs-duration"
              type="number"
              min={15}
              max={240}
              step={15}
              value={durationMinutes}
              onChange={(e) => {
                setDurationMinutes(Number(e.target.value));
                setHasUnsavedChanges(true);
              }}
              className="h-9 text-sm"
            />
            <p className="text-xs text-muted-foreground">15–240 min</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bs-avail-days" className="text-xs font-medium">
              Availability Window (days)
            </Label>
            <Input
              id="bs-avail-days"
              type="number"
              min={1}
              max={365}
              value={availabilityDays}
              onChange={(e) => {
                setAvailabilityDays(Number(e.target.value));
                setHasUnsavedChanges(true);
              }}
              className="h-9 text-sm"
            />
            <p className="text-xs text-muted-foreground">Days ahead to show</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bs-lead-hours" className="text-xs font-medium">
              Min Lead Time (hours)
            </Label>
            <Input
              id="bs-lead-hours"
              type="number"
              min={0}
              max={168}
              value={minimumLeadHours}
              onChange={(e) => {
                setMinimumLeadHours(Number(e.target.value));
                setHasUnsavedChanges(true);
              }}
              className="h-9 text-sm"
            />
            <p className="text-xs text-muted-foreground">Hours before slot is visible</p>
          </div>
        </section>

        <Separator />

        {/* ── Block Until ────────────────────────────────────────────── */}
        <section>
          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="bs-block-until" className="text-xs font-medium">
              Block All Slots Until
            </Label>
            <Input
              id="bs-block-until"
              type="datetime-local"
              value={blockUntil}
              onChange={(e) => {
                setBlockUntil(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="h-9 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              No slots are shown before this date/time (UTC).{" "}
              <button
                type="button"
                onClick={() => {
                  setBlockUntil("");
                  setHasUnsavedChanges(true);
                }}
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                Clear
              </button>
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
