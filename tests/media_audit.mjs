// Static audit of section images: counts per section (>3), unmatched section titles, missing files.
import fs from "fs";
import path from "path";
const root = "/app/frontend";
const extra = JSON.parse(fs.readFileSync(root + "/src/data/extraMedia.json", "utf8"));
const mediaSrc = fs.readFileSync(root + "/src/data/media.ts", "utf8");
// parse base media sectionImages via regex
const base = {};
let cur = null;
for (const line of mediaSrc.split("\n")) {
  const t = line.match(/^  (\w+): \{$/);
  if (t) cur = t[1];
  const m = line.match(/section: "([^"]+)", key: "([^"]+)", caption: "([^"]+)"/);
  if (m && cur) (base[cur] ??= []).push({ section: m[1], key: m[2], caption: m[3], base: true });
}
const slidesDir = root + "/assets/slides";
const files = new Set(fs.readdirSync(slidesDir));
let over = [], missing = [], total = 0, cards = 0;
const report = {};
for (const t of new Set([...Object.keys(base), ...Object.keys(extra)])) {
  const all = [...(base[t] ?? []), ...(extra[t]?.sectionImages ?? [])];
  cards += (extra[t]?.imageCards ?? []).length;
  const by = {};
  for (const x of all) (by[x.section] ??= []).push(x);
  report[t] = by;
  for (const [s, arr] of Object.entries(by)) {
    if (arr.length > 3) over.push(`${t} / ${s}: ${arr.length}`);
  }
  for (const x of extra[t]?.sectionImages ?? []) {
    total++;
    if (!files.has(x.key + ".jpg")) missing.push(x.key);
  }
  for (const c of extra[t]?.imageCards ?? []) if (!files.has(c.key + ".jpg") && !c.key.startsWith(t.slice(0,2))) missing.push("card:" + c.key);
}
console.log("extra section images:", total, "extra image cards:", cards);
console.log("Sections >3 images:", over);
console.log("Missing files:", missing);
// file sizes tiny?
const tiny = [...files].filter((f) => f.startsWith("x_") && fs.statSync(path.join(slidesDir, f)).size < 3000);
console.log("Tiny files:", tiny);
fs.writeFileSync("/tmp/media_by_section.json", JSON.stringify(report, null, 1));
