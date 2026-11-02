# Create a new post

Posts live in `src/content/posts/` as markdown files. The helper script `src/scripts/new-post.mjs` generates a new post with valid front matter.

## Setup (once)

Make sure `package.json` has the script entry (root of the repo, inside `"scripts"`):

```json
"new-post": "node src/scripts/new-post.mjs"
```

## Usage

```bash
pnpm new-post "Post title" --tags github,ssh
```

What it does:

- Slugifies the title into a file name (Vietnamese diacritics and `đ` are handled), for example `Cách tạo post` becomes `cach-tao-post.md`
- Creates the file in the posts folder (auto-detected, override with `--dir <path>`)
- Fills `pubDatetime` with the current local time and offset
- Sets `draft: true` by default so unfinished posts are not published
- Always puts `posts` as the first tag, followed by the tags you pass (duplicates are removed)
- Refuses to overwrite an existing file

| Flag           | Description                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `--tags a,b`   | Comma-separated extra tags, added after `posts`. Without this flag the tags are `posts` and `others`     |
| `--publish`    | Create the post with `draft: false`                                                                      |
| `--dir <path>` | Posts folder, if auto-detection picks the wrong one                                                      |

Examples:

| Command                                  | Tags in front matter     |
| ---------------------------------------- | ------------------------ |
| `pnpm new-post "A"`                      | `posts`, `others`        |
| `pnpm new-post "B" --tags github,ssh`    | `posts`, `github`, `ssh` |
| `pnpm new-post "C" --tags posts,github`  | `posts`, `github`        |

Tip: if the flags do not reach the script, call it directly: `node src/scripts/new-post.mjs "Post title" --tags a,b`.

## Related posts and links (optional)

A post can show a collapsible **Related** block at the bottom of the article. It is driven by two optional front matter fields. The script does not need them, so add them by hand when a post has related material.

| Field          | What to put in                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `relatedPosts` | Post ids: the file name in `src/content/posts/` without the extension (for example `cach-tao-post`). Title and URL are read from that post automatically |
| `relatedLinks` | External links as `title` + `url` pairs. `url` must be a full URL starting with `https://`                  |

```yaml
relatedPosts:
  - cach-tao-post
  - thu-muc-con/post-khac # post inside a sub folder: include the folder path
relatedLinks:
  - title: Astro Docs
    url: https://docs.astro.build
```

- Both fields are optional. When both are empty or missing, no block is shown
- Draft posts listed in `relatedPosts` are skipped, so unpublished posts are never linked
- Key names are case-sensitive: `relatedPosts` and `relatedLinks`

## Publish checklist

1. Fill in `title`, `description` and the content
2. Optionally add `relatedPosts` / `relatedLinks` (see above)
3. Set `draft: false`
4. Check locally with `pnpm dev`, open `/posts/<slug>` and expand the **Related** block at the bottom of the post
5. Commit with Conventional Commits, for example `docs(posts): add <slug>`
6. Push or merge into `main`; Cloudflare builds and deploys automatically

## Common pitfalls

- `draft: true` posts are skipped at build time and return 404 in production
- A `pubDatetime` in the future hides the post until that time has passed
- Missing `title`, `description` or `pubDatetime` fails the build (schema validation)
- A `relatedPosts` id that does not exist (typo, or the target file was renamed or deleted) fails the build. Fix the id or remove the entry
- A `relatedLinks` `url` without `https://` fails the build
- The Related block does not show: check the key names (`relatedPosts`, `relatedLinks`). A misspelled key is ignored silently, and the block is at the bottom of the post, below the content
- Images go in `src/assets/images/` and are imported by relative path so Astro can optimize them
- `Cannot find module .../new-post.mjs`: the script path in `package.json` does not match where the file is
- `Command "new-post" not found`: the `new-post` entry is missing from `"scripts"` in the root `package.json`