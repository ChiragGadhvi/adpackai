/**
 * Downloads all media assets from showcase-seed.json to public/showcase-assets/
 * and rewrites the JSON to use local paths.
 *
 * Usage: node scripts/download-seed-assets.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { extname, basename, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SEED_PATH = join(ROOT, "public", "showcase-seed.json");
const ASSETS_DIR = join(ROOT, "public", "showcase-assets");
const PUBLIC_PREFIX = "/showcase-assets";

const KIEAI_API_KEY = "0a87de8588803e6b78a31801592c51f2";

if (!existsSync(ASSETS_DIR)) {
  mkdirSync(ASSETS_DIR, { recursive: true });
  console.log("Created directory:", ASSETS_DIR);
}

const seed = JSON.parse(readFileSync(SEED_PATH, "utf-8"));

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExtension(url) {
  try {
    const u = new URL(url);
    const ext = extname(u.pathname);
    return ext || ".bin";
  } catch {
    return extname(url) || ".bin";
  }
}

function isLocalPath(url) {
  return url.startsWith("/") || url.startsWith("./") || url.startsWith("../");
}

async function downloadFile(url, destPath) {
  if (existsSync(destPath)) {
    console.log("  [skip] already exists:", basename(destPath));
    return true;
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${KIEAI_API_KEY}`,
      "User-Agent": "Mozilla/5.0",
    },
  });
  if (!res.ok) {
    // Retry without auth header (CDN URLs are usually public)
    const res2 = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res2.ok) {
      console.error(`  [fail] HTTP ${res2.status} for ${url}`);
      return false;
    }
    const buf = await res2.arrayBuffer();
    writeFileSync(destPath, Buffer.from(buf));
    return true;
  }
  const buf = await res.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buf));
  return true;
}

let totalDownloaded = 0;
let totalFailed = 0;
let totalSkipped = 0;

const updatedSeed = [];

for (let packIdx = 0; packIdx < seed.length; packIdx++) {
  const pack = seed[packIdx];
  const packSlug = slugify(pack.productName).slice(0, 36);
  const updatedAssets = [];

  for (const asset of pack.assets) {
    const ext = getExtension(asset.url);
    const labelSlug = slugify(asset.label);
    const filename = `p${String(packIdx).padStart(2, "0")}__${packSlug}__${labelSlug}${ext}`;
    const destPath = join(ASSETS_DIR, filename);
    const localPath = `${PUBLIC_PREFIX}/${filename}`;

    console.log(`Downloading [${pack.productName}] ${asset.label}...`);
    console.log(`  URL: ${asset.url}`);

    const wasExisting = existsSync(destPath);
    const ok = await downloadFile(asset.url, destPath);

    if (ok) {
      if (wasExisting) {
        totalSkipped++;
        console.log(`  -> Already existed, keeping local path`);
      } else {
        totalDownloaded++;
        console.log(`  -> Saved: ${filename}`);
      }
      updatedAssets.push({ ...asset, url: localPath });
    } else {
      totalFailed++;
      console.log(`  -> FAILED, keeping original URL`);
      updatedAssets.push(asset);
    }
  }

  updatedSeed.push({ ...pack, assets: updatedAssets });
}

writeFileSync(SEED_PATH, JSON.stringify(updatedSeed, null, 2), "utf-8");

console.log("\n========================================");
console.log(`Downloaded: ${totalDownloaded}`);
console.log(`Skipped (already existed): ${totalSkipped}`);
console.log(`Failed: ${totalFailed}`);
console.log(`\nSeed JSON updated: ${SEED_PATH}`);
console.log("========================================\n");
