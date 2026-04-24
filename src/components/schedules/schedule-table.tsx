"use client";

import { useState, useEffect, useCallback } from "react";
import { getSchedules } from "@/app/schedules/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";

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
  const [searchCode, setSearchCode] = useState("");

  const loadData = useCallback(async (code?: string) => {
    setLoading(true);
    try {
      const data = await getSchedules(code);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchCode);
  };

  return (
    <Card className="border shadow-sm flex flex-col font-inter">
      <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h2 className="font-semibold text-lg">Recent Bookings</h2>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by referral code..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full sm:w-64 bg-background"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search
          </Button>
        </form>
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
