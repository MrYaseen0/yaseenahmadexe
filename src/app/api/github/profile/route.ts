import { NextResponse } from "next/server";
import { developer } from "@/lib/portfolio-data";

let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${developer.githubUsername}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://api.github.com/users/${developer.githubUsername}/repos?per_page=100&sort=updated`,
        {
          headers,
          next: { revalidate: 3600 },
        }
      ),
    ]);

    if (!userRes.ok) throw new Error(`GitHub user API ${userRes.status}`);

    const user = await userRes.json();
    let totalStars = 0;
    if (reposRes.ok) {
      const repos = await reposRes.json();
      totalStars = (Array.isArray(repos) ? repos : []).reduce(
        (acc: number, r: any) => acc + (r.stargazers_count || 0),
        0
      );
    }

    const profile = {
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      public_repos: user.public_repos,
      totalStars,
      company: user.company,
      blog: user.blog,
      location: user.location,
      created_at: user.created_at,
    };

    cache = { data: profile, timestamp: Date.now() };
    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch GitHub profile" },
      { status: 502 }
    );
  }
}
