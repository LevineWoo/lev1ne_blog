#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const DEFAULT_REPO = "LevineWoo/picb";
const DEFAULT_BRANCH = "master";
const DEFAULT_PUBLIC_BASE_URL = "https://pic.myfar.de";
const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_QUALITY = 82;

function printHelp() {
  console.log(`Usage:
  node scripts/upload-image.mjs <image> [options]

Options:
  --slug <slug>         Article/image slug used in the generated filename
  --role <cover|image>  Image role. Default: image
  --index <number>      Image sequence number, e.g. 1 -> 01
  --name <filename>     Exact remote filename (always normalized to .webp)
  --max-width <pixels>  Resize width limit. Default: ${DEFAULT_MAX_WIDTH}
  --quality <1-100>     WebP quality. Default: ${DEFAULT_QUALITY}
  --force               Replace an existing file with the same remote path
  --dry-run             Process locally and print the target URL without upload
  --help                 Show this help

Environment:
  PICB_GITHUB_TOKEN     Required for upload
  PICB_REPO             Default: ${DEFAULT_REPO}
  PICB_BRANCH           Default: ${DEFAULT_BRANCH}
  PICB_PUBLIC_BASE_URL  Default: ${DEFAULT_PUBLIC_BASE_URL}
  PICB_DIR              Optional directory inside the image repository

Examples:
  node scripts/upload-image.mjs /tmp/cover.png --slug sing-box-install --role cover
  node scripts/upload-image.mjs /tmp/diagram.png --slug sing-box-install --role image --index 1
`);
}

function parseArgs(argv) {
  const args = {
    input: null,
    slug: null,
    role: "image",
    index: null,
    name: null,
    maxWidth: DEFAULT_MAX_WIDTH,
    quality: DEFAULT_QUALITY,
    force: false,
    dryRun: false,
  };

  const takeValue = (i, flag) => {
    if (i + 1 >= argv.length || argv[i + 1].startsWith("--")) {
      throw new Error(`${flag} requires a value`);
    }
    return argv[i + 1];
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }

    if (!arg.startsWith("--")) {
      if (args.input) throw new Error(`Unexpected positional argument: ${arg}`);
      args.input = arg;
      continue;
    }

    if (arg === "--force") {
      args.force = true;
      continue;
    }

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    const value = takeValue(i, arg);
    i += 1;

    switch (arg) {
      case "--slug":
        args.slug = value;
        break;
      case "--role":
        args.role = value;
        break;
      case "--index":
        args.index = Number.parseInt(value, 10);
        break;
      case "--name":
        args.name = value;
        break;
      case "--max-width":
        args.maxWidth = Number.parseInt(value, 10);
        break;
      case "--quality":
        args.quality = Number.parseInt(value, 10);
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!args.input) throw new Error("Image path is required");
  if (!new Set(["cover", "image"]).has(args.role)) {
    throw new Error('--role must be either "cover" or "image"');
  }
  if (!Number.isInteger(args.maxWidth) || args.maxWidth < 320 || args.maxWidth > 4096) {
    throw new Error("--max-width must be an integer between 320 and 4096");
  }
  if (!Number.isInteger(args.quality) || args.quality < 1 || args.quality > 100) {
    throw new Error("--quality must be an integer between 1 and 100");
  }
  if (args.index !== null && (!Number.isInteger(args.index) || args.index < 1 || args.index > 99)) {
    throw new Error("--index must be an integer between 1 and 99");
  }

  return args;
}

function slugify(value) {
  const cleaned = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return cleaned || "image";
}

function hongKongDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = type => parts.find(part => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function buildFilename(args) {
  if (args.name) {
    const base = path.basename(args.name, path.extname(args.name));
    return `${slugify(base)}.webp`;
  }

  const inputStem = path.basename(args.input, path.extname(args.input));
  const slug = slugify(args.slug || inputStem);
  const date = hongKongDate();

  if (args.role === "cover") return `${date}-${slug}-cover.webp`;

  const suffix = String(args.index ?? 1).padStart(2, "0");
  return `${date}-${slug}-${suffix}.webp`;
}

function normalizeRemoteDir(value) {
  if (!value) return "";
  return value
    .split("/")
    .map(part => slugify(part))
    .filter(Boolean)
    .join("/");
}

function encodeRemotePath(remotePath) {
  return remotePath.split("/").map(encodeURIComponent).join("/");
}

function parseRepo(repoFullName) {
  const match = /^([^/]+)\/([^/]+)$/.exec(repoFullName);
  if (!match) throw new Error(`Invalid PICB_REPO: ${repoFullName}`);
  return { owner: match[1], repo: match[2] };
}

async function githubRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "lev1ne-blog-image-uploader",
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { response, data };
}

async function readExistingSha(apiUrl, token, branch) {
  const url = `${apiUrl}?ref=${encodeURIComponent(branch)}`;
  const { response, data } = await githubRequest(url, token);

  if (response.status === 404) return null;
  if (!response.ok) {
    const message = typeof data === "object" && data?.message ? data.message : response.statusText;
    throw new Error(`GitHub lookup failed (${response.status}): ${message}`);
  }

  return data?.sha ?? null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input);

  await fs.access(inputPath);

  const filename = buildFilename(args);
  const remoteDir = normalizeRemoteDir(process.env.PICB_DIR);
  const remotePath = remoteDir ? `${remoteDir}/${filename}` : filename;

  const publicBaseUrl = (process.env.PICB_PUBLIC_BASE_URL || DEFAULT_PUBLIC_BASE_URL).replace(/\/+$/, "");
  const publicUrl = `${publicBaseUrl}/${encodeRemotePath(remotePath)}`;

  const imageBuffer = await sharp(inputPath, { failOn: "error" })
    .rotate()
    .resize({ width: args.maxWidth, withoutEnlargement: true })
    .webp({ quality: args.quality, effort: 5 })
    .toBuffer();

  if (args.dryRun) {
    console.error(`Processed ${path.basename(inputPath)} -> ${filename} (${imageBuffer.length} bytes)`);
    console.log(publicUrl);
    return;
  }

  const token = process.env.PICB_GITHUB_TOKEN;
  if (!token) {
    throw new Error("PICB_GITHUB_TOKEN is required. Store it as a secret/environment variable, never in the repository.");
  }

  const repoFullName = process.env.PICB_REPO || DEFAULT_REPO;
  const branch = process.env.PICB_BRANCH || DEFAULT_BRANCH;
  const { owner, repo } = parseRepo(repoFullName);
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeRemotePath(remotePath)}`;

  const existingSha = await readExistingSha(apiUrl, token, branch);
  if (existingSha && !args.force) {
    throw new Error(`Remote file already exists: ${remotePath}. Use --force to replace it or choose another --index/--name.`);
  }

  const body = {
    message: `${existingSha ? "chore" : "feat"}(images): ${existingSha ? "update" : "add"} ${filename}`,
    content: imageBuffer.toString("base64"),
    branch,
  };

  if (existingSha) body.sha = existingSha;

  const { response, data } = await githubRequest(apiUrl, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = typeof data === "object" && data?.message ? data.message : response.statusText;
    throw new Error(`GitHub upload failed (${response.status}): ${message}`);
  }

  console.error(`Uploaded ${remotePath} to ${repoFullName}@${branch} (${imageBuffer.length} bytes)`);
  console.log(publicUrl);
}

main().catch(error => {
  console.error(`upload-image: ${error.message}`);
  process.exitCode = 1;
});
