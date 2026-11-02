# Create a new project (portfolio entry)

Projects live in `src/content/portfolios/` as markdown files, one file per project. The helper script `src/scripts/new-project.mjs` generates a new entry with valid front matter. The schema is defined in `src/content.config.ts` and summarized in the Portfolios section of `README.md`.

## Setup (once)

Make sure `package.json` has the script entry (root of the repo, inside `"scripts"`):

```json
"new-project": "node src/scripts/new-project.mjs"
```

## Usage

```bash
pnpm new-project "Project title" --description "One-line summary" --tags TypeScript,Astro
```

What it does:

- Slugifies the title into a file name (Vietnamese diacritics and `đ` are handled), for example `Dự án đầu tiên` becomes `du-an-dau-tien.md`. The file name is also the route: `/portfolios/<slug>`
- Creates the file in `src/content/portfolios/` (override with `--dir <path>`)
- Escapes the title and description so quotes or colons cannot break the front matter
- Validates `--repo` and `--demo` as full URLs and `--thumbnail` as an existing file before writing anything
- Omits optional fields you did not pass (an empty `repo:` would fail URL validation at build time)
- Refuses to overwrite an existing file

| Flag                  | Description                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `--description "..."` | One-line summary shown on the list and grid pages (required by the schema, so fill it in if skipped) |
| `--tags a,b`          | Comma-separated tags (default: none)                                                                 |
| `--repo <url>`        | Full repository URL. Only use it for **public** repos                                                |
| `--demo <url>`        | Full URL of a live demo                                                                              |
| `--thumbnail <file>`  | File name of an image already placed in `src/assets/images/` (shown in the Grid view only)           |
| `--order <number>`    | Smaller numbers are listed first (default `100`)                                                     |
| `--dir <path>`        | Portfolios folder, if you need a different one                                                       |

Full example:

```bash
pnpm new-project "My Project" \
  --description "Short summary of what it does" \
  --tags TypeScript,Astro \
  --repo https://github.com/<account>/<repo> \
  --thumbnail my-project.png \
  --order 1
```

Tip: if the flags do not reach the script, call it directly: `node src/scripts/new-project.mjs "My Project" --tags a,b`.

## Publish checklist

1. Fill in the `description` (if you skipped it) and write the details in the markdown body
2. Put the thumbnail in `src/assets/images/` if you want one, then set it with `--thumbnail` or in the front matter
3. Check locally with `pnpm dev` and open `/portfolios` and `/portfolios/<slug>`
4. Commit with Conventional Commits, for example `docs(portfolios): add <slug>`
5. Push or merge into `main`; Cloudflare builds and deploys automatically

## Common pitfalls

- **No draft flag:** portfolio entries are published as soon as they reach `main`. Work on a branch (for example `project/<slug>`) until the entry is ready
- **Reserved names:** a project cannot be called `grid` or `list` (they clash with `/portfolios/grid` and `/portfolios/list`). The script stops with an error
- **Build fails on a project:** `title` and `description` are required, `repo` and `demo` must be full URLs including `https://`, and `thumbnail` must point to an existing image
- **Thumbnail does not show:** thumbnails only appear in the Grid view. Check which view `/portfolios` uses in `src/pages/portfolios/index.astro`
- **Private repos:** leave `--repo` out so the detail page does not link to a repository nobody can open
- `Cannot find module .../new-project.mjs`: the script path in `package.json` does not match where the file is
- `Command "new-project" not found`: the `new-project` entry is missing from `"scripts"` in the root `package.json`