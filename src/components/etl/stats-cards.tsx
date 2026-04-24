"use client";

import { Users, Briefcase, Star, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { EtlStats } from "@/api-client/services/EtlService";

interface Props {
  stats: EtlStats;
  shortlistedCount: number;
  confirmedCount: number;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: string;
}

function StatCard({ label, value, icon, color, bgColor, trend }: StatCardProps) {
  return (
    <Card className="border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${bgColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ stats, shortlistedCount, confirmedCount }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="Total Candidates"
        value={stats.totalCandidates}
        icon={<Users className="h-5 w-5 text-violet-600" />}
        color="text-violet-700 dark:text-violet-400"
        bgColor="bg-violet-100 dark:bg-violet-900/30"
      />
      <StatCard
        label="Total Applications"
        value={stats.totalApplications}
        icon={<Briefcase className="h-5 w-5 text-sky-600" />}
        color="text-sky-700 dark:text-sky-400"
        bgColor="bg-sky-100 dark:bg-sky-900/30"
      />
      <StatCard
        label="Shortlisted"
        value={shortlistedCount}
        icon={<Star className="h-5 w-5 text-amber-600" />}
        color="text-amber-700 dark:text-amber-400"
        bgColor="bg-amber-100 dark:bg-amber-900/30"
      />
      <StatCard
        label="Confirmed"
        value={confirmedCount}
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        color="text-emerald-700 dark:text-emerald-400"
        bgColor="bg-emerald-100 dark:bg-emerald-900/30"
      />
    </div>
  );
}
