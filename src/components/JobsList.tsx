"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import type { CrawlerStatusResponse } from "@/app/jobs/actions";
import { getApiUrl } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  externalId: string;
  postedAt: string;
  location?: string;
  employmentType?: string;
  workplaceType?: string;
  platform?: string;
  sourceUrl?: string;
}

interface JobsListProps {
  groupedJobs: Record<string, Job[]>;
  crawlerStatus?: CrawlerStatusResponse | null;
}

function formatUtcTimestamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export const JobsList: React.FC<JobsListProps> = ({ groupedJobs, crawlerStatus }) => {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [liveGroupedJobs, setLiveGroupedJobs] = useState<Record<string, Job[]>>(groupedJobs);
  const [liveCrawlerStatus, setLiveCrawlerStatus] = useState<CrawlerStatusResponse | null>(
    crawlerStatus ?? null
  );

  useEffect(() => {
    setLiveGroupedJobs(groupedJobs);
  }, [groupedJobs]);

  useEffect(() => {
    setLiveCrawlerStatus(crawlerStatus ?? null);
  }, [crawlerStatus]);

  useEffect(() => {
    const socket: Socket = io(`${getApiUrl("")}jobs`, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: false,
    });

    const onJobUpsert = (incomingJob: Job) => {
      setLiveGroupedJobs((prev) => {
        const company = incomingJob.company;
        const existing = prev[company] ?? [];
        const index = existing.findIndex(
          (job) => job.id === incomingJob.id || job.externalId === incomingJob.externalId
        );

        let updatedCompanyJobs: Job[];
        if (index >= 0) {
          updatedCompanyJobs = [...existing];
          updatedCompanyJobs[index] = { ...updatedCompanyJobs[index], ...incomingJob };
        } else {
          updatedCompanyJobs = [incomingJob, ...existing];
        }

        updatedCompanyJobs.sort((a, b) => {
          const aTs = a.postedAt ? new Date(a.postedAt).getTime() : 0;
          const bTs = b.postedAt ? new Date(b.postedAt).getTime() : 0;
          return bTs - aTs;
        });

        return {
          ...prev,
          [company]: updatedCompanyJobs,
        };
      });
    };

    const onCrawlerStatus = (status: CrawlerStatusResponse) => {
      setLiveCrawlerStatus(status);
    };

    socket.on("job:upsert", onJobUpsert);
    socket.on("crawler:status", onCrawlerStatus);

    return () => {
      socket.off("job:upsert", onJobUpsert);
      socket.off("crawler:status", onCrawlerStatus);
      socket.disconnect();
    };
  }, []);

  const companies = useMemo(() => Object.keys(liveGroupedJobs).sort(), [liveGroupedJobs]);
  const totalJobs = useMemo(
    () => companies.reduce((acc, company) => acc + liveGroupedJobs[company].length, 0),
    [companies, liveGroupedJobs]
  );

  const filteredCompanies = useMemo(() => {
    const q = search.toLowerCase().trim();
    const targetCompanies = companyFilter === "all" ? companies : companies.filter((c) => c === companyFilter);

    return targetCompanies
      .map((company) => {
        const jobs = liveGroupedJobs[company].filter((job) => {
          if (!q) return true;
          return [
            job.title,
            job.location,
            job.employmentType,
            job.workplaceType,
            job.platform,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q);
        });
        return { company, jobs };
      })
      .filter((entry) => entry.jobs.length > 0);
  }, [companies, liveGroupedJobs, companyFilter, search]);

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No latest jobs found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Latest Jobs</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {totalJobs} jobs across {companies.length} companies
            </p>
            <p className="text-xs mt-2">
              Job Radar:
              <span className={liveCrawlerStatus?.isOnline ? "text-green-600 font-medium ml-1" : "text-red-600 font-medium ml-1"}>
                {liveCrawlerStatus?.isOnline ? "Active" : "Inactive"}
              </span>
              {liveCrawlerStatus?.lastHeartbeatAt ? (
                <span className="text-muted-foreground ml-2">
                  Last heartbeat {formatUtcTimestamp(liveCrawlerStatus.lastHeartbeatAt)}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 w-full sm:w-[240px]"
              />
            </div>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[220px]">
                <SelectValue placeholder="All companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCompanies.length === 0 ? (
          <div className="text-sm text-muted-foreground py-10 text-center">
            No jobs match your filters.
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {filteredCompanies.map(({ company, jobs }) => (
              <AccordionItem value={company} key={company}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-medium">{company}</span>
                    <Badge variant="secondary">{jobs.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="max-h-[360px] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead className="hidden lg:table-cell">Posted</TableHead>
                          <TableHead className="text-right">Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="align-top">
                              <div className="font-medium">{job.title}</div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                              {job.postedAt ? formatUtcTimestamp(job.postedAt).split(" ")[0] : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                Open <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
