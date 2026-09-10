# lev1ne Blog Agent Instructions

## Scope

These instructions apply to the entire repository.

## Project

- Site: `https://lev1ne.org/`
- Framework: Astro / AstroPaper
- Blog posts: `src/content/posts/`
- Default post format: Markdown (`.md`)
- Treat existing posts as the primary reference for tone, structure, terminology, and formatting.

## Writing voice

The normal blog voice is Traditional Chinese written in a natural Cantonese style, mixed with English technical terms where that is already common in the blog.

Examples of the expected tone include words such as `喺`, `唔`, `嘅`, `而家`, `搞掂`, while technical names such as Debian, Docker, VPS, Cloudflare, sing-box, GitHub, API, Server, Config and Command may remain in English.

Guidelines:

- Sound like a personal technical blog, not a formal manual or marketing article.
- Prefer practical explanations, commands, examples, caveats and short conclusions.
- Keep paragraphs readable and avoid repetitive AI-style summaries.
- Do not overuse headings or filler sections just to make an article longer.
- Do not fabricate personal experience. Only write claims such as "我試過", "我今次用", or "實測" when the user or repository context provides that experience or the task actually performed the test.
- When personal experience is not available, frame the article as notes, a guide, an explanation, or a researched setup instead.

## Emoji and playful visual tone

Emoji are part of the normal lev1ne.org writing style and may be used throughout an article whenever they improve tone, readability or emphasis.

They are not limited to titles. Appropriate places include:

- the article title and H1;
- H2 / H3 headings;
- warning, tip, success, failure and troubleshooting callouts;
- short inline reactions inside normal paragraphs;
- summaries, checklists and conclusions;
- light humorous or meme-like moments when they fit naturally.

Guidelines:

- Choose emoji by meaning rather than by a fixed quota. There is no hard maximum per article.
- Prefer contextual emoji such as `🐳` for Docker, `🔐` for security / TLS, `💾` for storage / Swap, `🌐` for networking, `💳` for payment, `⚠️` for warnings, `🛠️` for troubleshooting, `✅` for verification and `📝` for notes.
- Emoji may appear inside ordinary prose when a reaction or visual cue feels natural, for example `呢度最容易中伏 ⚠️` or `到呢步基本就搞掂 ✅`.
- Avoid mechanically placing one emoji at the start of every paragraph. The result should feel human and spontaneous rather than templated.
- Do not replace important technical wording with emoji alone.
- Do not put decorative emoji inside code, commands, URLs, filenames, configuration snippets or values that readers need to copy.
- Meme / reaction-style content is allowed when it genuinely improves the article. Prefer generated, original or properly usable visuals rather than casually copying copyrighted meme images from the web.
- Technical clarity always wins over decoration. A serious warning can still use `⚠️`, but the emoji must not make the risk sound trivial.

## Research and factual accuracy

For technical topics that can change over time, verify current facts before writing whenever web/research access is available.

Prefer primary sources:

1. Official documentation
2. Official GitHub repository / releases
3. Vendor documentation
4. Standards or project documentation

Do not guess current versions, pricing, support status, commands, release behavior, limits or compatibility.

When an article depends on current information, keep useful source links in the article where appropriate, but do not turn a personal blog post into a citation-heavy academic paper.

Never copy large passages from sources. Paraphrase and explain them in the blog's own voice.

## Frontmatter

Posts are stored under `src/content/posts/` and should follow the repository schema.

Typical new post:

```yaml
---
title: "文章標題"
description: "簡短、清楚嘅文章描述。"
pubDatetime: 2026-09-10
tags:
  - Tag1
  - Tag2
draft: true
ogImage: "https://pic.myfar.de/2026-09-10-example-cover.webp"
---
```

Rules:

- `title`, `description`, `pubDatetime`, and `tags` must be valid.
- New generated articles should normally start with `draft: true` unless the user explicitly asks to publish immediately.
- `ogImage` may use an external URL from the image CDN.
- Follow the formatting pattern used by existing posts.
- Existing posts normally repeat the title as an H1 after frontmatter; preserve that convention unless the site structure changes.

## Image system

Image repository:

```text
LevineWoo/picb
```

Default branch:

```text
master
```

Public image base URL:

```text
https://pic.myfar.de/
```

The image repository is separate from the blog repository. Do not copy generated blog images into `lev1ne_blog` unless explicitly requested.

### Image upload helper

Use:

```bash
node scripts/upload-image.mjs <local-image> --slug <article-slug> --role cover
```

For an article image:

```bash
node scripts/upload-image.mjs <local-image> --slug <article-slug> --role image --index 1
```

The command prints the final public image URL to stdout. Use that returned URL in the article.

Expected environment variable:

```text
PICB_GITHUB_TOKEN
```

Optional environment variables:

```text
PICB_REPO=LevineWoo/picb
PICB_BRANCH=master
PICB_PUBLIC_BASE_URL=https://pic.myfar.de
PICB_DIR=
```

Never place `PICB_GITHUB_TOKEN` in source code, Markdown, logs, examples, commits, `.env.example`, or generated articles.

If the upload token is unavailable, do not invent a final image URL. Finish the article as a draft and clearly report that image upload could not be completed.

### Image naming

Prefer ASCII filenames:

```text
YYYY-MM-DD-article-slug-cover.webp
YYYY-MM-DD-article-slug-01.webp
YYYY-MM-DD-article-slug-02.webp
```

Avoid Chinese characters, spaces, opaque timestamps, and unnecessary query strings in newly generated image URLs.

### Image format and composition

Default recommendations:

- Cover: 16:9 composition, ideally around 1600 x 900
- Article illustrations: up to about 1600 px wide when appropriate
- Prefer WebP for generated artwork and normal illustrations
- Keep UI screenshots in a format that preserves text clarity when necessary
- Keep file size reasonable without visibly damaging quality
- Always provide useful Markdown alt text

For AI-generated images:

- Generate images only when they materially improve the article.
- Prefer clean illustrations, conceptual diagrams, architecture visuals and atmospheric covers.
- Avoid large amounts of generated text inside images.
- Do not create fake screenshots of real products, dashboards, terminals, payment pages or websites and present them as real.
- When the article needs a real UI screenshot, use an actual user-provided or legitimately captured screenshot instead.
- Do not falsely reproduce a company's exact UI when an explanatory diagram would be clearer.

### Using uploaded images

Body image:

```md
![圖片描述](https://pic.myfar.de/filename.webp)
```

Cover image:

```yaml
ogImage: "https://pic.myfar.de/filename.webp"
```

Do not use these forms as final blog image links:

- `raw.githubusercontent.com/...`
- GitHub private download URLs containing temporary tokens
- `github.com/.../blob/...`

Always use the public `https://pic.myfar.de/` URL returned by the uploader.

## Security in technical articles

Never publish real credentials, API keys, passwords, private keys, cookies, access tokens, account numbers, private repository tokens, or other secrets.

When converting a real configuration into a blog example:

- replace secrets with obvious placeholders;
- remove personally identifying values where they are not needed;
- remove private IPs, hostnames, paths or IDs when disclosure is unnecessary;
- explain what the reader must replace.

## Verification

Before finishing a blog change, run the repository's normal checks when the execution environment allows it:

```bash
pnpm run format
pnpm run lint
pnpm run build
```

Fix errors caused by the change before committing when possible.

Also verify:

- frontmatter is valid;
- image URLs use `https://pic.myfar.de/`;
- Markdown image alt text is present;
- no secrets were added;
- no generated image is presented as a real screenshot;
- links and commands are current when the article depends on current information.

## Git workflow

Default workflow for this personal blog:

1. Work directly on the `main` branch unless the user explicitly asks for a separate branch or pull request.
2. Do not create a pull request by default.
3. For a finished article that the user asks to publish, set `draft: false` or omit `draft` according to the existing repository convention.
4. For an unfinished or review-only article, use `draft: true`.
5. Run formatting, lint and build checks when possible before the final commit.
6. Commit the completed change directly to `main` with a concise commit message.

The user prefers convenience and direct publication over a PR-based review workflow.
