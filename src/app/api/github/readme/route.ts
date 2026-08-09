import { NextResponse } from "next/server";
import { developer } from "@/lib/portfolio-data";

// Fetch README / docs for a specific repo
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");

  if (!repo) {
    return NextResponse.json(
      { error: "Missing 'repo' query parameter" },
      { status: 400 }
    );
  }

  try {
    const branches = ["main", "master"];
    let readme: string | null = null;
    let branchUsed = "main";

    for (const branch of branches) {
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${developer.githubUsername}/${repo}/${branch}/README.md`,
          { next: { revalidate: 300 } }
        );
        if (res.ok) {
          readme = await res.text();
          branchUsed = branch;
          break;
        }
      } catch {
        // try next branch
      }
    }

    if (!readme) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${developer.githubUsername}/${repo}/readme`,
          {
            headers: { Accept: "application/vnd.github.raw" },
            next: { revalidate: 300 },
          }
        );
        if (res.ok) {
          readme = await res.text();
        }
      } catch {
        // ignore
      }
    }

    if (!readme) {
      return NextResponse.json({
        repo,
        branch: branchUsed,
        content: null,
        message:
          "No README found for this repository. Visit the GitHub page for full documentation.",
      });
    }

    return NextResponse.json({
      repo,
      branch: branchUsed,
      content: readme,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        repo,
        content: null,
        error: err?.message || "Failed to fetch README",
      },
      { status: 500 }
    );
  }
}
