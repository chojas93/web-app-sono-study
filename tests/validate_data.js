// Validates textbook question JSON integrity (answer index, options, duplicate ids)
const bq = require("/app/frontend/src/data/bookQuestions.json");
let total = 0;
const issues = [];
for (const [t, qs] of Object.entries(bq)) {
  const ns = new Set();
  qs.forEach((q) => {
    total++;
    if (ns.has(q.n)) issues.push(`${t}: duplicate n=${q.n}`);
    ns.add(q.n);
    if (!Array.isArray(q.options) || q.options.length < 2) issues.push(`${t} q${q.n}: options=${q.options && q.options.length}`);
    if (q.answer < 0 || q.answer >= q.options.length) issues.push(`${t} q${q.n}: answer out of range ${q.answer}`);
    if (!q.q || q.q.length < 10) issues.push(`${t} q${q.n}: short q "${q.q}"`);
    q.options.forEach((o, i) => { if (!o || !o.trim()) issues.push(`${t} q${q.n}: empty option ${i}`); });
    if (new Set(q.options).size !== q.options.length) issues.push(`${t} q${q.n}: duplicate options`);
    if (/\d+\.\s*$|\bCHAPTER\b|Copyright|Elsevier/i.test(q.q + q.options.join(" "))) issues.push(`${t} q${q.n}: artifact text: ${(q.q + " | " + q.options.join(" | ")).slice(0, 160)}`);
    if (q.options.some((o) => o.length > 200)) issues.push(`${t} q${q.n}: very long option`);
  });
  console.log(t, qs.length);
}
console.log("TOTAL", total);
console.log("ISSUES", issues.length);
issues.slice(0, 40).forEach((i) => console.log(" -", i));
