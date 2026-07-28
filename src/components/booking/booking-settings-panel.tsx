"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Save, Clock3, CalendarDays, AlertCircle, RefreshCw, Settings2 } from "lucide-react";
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

export function BookingSettingsPanel() {
  const [settings, setSettings] = useState<BookingSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Editable state
  const [enabledSlots, setEnabledSlots] = useState<string[]>([]);
  const [enabledWeekdays, setEnabledWeekdays] = useState<number[]>([]);
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
      setDurationMinutes(data.durationMinutes);
      setAvailabilityDays(data.availabilityDays);
      setMinimumLeadHours(data.minimumLeadHours);
      // Convert ISO string to datetime-local format
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

  const handleSave = () => {
    if (enabledSlots.length === 0) {
      toast.error("At least one time slot must be enabled.");
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
        {/* ── Time Slots ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Available Time Slots</h3>
            <Badge variant="secondary" className="text-xs ml-auto">
              {enabledSlots.length} / {allSlots.length} enabled
            </Badge>
          </div>
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
