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
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

// ── Per-day row component ─────────────────────────────────────────────────────

function DaySlotRow({
  iso,
  label,
  allSlots,
  globalSlots,
  dayOverrides,
  onOverrideChange,
  onReset,
}: {
  iso: number;
  label: string;
  allSlots: BookingSettingsData["allSlotDefinitions"];
  globalSlots: string[];
  dayOverrides: Record<string, string[]> | null;
  onOverrideChange: (iso: number, slots: string[]) => void;
  onReset: (iso: number) => void;
}) {
  const key = String(iso);
  const hasOverride = dayOverrides !== null && key in dayOverrides;
  const activeSlots = hasOverride ? dayOverrides![key] : globalSlots;
  const [expanded, setExpanded] = useState(false);

  const toggleSlot = (value: string) => {
    const current = hasOverride ? dayOverrides![key] : [...globalSlots];
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    onOverrideChange(iso, next);
  };

  return (
    <div
      className={[
        "rounded-xl border transition-all duration-200",
        hasOverride
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-background",
      ].join(" ")}
    >
      {/* Day header row */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 rounded-xl transition-colors"
      >
        <span className="w-24 text-sm font-semibold shrink-0">{label}</span>

        {/* Active slots preview */}
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {activeSlots.length === 0 ? (
            <span className="text-xs text-destructive italic">No slots — day won&apos;t appear</span>
          ) : (
            activeSlots.map((v) => {
              const def = allSlots.find((s) => s.value === v);
              return (
                <span
                  key={v}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary"
                >
                  {def?.label ?? v}
                </span>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasOverride ? (
            <Badge variant="default" className="text-[10px] px-1.5 py-0.5 h-auto">
              Custom
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-auto">
              Global default
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded slot toggles */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {allSlots.map((slot) => {
              const active = activeSlots.includes(slot.value);
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

          {hasOverride && (
            <button
              type="button"
              onClick={() => onReset(iso)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to global default
            </button>
          )}

          {!hasOverride && (
            <p className="text-xs text-muted-foreground">
              Editing any slot here will create a custom override for {label} only.
            </p>
          )}
        </div>
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
  const [dayOverrides, setDayOverrides] = useState<Record<string, string[]> | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [availabilityDays, setAvailabilityDays] = useState(30);
  const [minimumLeadHours, setMinimumLeadHours] = useState(2);
  const [blockUntil, setBlockUntil] = useState<string>("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingSettings();
      setSettings(data);
      setEnabledSlots(data.enabledSlots);
      setEnabledWeekdays(data.enabledWeekdays.map(Number));
      setDayOverrides(data.dayOverrides ?? null);
      setDurationMinutes(data.durationMinutes);
      setAvailabilityDays(data.availabilityDays);
      setMinimumLeadHours(data.minimumLeadHours);
      setBlockUntil(
        data.bookingUnavailableUntil
          ? data.bookingUnavailableUntil.slice(0, 16)
          : ""
      );
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
    setEnabledSlots((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const toggleWeekday = (iso: number) => {
    setEnabledWeekdays((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]
    );
  };

  /** Set a per-day override for the given weekday. */
  const handleDayOverrideChange = (iso: number, slots: string[]) => {
    setDayOverrides((prev) => ({
      ...(prev ?? {}),
      [String(iso)]: slots,
    }));
  };

  /** Remove the per-day override for the given weekday (revert to global). */
  const handleDayReset = (iso: number) => {
    setDayOverrides((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      delete next[String(iso)];
      return Object.keys(next).length > 0 ? next : null;
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
          dayOverrides: dayOverrides && Object.keys(dayOverrides).length > 0 ? dayOverrides : null,
          durationMinutes,
          availabilityDays,
          minimumLeadHours,
          bookingUnavailableUntil: blockUntil
            ? new Date(blockUntil).toISOString()
            : null,
        };
        const updated = await updateBookingSettings(payload);
        setSettings(updated);
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
    return (
      <Card className="border border-red-200 bg-red-50/30 shadow-sm">
        <CardContent className="flex items-center gap-3 py-8">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-medium text-red-700 text-sm">Failed to load settings</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadSettings} className="ml-auto">
            Retry
          </Button>
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

  const activeEnabledWeekdays = WEEKDAY_LABELS.filter(({ iso }) =>
    enabledWeekdays.includes(iso)
  );

  const customOverrideDayCount = dayOverrides ? Object.keys(dayOverrides).length : 0;

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
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isPending ? "Saving…" : "Save changes"}
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
            <h3 className="font-medium text-sm">Global Default Time Slots</h3>
            <Badge variant="secondary" className="text-xs ml-auto">
              {enabledSlots.length} / {allSlots.length} enabled
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These slots apply to all working days unless overridden per-day below.
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
              At least one global slot must be selected.
            </p>
          )}
        </section>

        <Separator />

        {/* ── Per-Day Overrides ────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Per-Day Time Overrides</h3>
            {customOverrideDayCount > 0 && (
              <Badge variant="default" className="text-xs ml-auto">
                {customOverrideDayCount} day{customOverrideDayCount !== 1 ? "s" : ""} customised
              </Badge>
            )}
            {customOverrideDayCount === 0 && (
              <Badge variant="secondary" className="text-xs ml-auto">
                All using global
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Click a day to expand it and choose different time slots for that day only.
            Days marked <span className="font-medium text-foreground">Global default</span> inherit
            the slots above.
          </p>

          {activeEnabledWeekdays.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Enable at least one working day above to configure per-day slots.
            </p>
          ) : (
            <div className="space-y-2">
              {activeEnabledWeekdays.map(({ iso, label }) => (
                <DaySlotRow
                  key={iso}
                  iso={iso}
                  label={label}
                  allSlots={allSlots}
                  globalSlots={enabledSlots}
                  dayOverrides={dayOverrides}
                  onOverrideChange={handleDayOverrideChange}
                  onReset={handleDayReset}
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
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
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
              onChange={(e) => setAvailabilityDays(Number(e.target.value))}
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
              onChange={(e) => setMinimumLeadHours(Number(e.target.value))}
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
              onChange={(e) => setBlockUntil(e.target.value)}
              className="h-9 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              No slots are shown before this date/time (UTC).{" "}
              <button
                type="button"
                onClick={() => setBlockUntil("")}
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
