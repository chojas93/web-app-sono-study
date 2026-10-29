// Static check: media.ts section titles match topic sections; image keys exist in slides.ts and files exist
const fs = require("fs");
const path = require("path");
const dir = "/app/frontend/src/data";
const media = fs.readFileSync(path.join(dir, "media.ts"), "utf8");
const slides = fs.readFileSync(path.join(dir, "slides.ts"), "utf8");
const slideKeys = {};
for (const m of slides.matchAll(/(\w+):\s*require\(["']([^"']+)["']\)/g)) slideKeys[m[1]] = m[2];
console.log("slide keys:", Object.keys(slideKeys).length);
for (const [k, p] of Object.entries(slideKeys)) {
  const abs = path.resolve(dir, p);
  if (!fs.existsSync(abs)) console.log("MISSING FILE", k, abs);
  else { const sz = fs.statSync(abs).size; if (sz < 2000) console.log("TINY FILE", k, sz); }
}
// split media by topic
const topicBlocks = media.split(/\n  (\w+): \{\n/).slice(1);
for (let i = 0; i < topicBlocks.length; i += 2) {
  const t = topicBlocks[i], block = topicBlocks[i + 1];
  const src = fs.readFileSync(path.join(dir, `${t}.ts`), "utf8");
  const titles = [...src.matchAll(/title:\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
  const secs = [...block.matchAll(/section:\s*"([^"]+)",\s*key:\s*"(\w+)"/g)];
  const cards = [...block.matchAll(/\{\s*key:\s*"(\w+)"/g)];
  let bad = 0;
  for (const [, s, k] of secs) {
    if (!titles.includes(s)) { console.log(`[${t}] section title NOT FOUND: "${s}"`); bad++; }
    if (!slideKeys[k]) { console.log(`[${t}] key not in slides: ${k}`); bad++; }
  }
  for (const [, k] of cards) if (!slideKeys[k]) { console.log(`[${t}] card key not in slides: ${k}`); bad++; }
  const fcCount = (src.match(/^\s*\[\s*["'`]/gm) || []).length;
  console.log(`${t}: sectionImages=${secs.length} imageCards=${cards.length} bad=${bad}`);
}
