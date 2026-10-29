import type { RawTopic } from "./types";

export const adrenal: RawTopic = {
  id: "adrenal",
  title: "The Adrenal Glands",
  chapter: "Chapter 8",
  subtitle: "Hormones, syndromes & adrenal masses",
  icon: "triangle",
  colorKey: "topicAdrenal",
  sections: [
    {
      title: "Anatomy & Physiology",
      points: [
        "Retroperitoneal endocrine glands enclosed in Gerota fascia (also called suprarenal glands).",
        "Controlled by the hypothalamus → anterior pituitary → ACTH.",
        "Cortex (outer): zona glomerulosa, zona fasciculata, zona reticularis.",
        "Cortex hormones: aldosterone (BP via sodium & water), androgens, cortisol (fat, carb & protein use).",
        "Medulla (inner): epinephrine (adrenaline, primary) and norepinephrine — fight-or-flight.",
      ],
    },
    {
      title: "Vascular Anatomy",
      points: [
        "Three arteries: suprarenal branches of the inferior phrenic arteries, aorta and renal arteries.",
        "Right suprarenal vein → IVC directly. Left suprarenal vein → left renal vein.",
      ],
    },
    {
      title: "Sonography of the Adrenals",
      points: [
        "Not routinely seen in adults (surrounding fat).",
        "Easily seen in fetus & pediatric patients: hypoechoic, anterior, medial and superior to the upper pole of the kidney.",
      ],
    },
    {
      title: "Addison Disease",
      points: [
        "Primary adrenocortical insufficiency — hypofunction of the cortex; inadequate corticosteroids.",
        "Findings: ↑ ACTH, hypotension, weakness, fatigue, weight loss, bronzing of skin (hyperpigmentation).",
        "Labs: elevated liver enzymes, hyperkalemia, hyponatremia.",
        "Acute: enlarged hemorrhagic glands. Chronic: atrophic, calcified glands.",
      ],
    },
    {
      title: "Cushing & Conn Syndromes",
      points: [
        "Cushing — excess cortisol; often from an adrenal or pituitary adenoma.",
        "Cushing signs: obesity, thin arms & legs, hypertension, hirsutism, hyperglycemia, fatigue.",
        "Conn — excess aldosterone from a functioning cortical tumor.",
        "Conn signs: hypertension, excessive thirst & urination, hypernatremia, hypokalemia.",
      ],
    },
    {
      title: "Adrenal Adenoma",
      points: [
        "Benign solid mass; hyperfunctioning (Cushing or Conn) or nonhyperfunctioning.",
        "Sono: solid hypoechoic mass in the adrenal region; CT/MRI may be needed to separate from liver/kidney masses.",
      ],
    },
    {
      title: "Pheochromocytoma",
      points: [
        "Benign mass of the adrenal medulla causing uncontrollable hypertension.",
        "Also headaches, tachycardia, tremors, anxiety, excessive sweating.",
        "Sono: large echogenic mass in the adrenal region.",
      ],
    },
    {
      title: "Cysts, Rests & Malignancy",
      points: [
        "Adrenal cysts — hard to separate from liver, spleen or upper pole kidney; hemorrhagic/infected/large cysts cause pain.",
        "Adrenal rests — accessory tissue in testes, epididymis, ovaries, inguinal canal; respond to ACTH; linked to congenital adrenal hyperplasia & Cushing.",
        "Primary adrenal cancer is rare; functional tumors can cause Cushing symptoms.",
        "Metastases: lung, breast, colon, kidney, melanoma.",
      ],
    },
    {
      title: "Neuroblastoma",
      points: [
        "Most common extracranial solid malignant tumor in children; usually before age 5.",
        "Palpable abdominal mass; metastasis often present at diagnosis.",
        "Sono: large heterogeneous solid mass with calcifications; may encase IVC & aorta. Check liver for mets.",
      ],
    },
    {
      title: "Adrenal Hemorrhage",
      points: [
        "Spontaneous bleed, especially in stressed neonates.",
        "Echogenic acutely → heterogeneous/hypoechoic → cystic → resolves.",
        "Abdominal mass with acute drop in hematocrit and blood pressure.",
      ],
    },
  ],
  flashcards: [
    ["Hormone from the pituitary controlling the adrenals", "ACTH (adrenocorticotropic hormone)."],
    ["Three zones of the adrenal cortex", "Glomerulosa, fasciculata, reticularis."],
    ["Primary hormone of the adrenal medulla", "Epinephrine (adrenaline)."],
    ["Aldosterone function", "Regulates BP by controlling sodium and water."],
    ["Left suprarenal vein drains into…", "The left renal vein (right drains into IVC)."],
    ["Where adrenals are easily seen", "Fetus and pediatric patients — hypoechoic, above the upper pole of the kidney."],
    ["Addison disease", "Adrenocortical insufficiency — hypotension, bronzed skin, hyperkalemia, hyponatremia."],
    ["Cushing syndrome", "Excess cortisol — obesity, thin limbs, hypertension, hirsutism, hyperglycemia."],
    ["Conn syndrome", "Excess aldosterone — hypertension, hypernatremia, hypokalemia, thirst."],
    ["Pheochromocytoma", "Benign medullary tumor → uncontrollable hypertension; large echogenic mass."],
    ["Adrenal rests", "Accessory adrenal tissue in testes, ovaries, epididymis, inguinal canal."],
    ["Most common extracranial solid malignancy in children", "Neuroblastoma."],
    ["Evolution of adrenal hemorrhage", "Echogenic → heterogeneous/hypoechoic → cystic → resolves."],
  ],
  quiz: [
    { q: "The adrenal glands are enclosed within:", options: ["Glisson capsule", "Gerota fascia", "The lesser sac", "The peritoneum"], answer: 1, explanation: "Like the kidneys, the adrenals lie within Gerota fascia." },
    { q: "Which hormone is produced by the adrenal medulla?", options: ["Aldosterone", "Cortisol", "Epinephrine", "ACTH"], answer: 2, explanation: "The medulla produces epinephrine and norepinephrine." },
    { q: "The right suprarenal vein drains into the:", options: ["Right renal vein", "IVC", "Portal vein", "Splenic vein"], answer: 1, explanation: "Right → IVC; left → left renal vein." },
    { q: "Bronzing of the skin, hypotension and hyperkalemia suggest:", options: ["Cushing", "Conn", "Addison", "Pheochromocytoma"], answer: 2, explanation: "Addison disease = adrenocortical insufficiency." },
    { q: "Hypertension with hypokalemia and excessive thirst suggests:", options: ["Conn syndrome", "Addison disease", "Neuroblastoma", "Adrenal cyst"], answer: 0, explanation: "Conn = excess aldosterone." },
    { q: "Excess cortisol production is called:", options: ["Conn syndrome", "Cushing syndrome", "Addison disease", "Waterhouse"], answer: 1, explanation: "Cushing syndrome = high cortisol." },
    { q: "A benign adrenal mass causing uncontrollable hypertension is a:", options: ["Adenoma", "Pheochromocytoma", "Neuroblastoma", "Myelolipoma"], answer: 1, explanation: "Pheochromocytoma arises from the medulla." },
    { q: "An adrenal adenoma most often appears:", options: ["Solid and hypoechoic", "Anechoic", "Calcified and shadowing", "Echogenic and huge"], answer: 0, explanation: "Typically a solid hypoechoic mass." },
    { q: "A large heterogeneous calcified suprarenal mass in a 2-year-old is most likely:", options: ["Wilms tumor", "Neuroblastoma", "Adrenal cyst", "Pheochromocytoma"], answer: 1, explanation: "Neuroblastoma — often calcified, may encase vessels." },
    { q: "Spontaneous adrenal hemorrhage is most common in:", options: ["Elderly men", "Stressed neonates", "Pregnant women", "Athletes"], answer: 1, explanation: "Stressed neonates are at risk." },
  ],
  mnemonics: [
    { title: "Cortex zones & hormones", device: "“GFR = Salt, Sugar, Sex”", meaning: "Glomerulosa → aldosterone (salt); Fasciculata → cortisol (sugar); Reticularis → androgens (sex). The deeper you go, the sweeter it gets." },
    { title: "Cortex vs medulla", device: "“Medulla = Mad (fight-or-flight)”", meaning: "Medulla makes epinephrine & norepinephrine." },
    { title: "Syndromes", device: "“Cushing = Cortisol, Conn = Can't let go of salt, Addison = Adrenals Absent”", meaning: "Cushing: ↑ cortisol. Conn: ↑ aldosterone (Na retention, K loss). Addison: cortical insufficiency." },
    { title: "Pheochromocytoma", device: "“Pheo = Pressure, Pain (headache), Perspiration, Palpitations”", meaning: "Hypertension, headaches, sweating, tachycardia." },
    { title: "Suprarenal veins", device: "“Right goes Right in (IVC), Left takes the Long way (renal vein)”", meaning: "Right → IVC; left → left renal vein." },
  ],
};
