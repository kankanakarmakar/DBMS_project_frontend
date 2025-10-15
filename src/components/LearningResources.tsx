"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Star, ExternalLink } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  provider: string;
  type: string;
  duration?: string;
  rating?: number;
  skill?: string;
  url: string; // canonical link (youtube watch or coursera link)
  embedUrl?: string | null; // embed url (youtube embed or other embeddable url). backend should set this for YouTube
  thumbnail?: string;
  isFree?: boolean;
}

interface TopicResources {
  topic: string;
  resources: Resource[];
}

interface LearningResourcesProps {
  missingSkills: string[];
}

export const LearningResources = ({ missingSkills }: LearningResourcesProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // helper: flatten and dedupe by id (in case backend returns duplicates across topics)
  const setFlattenedResources = (topicResults: TopicResources[] = []) => {
    const all = topicResults.flatMap((t) => t.resources || []);
    // dedupe by id preserving order
    const map = new Map<string, Resource>();
    for (const r of all) {
      if (!map.has(r.id)) map.set(r.id, r);
    }
    setResources(Array.from(map.values()));
  };

  useEffect(() => {
    // fetch only when there are missing skills
    async function fetchResources() {
      if (!missingSkills || missingSkills.length === 0) {
        setResources([]);
        return;
      }

      setLoading(true);
      setError(null);
      setActiveEmbed(null);

      try {
        const resp = await axios.post("http://localhost:5000/api/resources", {
          topics: missingSkills,
        }, { timeout: 20000 });
        // backend expected to return { results: [{ topic, resources: [...] }, ...] }
        const results: TopicResources[] = resp.data?.results || [];
        setFlattenedResources(results);
      } catch (err: any) {
        console.error("Failed to fetch resources:", err);
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch learning resources"
        );
        setResources([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
    // re-run when missingSkills changes
  }, [missingSkills]);

  // small helper to detect youtube embed if backend didn't provide embedUrl
  const getEmbedUrlIfYouTube = (res: Resource) => {
    if (res.embedUrl) return res.embedUrl;
    try {
      const u = new URL(res.url);
      if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
        // handle youtu.be short link
        if (u.hostname.includes("youtu.be")) {
          const id = u.pathname.slice(1);
          return `https://www.youtube.com/embed/${id}`;
        }
        // normal youtube watch?v=VIDEO_ID
        const vid = u.searchParams.get("v");
        if (vid) return `https://www.youtube.com/embed/${vid}`;
        // playlist
        const list = u.searchParams.get("list");
        if (list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
      }
    } catch (e) {
      /* ignore invalid URL */
    }
    return null;
  };

  // derived resources with embedUrl fallback
  const normalizedResources = useMemo(() => {
    return resources.map((r) => ({
      ...r,
      embedUrl: r.embedUrl ?? getEmbedUrlIfYouTube(r),
    }));
  }, [resources]);

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Recommended Learning Resources
        </CardTitle>
        <CardDescription>
          Interactive, real courses and tutorials based on your skill gaps
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading && (
          <p className="text-center text-muted-foreground py-6">
            ⏳ Fetching real resources from YouTube & Coursera...
          </p>
        )}

        {error && (
          <p className="text-center text-destructive py-4">
            ⚠️ {error}. Make sure your backend is running and YT API key is set.
          </p>
        )}

        {!loading && normalizedResources.length === 0 && !error && (
          <p className="text-center text-muted-foreground py-6">
            🎯 No matching learning resources found for your skills.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {normalizedResources.map((resource) => (
            <div
              key={resource.id}
              className="p-5 rounded-lg border border-border bg-gradient-card hover:shadow-md transition-all flex flex-col"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <h4 className="font-semibold text-base line-clamp-2">
                      {resource.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resource.provider}
                    </p>
                  </div>
                  {resource.isFree && (
                    <Badge
                      variant="secondary"
                      className="bg-success text-success-foreground"
                    >
                      Free
                    </Badge>
                  )}
                </div>

                {/* thumbnail */}
                {resource.thumbnail && (
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-36 object-cover rounded-md"
                  />
                )}

                <div className="flex flex-wrap gap-2">
                  {resource.skill && (
                    <Badge variant="outline" className="text-xs">
                      {resource.skill}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {resource.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {resource.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{resource.duration}</span>
                    </div>
                  )}
                  {typeof resource.rating === "number" && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span>{resource.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* action area */}
              <div className="mt-4">
                {resource.embedUrl?.includes("youtube.com/embed") ? (
                  <>
                    {activeEmbed === resource.id ? (
                      <div className="aspect-video">
                        <iframe
                          src={resource.embedUrl}
                          title={resource.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveEmbed(resource.id)}
                      >
                        Watch Now
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Button asChild className="w-full" variant="outline" size="sm">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        /* optional: analytics event */
                      }}
                    >
                      Start Learning
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
