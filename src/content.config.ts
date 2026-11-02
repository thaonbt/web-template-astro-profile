import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${BLOG_PATH}`,
  }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      // External link: z.url() validate at build time
      relatedLinks: z
        .array(z.object({ title: z.string(), url: z.url() }))
        .optional(),

      // Link to another post: collection name must be "posts"
      relatedPosts: z.array(reference("posts")).optional(),
    }),
});

const pages = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/pages",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

const portfolios = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/portfolios",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      tags: z.array(z.string()).default([]),
      thumbnail: image().optional(),
      repo: z.url().optional(),
      demo: z.url().optional(),
      order: z.number().default(100),
    }),
});

export const collections = { posts, pages, portfolios };
