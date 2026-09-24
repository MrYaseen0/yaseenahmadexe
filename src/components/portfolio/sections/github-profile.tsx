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
  MapPin,
  Building2,
  Link2,
  CalendarDays,
} from "lucide-react";
import { SectionHeading } from "../section-heading";
import { Reveal } from "../reveal";
import { Editable, useContent } from "@/components/portfolio/content-editor";

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

interface RepoStars {
  stargazers_count?: number;
}

export function GithubProfile() {
  const { t } = useContent();
  const fallbackProfile: Profile = {
    login: t("brand.githubUsername"),
    name: t("brand.name"),
    avatar_url: t("brand.avatar"),
    html_url: t("socials.github"),
    bio: t("github.fallbackBio"),
    followers: 0,
    following: 0,
    public_repos: 0,
    totalStars: 0,
    company: t("github.fallbackCompany"),
    blog: t("brand.website"),
    location: t("brand.location"),
    created_at: "2024-01-01T00:00:00Z",
  };

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
            (acc: number, x: RepoStars) => acc + (x.stargazers_count || 0),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="github" className="border-t border-[var(--hairline)] bg-[#F4F5F1] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading ek="github" />

        <Reveal className="mx-auto mt-14 max-w-4xl">
          {error && (
            <p className="mb-4 text-center text-sm text-[var(--muted)]">
              <Editable id="github.loadError" />
            </p>
          )}
          <div className="rounded-xl border border-[var(--hairline)] bg-white p-6 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(16,20,16,0.06)] sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* avatar */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[var(--hairline)] bg-[#F4F5F1]">
                {loading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#101410]" />
                  </div>
                ) : (
                  // Plain <img>: next/image needs remotePatterns in next.config.ts
                  // for avatars.githubusercontent.com, which is out of scope here.
                  <img
                    src={profile?.avatar_url}
                    alt={t("brand.name")}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-[#101410]">
                    {profile?.name || t("brand.name")}
                  </h3>
                  <a
                    href={t("socials.github")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--hairline)] px-2.5 py-0.5 font-mono text-xs text-[var(--muted)] transition-colors hover:border-[#101410] hover:text-[#101410]"
                  >
                    @{profile?.login || t("brand.githubUsername")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                  {profile?.bio}
                </p>
              </div>

              <a
                href={t("socials.github")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                <Github className="h-4 w-4" />
                <Editable id="github.followBtn" />
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--hairline)] pt-6 sm:grid-cols-4">
              <StatBox
                icon={<FolderGit2 className="h-4 w-4" />}
                value={profile?.public_repos ?? 0}
                label={t("github.statRepos")}
              />
              <StatBox
                icon={<Star className="h-4 w-4" />}
                value={profile?.totalStars ?? 0}
                label={t("github.statStars")}
              />
              <StatBox
                icon={<Users className="h-4 w-4" />}
                value={profile?.followers ?? 0}
                label={t("github.statFollowers")}
              />
              <StatBox
                icon={<BookMarked className="h-4 w-4" />}
                value={profile?.following ?? 0}
                label={t("github.statFollowing")}
              />
            </div>

            {/* Meta info */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-[var(--muted)]">
              {profile?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {profile.location}
                </span>
              )}
              {profile?.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {profile.company}
                </span>
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
                  className="flex items-center gap-1.5 hover:text-[#101410]"
                >
                  <Link2 className="h-3.5 w-3.5" /> {profile.blog}
                </a>
              )}
              {profile?.created_at && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />{" "}
                  <Editable id="github.joinedWord" />{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              )}
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
    <div className="rounded-xl border border-[var(--hairline)] bg-white p-4 text-center">
      <div className="mb-1 flex justify-center text-[#101410]">{icon}</div>
      <div className="font-mono text-xl font-medium text-[#101410]">
        {value.toLocaleString()}
      </div>
      <div className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
    </div>
  );
}
