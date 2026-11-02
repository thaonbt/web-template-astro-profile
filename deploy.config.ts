// Single source of truth for the values that differ between deployment targets.
//
// The target is chosen by the DEPLOY_TARGET environment variable:
// - "github": GitHub Pages. Set only in .github/workflows/deploy-github-pages.yml.
//   A project repo is served at https://<owner>.github.io/<repo>/, so `base` is "/<repo>".
// - anything else or unset (default): Cloudflare Workers, served at the root of its domain.
//
// Do NOT use GITHUB_ACTIONS to tell the targets apart: GitHub Actions sets it to "true"
// in every workflow, including the one that deploys to Cloudflare.
//
// Used by astro.config.ts (`base`) and astro-paper.config.ts (`site.url`).

// Replace with your own *.workers.dev URL or custom domain (full URL, with https://)
const CLOUDFLARE_URL = "https://my-profile.workers.dev/";

const isGithub = process.env.DEPLOY_TARGET === "github";

// GITHUB_REPOSITORY is "owner/repo". The fallback only matters when you simulate a
// GitHub build on your own machine (see "Verify both targets locally" in the README).
const [owner, repo] = (
  process.env.GITHUB_REPOSITORY ?? "your-username/your-repo"
).split("/");

// A repo named <owner>.github.io is a user site and is served from the root
const isUserSite = repo === `${owner}.github.io`;

export const deploy = {
  isGithub,
  /** Final public URL of the site, always with a trailing slash */
  siteUrl: isGithub ? `https://${owner}.github.io/` : CLOUDFLARE_URL,
  /** "/" on Cloudflare and user sites, "/<repo>" on GitHub project sites */
  base: isGithub && !isUserSite ? `/${repo}` : "/",
};