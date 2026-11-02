---
title: "Setup Google Search Console for AstroPaper (Cloudflare Workers)"
pubDatetime: 2026-10-27T09:55:00+07:00
description: "How to verify an AstroPaper site with Google Search Console using the HTML tag method and submit a sitemap when your site runs on workers.dev and you can't configure DNS."
tags: 
  - astro
  - astro-paper
  - seo
  - google-search-console
  - cloudflare
  - cloudflare-workers
featured: true
draft: false
relatedLinks:
  - title: AstroPaper (README)
    url: https://github.com/satnaing/astro-paper
  - title: Discussion #334: Google Search Console and AstroPaper
    url: https://github.com/satnaing/astro-paper/discussions/334
  - title: "Astro: @astrojs/sitemap integration"
    url: https://docs.astro.build/en/guides/integrations-guide/sitemap/
  - title: "Google: Verify your site ownership"
    url: https://support.google.com/webmasters/answer/9008080
  - title: "Google: Build and submit a sitemap"
    url: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
  - title: Cloudflare Workers documentation
    url: https://developers.cloudflare.com/workers/
---

> [!Note] BLUF
>
> If your site runs on `*.workers.dev` you can't edit DNS, so you need a **URL prefix** property verified with the **HTML tag** method. Put the value in `site.googleVerification` in `astro-paper.config.ts`, deploy and click Verify. Then submit `sitemap-index.xml`.

## Table of contents

## Background

AstroPaper supports Google Search Console verification out of the box through a meta tag in `<head>`. The theme's README only says to set a value in the config. This post covers the full workflow, including the problems I hit when deploying on Cloudflare Workers (`*.workers.dev`).

Using Quartz instead of AstroPaper? The verification flow is different. See [Setting up Google Search Console for a Quartz site](/posts/google-search-console-quartz-cloudflare/).

> Older GitHub discussions (for example discussion #334 from 2024) mention an environment variable called `PUBLIC_GOOGLE_SITE_VERIFICATION`. Newer versions use `site.googleVerification` in `astro-paper.config.ts`, so follow the README for the version you are running.

## Step 1: Create a URL prefix property

Search Console offers two property types:

| Type | Verification methods | Works with `workers.dev`? |
| --- | --- | --- |
| **Domain** | DNS only (TXT or CNAME) | No (you don't own the DNS for `workers.dev`) |
| **URL prefix** | HTML file, HTML tag, GA, GTM or DNS | Yes |

How to create it:

1. Open [Google Search Console](https://search.google.com/search-console), click the property dropdown and choose **Add property**.
2. Enter the **full** URL in the **URL prefix** box (the right-hand one), for example:
   ```
   https://profile.thaonbt.workers.dev/
   ```
3. Click **Continue**.

**Pitfall:** if you type a bare hostname (no `https://`) into the left-hand box, Google creates a Domain property and only offers DNS verification. That can't work on `workers.dev`. Remove that property and recreate it as URL prefix.

The URL must match your canonical site URL exactly (same `https`, same host and a trailing `/`).

## Step 2: Get the HTML tag value

Choose the **HTML tag** method (it may be under *Other verification methods*). Google gives you a tag like this:

```html
<meta name="google-site-verification" content="abc123..." />
```

Copy only the value inside `content="..."`. Don't copy the whole tag.

## Step 3: Configure AstroPaper

Open `astro-paper.config.ts`:

```ts
export default defineAstroPaperConfig({
  site: {
    // Must match the property you created in step 1
    website: "https://profile.thaonbt.workers.dev/",
    // ...
    googleVerification: "abc123...", // only the content value
  },
  // ...
});
```

Notes:

- The site URL (`website`) must be the real URL serving your site. If it's wrong, the canonical URL, sitemap and Open Graph tags will point to the wrong domain.
- The verification value is **not a secret** because it's public in your HTML, so committing it to the repo is safe.

## Step 4: Build, deploy and check

1. Build locally, open the page, use *View Source* and search for `google-site-verification` to confirm the tag is rendered inside `<head>`.
2. **Deploy to Cloudflare** (push so CI builds or run the Wrangler deploy command). Google only reads the live URL and can't reach localhost.
3. Check the live page:
   ```bash
   curl -s https://profile.thaonbt.workers.dev/ | grep google-site-verification
   ```
4. Go back to Search Console and click **Verify**.

**If Verify fails**, check in this order:

- Has the deployment finished (see the Deployments tab in the Cloudflare Dashboard)?
- Does the live `content` value match Google's value character for character?
- Does the property URL match `website` in your config?
- Is Cloudflare Access or Bot Fight Mode blocking Googlebot?
- Try a hard refresh or an incognito window to rule out caching.

**Keep the meta tag after verification succeeds.** Google re-checks periodically and removing the tag makes you lose ownership.

## Step 5: Submit your sitemap

A sitemap is optional and does **not** improve your ranking. Its purpose is to help Google discover your URLs faster and to give you a place to track index status. It helps noticeably on new sites with few backlinks.

AstroPaper uses `@astrojs/sitemap`, which generates:

- `/sitemap-index.xml`: the index file
- `/sitemap-0.xml`: the actual URL list

Check it before submitting:

```bash
curl -sI https://profile.thaonbt.workers.dev/sitemap-index.xml
```

You should see `HTTP/2 200` and `content-type: application/xml` with no redirect and no `x-robots-tag: noindex`.

Also check `robots.txt` (AstroPaper usually ships with this configured):

```txt
User-agent: *
Allow: /

Sitemap: https://profile.thaonbt.workers.dev/sitemap-index.xml
```

To submit:

1. Open the **Sitemaps** section in Search Console.
2. Enter `sitemap-index.xml` in the *Add a new sitemap* box and click **Submit**.

## "Couldn't fetch" right after submitting

This is common on new sites. Right after you submit, the status may show **Couldn't fetch** with an empty *Last read* column even though the file is perfectly valid. It's usually temporary.

What to do:

1. Confirm the file is valid with `curl -sI` as above.
2. Use **URL Inspection** and click **Test live URL** on the sitemap URL. If Google can access it, you only need to wait.
3. **Wait 24 to 48 hours**.
4. If it still fails, delete the old entry and resubmit with the full URL or submit `sitemap-0.xml` directly.

## Speeding up indexing (optional)

- Use **URL Inspection** and then **Request indexing** for your homepage and a few key posts (there is a daily quota).
- Link to your site from places you control (your GitHub profile or personal pages) to get a few backlinks.
- Check progress with `site:profile.thaonbt.workers.dev` on Google. For a new site, indexing usually takes a few days to a few weeks.

## Trade-offs and long-term notes

- **`workers.dev` only supports URL prefix.** The HTML tag is simple and enough for most needs.
- **A custom domain unlocks Domain properties** (DNS TXT), which cover subdomains and both http and https. Your URL also stays stable if you change hosting. If you plan to keep this site for years, it's worth considering.
- **Changing domains later** means verifying the new property again and using the *Change of Address* tool.
- If the site previously lived at another URL (for example `github.io`) and redirects to the new one, make sure the redirect is permanent (301) and the canonical points to the new URL so Google consolidates signals in one place.

## Checklist

- [ ] Create a **URL prefix** property with the exact full URL
- [ ] Copy the HTML tag `content` value into `site.googleVerification`
- [ ] `website` in the config matches the real URL
- [ ] Deploy and confirm the meta tag on the live page
- [ ] Click **Verify** and get a success message
- [ ] `robots.txt` contains a `Sitemap:` line
- [ ] Submit `sitemap-index.xml`
- [ ] Wait 1 to 2 days if you see "Couldn't fetch"
