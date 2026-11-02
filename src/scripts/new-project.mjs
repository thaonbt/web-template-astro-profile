#!/usr/bin/env node
// Create a new portfolio entry (AstroPaper `portfolios` collection) with valid front matter.
// Usage:
//   pnpm new-project "Project title" [--description "..."] [--tags a,b] [--repo URL] [--demo URL]
//                    [--thumbnail file.png] [--order 10] [--dir src/content/portfolios]
// Generated front matter: title, description, pubDatetime (current UTC time), tags, optional
// thumbnail/repo/demo, order. `modDatetime` is optional in the schema and is left out on purpose:
// add it by hand when you update the project.
// No external dependencies, Node >= 18 only.

import { existsSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const DEFAULT_DIR = "src/content/portfolios";
const IMAGES_DIR = "src/assets/images"; // thumbnails are looked up here
const DEFAULT_ORDER = 100; // same default as the schema in src/content.config.ts
// Routes that already exist under /portfolios/, so a project cannot use these names.
const RESERVED_SLUGS = new Set(["grid", "list"]);

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {
    title: "",
    description: "",
    tags: [],
    repo: "",
    demo: "",
    thumbnail: "",
    order: DEFAULT_ORDER,
    dir: "",
  };
  const rest = [];
  // Reads the value after a flag and fails clearly if it is missing.
  const value = (flag, i) => {
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) fail(`Flag ${flag} needs a value.`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--description") opts.description = value(a, i++);
    else if (a === "--tags") opts.tags = value(a, i++).split(",").map((t) => t.trim()).filter(Boolean);
    else if (a === "--repo") opts.repo = value(a, i++);
    else if (a === "--demo") opts.demo = value(a, i++);
    else if (a === "--thumbnail") opts.thumbnail = value(a, i++);
    else if (a === "--order") {
      const n = Number(value(a, i++));
      if (!Number.isFinite(n)) fail("--order must be a number.");
      opts.order = n;
    } else if (a === "--dir") opts.dir = value(a, i++);
    else if (a.startsWith("--")) fail(`Unknown flag: ${a}`);
    else rest.push(a);
  }
  opts.title = rest.join(" ").trim();
  return opts;
}

// "Dự án đầu tiên" -> "du-an-dau-tien"
// Strips Vietnamese diacritics; d/Đ are handled separately because NFD does not decompose them.
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Escape a string for a YAML double-quoted scalar so characters like ":" or quotes cannot break the front matter.
const q = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

// The schema validates `repo` and `demo` as URLs, so reject bad values here instead of at build time.
function checkUrl(flag, v) {
  if (!v) return;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("bad protocol");
  } catch {
    fail(`${flag} must be a full URL starting with https:// (got "${v}").`);
  }
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.title) fail('Missing title. Example: pnpm new-project "My Project" --tags TypeScript,Astro');

checkUrl("--repo", opts.repo);
checkUrl("--demo", opts.demo);

const dir = opts.dir || DEFAULT_DIR;
if (!existsSync(dir)) fail(`Folder not found: ${dir}. Run from the repo root or pass --dir <path>.`);

const slug = slugify(opts.title);
if (!slug) fail("The title does not produce a valid slug (it needs letters or digits).");
if (RESERVED_SLUGS.has(slug)) {
  fail(`"${slug}" is reserved (it clashes with /portfolios/${slug}). Pick a different title.`);
}

const file = join(dir, `${slug}.md`);
if (existsSync(file)) fail(`File already exists, not overwriting: ${file}`);

// The thumbnail must exist (Astro's image() helper fails the build otherwise).
// The path in front matter is relative to the markdown file, e.g. ../../assets/images/x.png
let thumbnailPath = "";
if (opts.thumbnail) {
  const imageFile = join(IMAGES_DIR, opts.thumbnail);
  if (!existsSync(imageFile)) fail(`Thumbnail not found: ${imageFile}. Put the image in ${IMAGES_DIR} first.`);
  thumbnailPath = relative(resolve(dir), resolve(imageFile)).split(sep).join("/");
}

// Current UTC time without milliseconds, e.g. 2026-11-02T03:00:00Z.
// It must stay UNQUOTED in the front matter: YAML then parses it as a date, which `z.date()` requires.
// A quoted value would be a string and fail the schema.
const pubDatetime = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

// Optional fields are omitted when empty: an empty `repo:` is parsed as null and fails URL validation.
const lines = [
  "---",
  `title: ${q(opts.title)}`,
  `description: ${q(opts.description)}`,
  `pubDatetime: ${pubDatetime}`,
  `tags: [${opts.tags.map(q).join(", ")}]`,
];
if (thumbnailPath) lines.push(`thumbnail: ${thumbnailPath}`);
if (opts.repo) lines.push(`repo: ${opts.repo}`);
if (opts.demo) lines.push(`demo: ${opts.demo}`);
lines.push(`order: ${opts.order}`, "---", "", "Details, screenshots and lessons learned in markdown.", "");

try {
  writeFileSync(file, lines.join("\n"), { encoding: "utf8", flag: "wx" });
} catch (err) {
  fail(`Could not write the file: ${err.message}`);
}

console.log(`✔ Created ${file}`);
if (!opts.description) console.log("  Note: description is empty. Fill it in, it is shown on the list and grid pages.");
console.log("  Note: portfolio entries have no draft flag, so the project goes live as soon as it is merged into main.");
