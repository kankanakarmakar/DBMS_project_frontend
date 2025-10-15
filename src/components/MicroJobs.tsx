"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import axios, { CancelTokenSource } from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget?: string;
  duration?: string;
  location?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | string;
  source?: string; // 'internal' or 'LinkedIn' etc
  url?: string; // external apply link
}

interface MicroJobsProps {
  userSkills: string[]; // controlled from parent (reactive)
}

export const MicroJobs = ({ userSkills }: MicroJobsProps) => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [externalEnabled, setExternalEnabled] = useState(true); // toggle external fetch
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Record<string, boolean>>({});
  const cancelRef = useRef<CancelTokenSource | null>(null);

  // SSE refs/state
  const sseRef = useRef<EventSource | null>(null);
  const [streamQuery, setStreamQuery] = useState<string | null>(null);

  // debounce userSkills changes (avoid spamming backend)
  const [debouncedSkills, setDebouncedSkills] = useState<string[]>(userSkills || []);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSkills(userSkills || []), 350);
    return () => clearTimeout(t);
  }, [userSkills]);

  // build skills param string
  const skillsParam = useMemo(() => debouncedSkills.join(","), [debouncedSkills]);

  // helper for badge color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-success text-success-foreground";
      case "Intermediate":
        return "bg-warning text-warning-foreground";
      case "Advanced":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Fetch function (supports pagination). We treat `page` as a simple "offset" multiplier (server returns limited results)
  const fetchJobs = async (opts?: { reset?: boolean }) => {
    // cancel previous request
    if (cancelRef.current) {
      cancelRef.current.cancel("Operation canceled due to new request.");
    }
    const cancelToken = axios.CancelToken.source();
    cancelRef.current = cancelToken;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get("http://localhost:5000/api/micro-jobs", {
        params: {
          skills: skillsParam,
          external: externalEnabled ? "1" : "0",
          page: opts?.reset ? 1 : page,
          limit: 6,
        },
        timeout: 20000,
        cancelToken: cancelToken.token,
      });

      const fetched: Job[] = Array.isArray(res.data) ? res.data : res.data.jobs || [];

      if (opts?.reset) {
        setJobs(fetched);
        setPage(1);
      } else {
        setJobs((prev) => {
          const map = new Map(prev.map((j) => [j.id, j]));
          for (const j of fetched) {
            if (!map.has(j.id)) map.set(j.id, j);
          }
          return Array.from(map.values());
        });
      }

      setHasMore(fetched.length >= 6);

    } catch (err: any) {
      if (!axios.isCancel(err)) {
        console.error("Failed to fetch micro-jobs:", err);
        setError("Failed to fetch micro-jobs. Make sure backend is running.");
        setJobs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // fetch whenever debounced skills or external toggle changes (reset list)
  useEffect(() => {
    setPage(1);
    fetchJobs({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsParam, externalEnabled]);

  // SSE subscription: merges incoming LinkedIn jobs into state
  useEffect(() => {
    const q = skillsParam || debouncedSkills.join(",") || null;
    if (!externalEnabled || !q) {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      setStreamQuery(null);
      return;
    }

    if (streamQuery === q && sseRef.current) return;

    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    const encoded = encodeURIComponent(q);
    // interval 30s; adjust to your SerpApi limits and plan
    const url = `http://localhost:5000/api/linkedin-stream?q=${encoded}&interval=30&limit=12`;

    const es = new EventSource(url);
    sseRef.current = es;
    setStreamQuery(q);

    es.addEventListener("jobs", (ev: MessageEvent) => {
      try {
        const payload = JSON.parse((ev as any).data);
        const incoming: any[] = payload.new || [];
        if (incoming.length === 0) return;

        setJobs((prev) => {
          const map = new Map(prev.map((j) => [j.id, j]));
          for (const job of incoming) {
            const normalized: Job = {
              id: job.id,
              title: job.title || job.position_title || "LinkedIn job",
              description: job.description || job.snippet || "",
              skills: job.skills || [],
              budget: job.budget || "",
              duration: job.duration || "",
              location: job.location || job.location_text || "",
              difficulty: "Intermediate",
              source: job.source || "LinkedIn",
              url: job.url || job.job_link || job.link || ""
            };
            map.set(normalized.id, normalized);
          }
          return Array.from(map.values());
        });
      } catch (e) {
        console.error("SSE parse error", e);
      }
    });

    es.addEventListener("error", (ev) => {
      console.warn("SSE error", ev);
    });

    return () => {
      if (es) {
        es.close();
        sseRef.current = null;
        setStreamQuery(null);
      }
    };
  }, [externalEnabled, skillsParam, debouncedSkills]);

  const loadMore = async () => {
    setPage((p) => p + 1);
    await fetchJobs();
  };

  const applyJob = async (job: Job) => {
    try {
      if (job.url) {
        window.open(job.url, "_blank", "noopener,noreferrer");
        return;
      }

      const payload = {
        jobId: job.id,
        userName: "Demo User",
        message: `Hi, I'd like to apply for "${job.title}".`
      };

      setAppliedJobIds((prev) => ({ ...prev, [job.id]: true }));

      const res = await axios.post("https://dbms-project-1-beq4.onrender.com/api/apply-job", payload, { timeout: 10000 });
      if (res.data && res.data.success) {
        alert(res.data.message || "Application submitted!");
      } else {
        setAppliedJobIds((prev) => {
          const copy = { ...prev };
          delete copy[job.id];
          return copy;
        });
        alert("Application failed. Please try again.");
      }
    } catch (err) {
      console.error("Apply error:", err);
      setAppliedJobIds((prev) => {
        const copy = { ...prev };
        delete copy[job.id];
        return copy;
      });
      alert("Failed to apply. Try again later.");
    }
  };

  const trimmedUserSkills = useMemo(() => userSkills.map((s) => s.toLowerCase()), [userSkills]);

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Micro-Jobs to Practice Your Skills
        </CardTitle>
        <CardDescription>
          Short-term gigs matched to your skill level - build experience and earn
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={externalEnabled}
              onChange={(e) => setExternalEnabled(e.target.checked)}
              className="accent-primary"
            />
            <span>Include real LinkedIn results</span>
          </label>

          <div style={{ marginLeft: "auto" }}>
            <small className="text-xs text-muted-foreground">
              Showing <strong>{jobs.length}</strong> jobs
            </small>
          </div>
        </div>

        {loading && <p className="py-6 text-center text-muted-foreground">Loading jobs…</p>}
        {error && (
          <div className="py-4 text-center">
            <p className="text-destructive mb-2">{error}</p>
            <div className="flex justify-center">
              <Button onClick={() => fetchJobs({ reset: true })}>Retry</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const matched = (job.skills || []).filter((s) =>
              trimmedUserSkills.includes(s.toLowerCase())
            );
            return (
              <div
                key={job.id}
                className="p-5 rounded-lg border border-border bg-card hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-base">{job.title}</h4>
                      <Badge className={getDifficultyColor(job.difficulty)}>
                        {job.difficulty ?? (job.source === "LinkedIn" ? "Intermediate" : "Beginner")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(job.skills || []).length === 0 && <Badge variant="outline" className="text-xs">No tags</Badge>}
                    {(job.skills || []).map((skill) => {
                      const isMatch = trimmedUserSkills.includes(skill.toLowerCase());
                      return (
                        <Badge
                          key={skill}
                          variant={isMatch ? "default" : "outline"}
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{job.budget || (job.source === "LinkedIn" ? "TBD" : "")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{job.duration || ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{job.location || (job.source === "LinkedIn" ? "Remote/Varies" : "")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {job.url ? (
                      <Button asChild className="flex-1" size="sm">
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          View on {job.source ?? "External"}
                        </a>
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => applyJob(job)}
                        disabled={!!appliedJobIds[job.id]}
                      >
                        {appliedJobIds[job.id] ? "Applied ✓" : "Apply Now"}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      onClick={() => {
                        try {
                          navigate(`/job/${encodeURIComponent(job.id)}`);
                        } catch (e) {
                          window.open(`/job/${encodeURIComponent(job.id)}`, "_blank");
                        }
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          {!loading && hasMore && (
            <Button onClick={loadMore}>Load more</Button>
          )}
        </div>

        {!loading && jobs.length === 0 && !error && (
          <p className="text-center text-muted-foreground py-6">No jobs matched your skills yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
