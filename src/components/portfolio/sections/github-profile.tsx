"use client";

import { useEffect, useState } from "react";
import {
  Github,
  Users,
  Star,
  BookMarked,
  FolderGit2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { developer, socials } from "@/lib/portfolio-data";

interface Profile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  totalStars: number;
  company: string | null;
  blog: string | null;
  location: string | null;
  created_at: string;
}

const fallbackProfile: Profile = {
  login: developer.githubUsername,
  name: developer.name,
  avatar_url: "/assets/dev-photo.jpg",
  html_url: socials.github,
  bio: "Full-Stack Developer building production-grade SaaS applications with modern web technologies.",
  followers: 0,
  following: 0,
  public_repos: 0,
  totalStars: 0,
  company: "Freelance",
  blog: developer.website,
  location: developer.location,
  created_at: "2024-01-01T00:00:00Z",
};

export function GithubProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch("/api/github/profile", { cache: "no-store" }),
          fetch("/api/github", { cache: "no-store" }),
        ]);
        let p: Partial<Profile> = {};
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (!profileData.error) {
            p = {
              login: profileData.login,
              name: profileData.name,
              avatar_url: profileData.avatar_url,
              html_url: profileData.html_url,
              bio: profileData.bio,
              followers: profileData.followers,
              following: profileData.following,
              public_repos: profileData.public_repos,
              company: profileData.company,
              blog: profileData.blog,
              location: profileData.location,
              created_at: profileData.created_at,
            };
          }
        }
        let stars = 0;
        if (reposRes.ok) {
          const r = await reposRes.json();
          stars = (r.repos || []).reduce(
            (acc: number, x: any) => acc + (x.stargazers_count || 0),
            0
          );
        }
        if (cancelled) return;
        setProfile({ ...fallbackProfile, ...p, totalStars: stars || fallbackProfile.totalStars });
      } catch {
        if (!cancelled) {
          setProfile(fallbackProfile);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="github" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          emoji="🐙"
          title="GitHub"
          highlight="Profile"
          subtitle="My open-source contributions and development activity, live from GitHub."
        />

        <Reveal className="mt-14 mx-auto max-w-4xl">
          {error && (
            <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-700 dark:text-amber-300">
              GitHub data could not be loaded. Showing fallback information.
            </div>
          )}
          <div className="overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-white to-pink-500/5 shadow-card-hover dark:from-sky-500/5 dark:via-slate-900 dark:to-pink-500/5">
            {/* Top banner */}
            <div className="relative h-28 bg-gradient-to-r from-sky-500 via-pink-500 to-wood">
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="px-6 pb-6 sm:px-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
                {/* avatar */}
                <div className="-mt-14 h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg dark:border-slate-900 dark:bg-slate-900">
                  {loading ? (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                    </div>
                  ) : (
                    <img
                      src={profile?.avatar_url}
                      alt={developer.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-bold">
                      {profile?.name || developer.name}
                    </h3>
                    <a
                      href={socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-sky-500/10 hover:text-sky-600"
                    >
                      @{profile?.login || developer.githubUsername}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    {profile?.bio}
                  </p>
                </div>

                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-shadow hover:shadow-glow-pink"
                >
                  <Github className="h-4 w-4" />
                  Follow
                </a>
              </div>

              {/* Stats grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox
                  icon={<FolderGit2 className="h-5 w-5" />}
                  value={profile?.public_repos ?? 0}
                  label="Repositories"
                />
                <StatBox
                  icon={<Star className="h-5 w-5" />}
                  value={profile?.totalStars ?? 0}
                  label="Total Stars"
                />
                <StatBox
                  icon={<Users className="h-5 w-5" />}
                  value={profile?.followers ?? 0}
                  label="Followers"
                />
                <StatBox
                  icon={<BookMarked className="h-5 w-5" />}
                  value={profile?.following ?? 0}
                  label="Following"
                />
              </div>

              {/* Meta info */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {profile?.location && (
                  <span className="flex items-center gap-1">📍 {profile.location}</span>
                )}
                {profile?.company && (
                  <span className="flex items-center gap-1">🏢 {profile.company}</span>
                )}
                {profile?.blog && (
                  <a
                    href={
                      profile.blog.startsWith("http")
                        ? profile.blog
                        : `https://${profile.blog}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-sky-600"
                  >
                    🔗 {profile.blog}
                  </a>
                )}
                {profile?.created_at && (
                  <span className="flex items-center gap-1">
                    🗓️ Joined GitHub{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-sky-500/15 bg-card p-4 text-center shadow-soft transition-transform hover:-translate-y-1">
      <div className="mb-1 flex justify-center text-pink-500">{icon}</div>
      <div className="text-2xl font-bold text-gradient-sky-pink">
        {value.toLocaleString()}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
