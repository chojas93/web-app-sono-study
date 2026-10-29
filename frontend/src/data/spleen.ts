import type { RawTopic } from "./types";

export const spleen: RawTopic = {
  id: "spleen",
  title: "The Spleen",
  chapter: "Chapter 6",
  subtitle: "Anatomy, splenomegaly, infarcts & masses",
  icon: "shield",
  colorKey: "topicSpleen",
  sections: [
    {
      title: "Anatomy & Physiology",
      points: [
        "Largest reticuloendothelial organ and largest lymphatic organ; intraperitoneal in the LUQ below the diaphragm.",
        "Main job: filter the peripheral blood.",
        "Fetus: erythropoiesis. Childhood: defense against infection. Adult: produces lymphocytes and monocytes.",
        "Hematopoiesis can return in severe anemia — extramedullary hematopoiesis.",
        "White pulp = lymphatic function. Red pulp = phagocytic function.",
        "Culling removes irregular cells; pitting cleans RBCs of unwanted material.",
      ],
    },
    {
      title: "Vascular Anatomy",
      points: [
        "Splenic artery: branch of the celiac trunk; marks the superior border of the pancreatic body & tail; enters hilum superior & anterior to splenic vein.",
        "Splenic vein runs along the posterior pancreatic body & tail and joins the SMV behind the pancreatic neck to form the portal vein.",
      ],
    },
    {
      title: "Sonography of the Spleen",
      points: [
        "Best seen with deep inspiration, patient lying on the right side.",
        "Normally isoechoic to the liver (may be slightly less echogenic).",
        "Concave pointed inferior margin, convex superior border; hilum on the medial surface.",
        "Size varies with age and sex; decreases with advancing age.",
      ],
    },
    {
      title: "Congenital Anomalies",
      points: [
        "Accessory spleen (splenule, splenunculus, supernumerary spleen) — near hilum or pancreatic tail, isoechoic to spleen.",
        "Splenic cleft — hyperechoic line dividing the spleen; common.",
        "Asplenia (absent) and polysplenia (multiple small spleens) — linked with cardiac malformations & heterotaxia.",
        "Splenosis — ectopic splenic implants after rupture.",
        "Wandering spleen — absent/lax ligaments → hypermobile, risk of torsion.",
      ],
    },
    {
      title: "WBC Assessment",
      points: [
        "Leukocytosis — ↑ WBC: infection/inflammation, but also acute leukemia.",
        "Leukopenia — ↓ WBC: leukemia, Hodgkin lymphoma, hypersplenism, viral infection, diabetes, radiation/chemo.",
      ],
    },
    {
      title: "Splenomegaly",
      points: [
        "Most common splenic abnormality.",
        "Abnormal: > 12–13 cm length or > 6 cm thickness.",
        "Most common cause: portal hypertension. Others: AIDS, mononucleosis, leukemia, lymphoma, pediatric sickle cell crisis, trauma.",
        "Massive splenomegaly can rupture spontaneously.",
      ],
    },
    {
      title: "Splenic Cysts & Abscess",
      points: [
        "True cyst: thin walls, anechoic, posterior enhancement.",
        "Complex cysts: post-traumatic, displaced pancreatic pseudocyst, congenital, hydatid, cystic metastasis.",
        "Abscess: usually complex, may be hypoechoic with debris; gas → dirty shadowing. Fungal abscesses can look like target lesions.",
      ],
    },
    {
      title: "Splenic Infarct",
      points: [
        "Tissue death from oxygen deprivation — bacterial endocarditis, tumor embolization, vasculitis, lymphoma.",
        "Acute: hypoechoic wedge-shaped area. Chronic: more echogenic.",
      ],
    },
    {
      title: "Splenic Trauma",
      points: [
        "Frequently injured in blunt trauma; LUQ pain and ↓ hematocrit.",
        "Fresh bleeds may be isoechoic and hard to see; subcapsular or intraparenchymal.",
        "Laceration may appear as an echogenic line right after trauma.",
      ],
    },
    {
      title: "Benign Masses & Granulomas",
      points: [
        "Hemangioma — most common benign splenic tumor; well-defined hyperechoic mass; asymptomatic.",
        "Granulomas — small echogenic shadowing foci; history of histoplasmosis, TB, sarcoidosis.",
        "Hamartoma — benign, usually hypoechoic; Beckwith–Wiedemann & tuberous sclerosis.",
        "Lymphangioma (pediatric) — multicystic mass with hyperechoic septations.",
      ],
    },
    {
      title: "Malignant Disease",
      points: [
        "Primary malignant tumor (rare): angiosarcoma — complex or solid mass.",
        "Lymphoma is the most common splenic malignancy; diffuse disease → splenomegaly; focal → hypoechoic masses.",
        "Reed–Sternberg cells = Hodgkin lymphoma (high recovery rate). Non-Hodgkin is more common & harder to manage.",
        "Metastases are rare & late: breast, lung, melanoma, ovary.",
      ],
    },
    {
      title: "Sickle Cell Anemia",
      points: [
        "Crescent-shaped RBCs obstruct vascular channels.",
        "Spleen enlarges during crisis; repeated infarcts → fibrotic, atrophic spleen = autosplenectomy.",
        "Increased risk of organ damage, blindness, gallstones, strokes.",
      ],
    },
  ],
  flashcards: [
    ["Largest lymphatic organ", "The spleen."],
    ["Splenic function of white pulp vs red pulp", "White = lymphatic; red = phagocytic."],
    ["Culling vs pitting", "Culling removes irregular cells; pitting cleans RBCs of unwanted material."],
    ["Extramedullary hematopoiesis", "Return of the spleen's blood-forming function in severe anemia."],
    ["Splenic artery is a branch of…", "The celiac trunk."],
    ["Best patient position for the spleen", "Right lateral decubitus with deep inspiration."],
    ["Normal splenic echogenicity", "Isoechoic (or slightly less echogenic) to the liver."],
    ["Splenule", "Accessory spleen — near hilum or pancreatic tail."],
    ["Splenomegaly measurements", "> 12–13 cm long or > 6 cm thick."],
    ["Most common cause of splenomegaly", "Portal hypertension."],
    ["Acute splenic infarct appearance", "Hypoechoic wedge-shaped area."],
    ["Most common benign splenic tumor", "Hemangioma."],
    ["Small echogenic shadowing foci in spleen", "Granulomas (histoplasmosis, TB, sarcoidosis)."],
    ["Most common splenic malignancy", "Lymphoma."],
    ["Reed–Sternberg cells", "Hodgkin lymphoma."],
    ["Autosplenectomy", "Fibrotic, atrophic spleen from repeated infarcts in sickle cell anemia."],
  ],
  quiz: [
    { q: "The spleen is located in the:", options: ["RUQ", "LUQ", "Epigastrium", "Retroperitoneum"], answer: 1, explanation: "The spleen is an intraperitoneal organ in the LUQ just below the diaphragm." },
    { q: "In the fetus the spleen is responsible for:", options: ["Bile production", "Erythropoiesis", "Insulin secretion", "Filtering urine"], answer: 1, explanation: "Fetal spleen produces red blood cells (erythropoiesis)." },
    { q: "The phagocytic function of the spleen is performed by the:", options: ["White pulp", "Red pulp", "Hilum", "Capsule"], answer: 1, explanation: "Red pulp is phagocytic; white pulp is lymphatic." },
    { q: "Splenomegaly is suspected when splenic length exceeds:", options: ["8 cm", "10 cm", "12–13 cm", "18 cm"], answer: 2, explanation: "> 12–13 cm long or > 6 cm thick." },
    { q: "The most common cause of splenomegaly is:", options: ["Mononucleosis", "Portal hypertension", "Trauma", "Lymphoma"], answer: 1, explanation: "Portal hypertension is most common." },
    { q: "A hyperechoic line dividing the spleen is most likely a:", options: ["Laceration", "Splenic cleft", "Infarct", "Granuloma"], answer: 1, explanation: "A splenic cleft is a common congenital anomaly." },
    { q: "A hypermobile spleen lacking ligaments that may twist is a:", options: ["Wandering spleen", "Splenosis", "Polysplenia", "Splenule"], answer: 0, explanation: "Wandering spleen can undergo torsion." },
    { q: "An acute splenic infarct appears as a:", options: ["Hyperechoic round mass", "Hypoechoic wedge-shaped area", "Anechoic cyst", "Shadowing focus"], answer: 1, explanation: "Acute infarcts are hypoechoic and wedge-shaped; chronic are more echogenic." },
    { q: "The most common benign tumor of the spleen is the:", options: ["Hamartoma", "Lymphangioma", "Hemangioma", "Angiosarcoma"], answer: 2, explanation: "Hemangioma — usually a well-defined hyperechoic mass." },
    { q: "Multiple small shadowing echogenic foci in the spleen suggest:", options: ["Granulomas", "Metastases", "Infarcts", "Lymphoma"], answer: 0, explanation: "Granulomas from histoplasmosis, TB or sarcoidosis." },
    { q: "The most common malignancy of the spleen is:", options: ["Angiosarcoma", "Lymphoma", "Melanoma metastasis", "Hamartoma"], answer: 1, explanation: "Lymphoma is the most common splenic malignancy." },
    { q: "Autosplenectomy is associated with:", options: ["Portal hypertension", "Sickle cell anemia", "Mononucleosis", "Trauma"], answer: 1, explanation: "Repeated infarcts in sickle cell anemia shrink the spleen." },
  ],
  mnemonics: [
    { title: "Pulp functions", device: "“White = Warriors, Red = Recyclers”", meaning: "White pulp: lymphatic/immune. Red pulp: phagocytic (engulfs pathogens & old cells)." },
    { title: "Culling vs pitting", device: "“Cull the Crooked, Pit the Particles”", meaning: "Culling removes irregular cells; pitting removes material from RBCs." },
    { title: "Splenomegaly limit", device: "“12-13 long, 6 thick”", meaning: "Spleen > 12–13 cm length or > 6 cm thickness = enlarged." },
    { title: "Infarct shape", device: "“Infarcts are Pizza slices”", meaning: "Acute infarct = hypoechoic wedge; chronic = echogenic." },
    { title: "Hodgkin lymphoma", device: "“Reed–Sternberg = Hodgkin Has it”", meaning: "Reed–Sternberg cells identify Hodgkin lymphoma." },
  ],
};
