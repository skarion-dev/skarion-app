"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  cancelBooking,
  getAdminBookings,
  getBookingAvailability,
  rescheduleBooking,
  type AdminBooking,
  type AdminBookingsData,
} from "@/app/bookings/actions";

const moneylessStats = [
  ["Total consultations", "total", Users],
  ["Upcoming", "upcoming", CalendarClock],
  ["Scheduled", "scheduled", CheckCircle2],
  ["Cancelled", "cancelled", XCircle],
] as const;

export function BookingDashboard({
  initialData,
}: {
  initialData: AdminBookingsData;
}) {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "scheduled" | "cancelled">(
    "all",
  );
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<
    { value: string; label: string }[]
  >([]);
  const [busy, setBusy] = useState(false);

  const bookings = useMemo(
    () =>
      data.bookings.filter(
        (b) =>
          (filter === "all" || b.status === filter) &&
          `${b.fullName} ${b.email} ${b.slotDate}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [data.bookings, filter, query],
  );

  useEffect(() => {
    if (!rescheduleDate) return;
    getBookingAvailability(selected?.timezone).then((result) => {
      if (result.ok)
        setAvailableSlots(
          result.data.days.find((day) => day.date === rescheduleDate)?.slots ??
            [],
        );
    });
  }, [rescheduleDate, selected?.timezone]);

  async function refresh() {
    const result = await getAdminBookings();
    if (result.ok) setData(result.data);
  }
  async function cancel(id: string) {
    if (!window.confirm("Cancel this consultation call?")) return;
    setBusy(true);
    const result = await cancelBooking(id);
    setBusy(false);
    if (!result.ok) toast.error(result.error);
    else {
      toast.success("Consultation cancelled.");
      await refresh();
    }
  }
  async function reschedule() {
    if (!selected || !rescheduleDate || !rescheduleSlot) return;
    setBusy(true);
    const result = await rescheduleBooking(selected.id, {
      slotDate: rescheduleDate,
      slotValue: rescheduleSlot,
      timezone: selected.timezone,
    });
    setBusy(false);
    if (!result.ok) toast.error(result.error);
    else {
      toast.success("Consultation rescheduled.");
      setSelected(null);
      await refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Consultations</h1>
        <p className="text-sm text-muted-foreground">
          Manage every consultation booked through the Skarion booking link.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {moneylessStats.map(([label, key, Icon]) => (
          <Card key={key} className="shadow-none">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{data.stats[key]}</p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">All bookings</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, date"
                  className="pl-9 sm:w-64"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Consultation time</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-medium">{booking.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.email} · {booking.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        {new Date(booking.slotStartAt).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.timezone}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          booking.status === "scheduled"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.meetingJoinUrl &&
                          booking.status === "scheduled" && (
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={booking.meetingJoinUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Join
                              </a>
                            </Button>
                          )}
                        {booking.status === "scheduled" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelected(booking);
                                setRescheduleDate(booking.slotDate);
                                setRescheduleSlot("");
                              }}
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={busy}
                              onClick={() => cancel(booking.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!bookings.length && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-muted-foreground"
                    >
                      No bookings match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4" />
          {data.stats.thisMonth} bookings created this month
        </CardContent>
      </Card>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reschedule consultation</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selected.fullName} · {selected.timezone}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm font-medium">
                New date
                <Input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="mt-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Available time
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select a time</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <Button disabled={busy || !rescheduleSlot} onClick={reschedule}>
                  Save new time
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
