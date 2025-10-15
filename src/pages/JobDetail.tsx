// src/pages/JobDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Clock, MapPin } from "lucide-react";

type Job = {
  id: string;
  title: string;
  description?: string;
  company?: string;       // optional, returned from external API
  skills?: string[];
  budget?: string;
  duration?: string;
  location?: string;
  difficulty?: string;
  source?: string;
  url?: string; // external LinkedIn link (if available)
};

const buildLinkedInFallback = (job: Job) => {
  // Use job.title, company, location to craft a LinkedIn jobs search fallback
  const parts: string[] = [];
  if (job.title) parts.push(job.title);
  if (job.company) parts.push(job.company);
  // join and remove extra whitespace
  const keywords = encodeURIComponent(parts.join(" ").trim() || "jobs");
  const locationParam = job.location ? `&location=${encodeURIComponent(job.location)}` : "";
  // LinkedIn jobs search url
  return `https://www.linkedin.com/jobs/search/?keywords=${keywords}${locationParam}`;
};

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid job id");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchJob = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get<Job>(`http://localhost:5000/api/micro-job/${encodeURIComponent(id)}`, {
          timeout: 15000,
        });

        if (!cancelled) {
          // normalize shape: some external results might include company or location fields
          const payload = res.data || {};
          setJob({
            id: payload.id,
            title: payload.title,
            description: payload.description || payload.snippet || "",
            company: (payload.company || payload.publisher || "") as string | undefined,
            skills: payload.skills || [],
            budget: payload.budget,
            duration: payload.duration,
            location: payload.location,
            difficulty: payload.difficulty,
            source: payload.source,
            url: payload.url || payload.job_link || payload.link || "",
          });
        }
      } catch (err: any) {
        console.error("Failed to load job:", err);
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setError("Job not found.");
          } else {
            setError("Unable to fetch job details. Please ensure the backend is running and reachable at http://localhost:5000.");
          }
          setJob(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => navigate(-1);

  // Open real link: if job.url exists, use it. Otherwise open fallback LinkedIn search.
  const handleOpenLinkedIn = () => {
    if (!job) return;
    const targetUrl = job.url && job.url.trim() ? job.url : buildLinkedInFallback(job);
    // Open in new tab (LinkedIn)
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <Card className="shadow">
        <CardHeader>
          <CardTitle>
            {loading ? "Loading job…" : job ? job.title : "Job details"}
          </CardTitle>
          <CardDescription>
            {job?.source ?? ""}
            {job?.company ? ` • ${job.company}` : ""}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading && <p className="text-muted-foreground">Fetching job details…</p>}

          {error && (
            <div className="py-4 text-destructive">
              <strong>{error}</strong>
            </div>
          )}

          {!loading && job && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {job.description || "No description available."}
                </p>
              </section>

              <section>
                <h4 className="font-medium mb-2">Required Skills</h4>
                <div className="flex gap-2 flex-wrap">
                  {(job.skills && job.skills.length > 0) ? (
                    job.skills.map((s) => (
                      <Badge key={s} className="text-xs">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">No tags</Badge>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.budget || (job.source === "LinkedIn" ? "TBD" : "$ -")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{job.duration || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location || (job.source === "LinkedIn" ? "Remote/Varies" : "Remote")}</span>
                </div>
              </section>

              <div className="pt-4">
                {/* Always allow user to go to LinkedIn. If job.url empty, fallback will search LinkedIn jobs using title/company. */}
                <Button className="w-full" size="lg" onClick={handleOpenLinkedIn}>
                  {job.url && job.url.trim() ? "Apply on LinkedIn" : "Open on LinkedIn (Search)"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetailPage;
