#!/usr/bin/env node
// Create a new post for AstroPaper with proper front matter.
// Use:  pnpm new-post "Post title" [--tags a,b] [--publish] [--dir src/content/posts]
// No external dependencies are needed, just 18 or more nodes.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_TAG = "posts";     // Always the first tag of every post.
const CANDIDATE_DIRS = [         // For the posts directory: prioritize --dir, then automatically check the following order.
  "src/content/posts",
  // "src/data/blog",
  "src/data/posts",
  // "src/content/blog",
];
const AUTHOR = "Claude with prompts by ThaoNBT"; // Change to the specific version if desired.

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { title: "", tags: [], publish: false, dir: "" };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--publish") opts.publish = true;
    else if (a === "--tags") opts.tags = (argv[++i] ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    else if (a === "--dir") opts.dir = argv[++i] ?? "";
    else if (a.startsWith("--")) fail(`Invalid Flag: ${a}`);
    else rest.push(a);
  }
  opts.title = rest.join(" ").trim();
  return opts;
}

// Handle Vietnamese diacritics and accents "đ" (example: "Cách tạo Post đầu tiên" -> "cach-tao-post-dau-tien")
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ISO 8601 local time with offset, example 2026-10-22T13:57:00+07:00
function localIso(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

// Use an escape character for YAML double-quoted strings to avoid breaking the front matter when the title contains colons or quotation marks.
const q = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const opts = parseArgs(process.argv.slice(2));
if (!opts.title) fail('Missing title. Ví dụ: pnpm new-post "Missing title" --tags notes,github');

const dir = opts.dir || CANDIDATE_DIRS.find((d) => existsSync(d));
if (!dir) fail(`Posts folder not found. Tried: ${CANDIDATE_DIRS.join(", ")}. Use --dir <path>.`);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const slug = slugify(opts.title);
if (!slug) fail("The title failed to generate a valid slug (it needs alphanumeric characters).");

const file = join(dir, `${slug}.md`);
if (existsSync(file)) fail(`File already exists, cannot overwrite.: ${file}`);

// The first tag is always "posts"; followed by the tags the user provides (avoiding duplicates).
// Not input --tags is ["posts", "others"].
const extraTags = opts.tags.length ? opts.tags : ["others"];
const tags = [...new Set([DEFAULT_TAG, ...extraTags])];
const content = `---
title: ${q(opts.title)}
description: ""
pubDatetime: ${localIso()}
modDatetime:
author: ${q(AUTHOR)}
featured: false
draft: ${opts.publish ? "false" : "true"}
tags:
${tags.map((t) => `  - ${t}`).join("\n")}
ogImage:
---

Write content here.
`;

try {
  writeFileSync(file, content, { encoding: "utf8", flag: "wx" });
} catch (err) {
  fail(`File could not be written: ${err.message}`);
}

console.log(`✔ Created ${file}`);
if (!opts.publish) console.log("  Note: draft: true. Change it to false when you want to publish.");
