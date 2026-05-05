"use client";

import { useState, useEffect, useCallback } from "react";
import { getSchedules } from "@/app/schedules/actions";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type FormResponse = {
  id: string;
  name: string | null;
  email: string | null;
  address: string | null;
  phoneNumber: string | null;
  specialRequests: string | null;
  referralCode: string | null;
  createdAt: string;
};

export function ScheduleTable() {
  const [schedules, setSchedules] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Card className="border shadow-sm flex flex-col font-inter">
      <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Recent Bookings</h2>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Date Booked</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Special Requests</TableHead>
                <TableHead>Referral Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading schedules...
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No schedules found matching this criteria.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="text-muted-foreground">
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      }).format(new Date(schedule.createdAt))}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {schedule.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{schedule.email || "N/A"}</span>
                        <span className="text-xs text-muted-foreground">{schedule.phoneNumber || "No phone"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={schedule.address || ""}>
                      {schedule.address || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={schedule.specialRequests || ""}>
                      {schedule.specialRequests || "None"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wide">
                        {schedule.referralCode || "NONE"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
