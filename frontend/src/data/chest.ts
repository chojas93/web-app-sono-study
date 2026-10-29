import type { RawTopic } from "./types";

export const chest: RawTopic = {
  id: "chest",
  title: "Noncardiac Chest & Retroperitoneum",
  chapter: "Chapter 11",
  subtitle: "Effusions, pneumothorax, nodes & fibrosis",
  icon: "fitness",
  colorKey: "topicChest",
  sections: [
    {
      title: "Noncardiac Chest Anatomy",
      points: [
        "Left lung: superior & inferior lobes. Right lung: superior, middle & inferior lobes.",
        "Visceral pleura covers the lung; parietal pleura lines the chest wall.",
        "Pleural space holds a small amount of fluid so lungs slide with respiration.",
      ],
    },
    {
      title: "Pleural & Pericardial Effusion",
      points: [
        "Always evaluate the lower chest for pleural effusion during abdominal exams.",
        "Simple pleural fluid is anechoic, dependent; the lung may float within it.",
        "Complex fluid suggests infection or blood.",
        "Thoracentesis — diagnostic or therapeutic; complication: pneumothorax (confirmed by chest radiograph).",
        "Pericardial effusion appears as anechoic fluid around the heart.",
      ],
    },
    {
      title: "Pneumothorax",
      points: [
        "Free air in the chest outside the lungs → possible lung collapse.",
        "M-mode: seashore sign = normal lung sliding; barcode (stratosphere) sign = pneumothorax.",
      ],
    },
    {
      title: "Lung Masses & Consolidation",
      points: [
        "Superficial lung masses can be evaluated and biopsied with sonography.",
        "Pediatric: pulmonary sequestration, cystic adenomatoid malformation. Mediastinal: lymphoma, thymoma.",
        "Consolidation — alveoli filled with fluid, inflammation, blood or tumor (pneumonia, edema, hemorrhage, carcinoma).",
        "Looks like liver/spleen tissue with linear echoes from air in bronchi (air bronchograms); often with pleural effusion.",
      ],
    },
    {
      title: "Retroperitoneum Anatomy",
      points: [
        "Posterior to the parietal peritoneum, anterior to the transversalis fascia; diaphragm to pelvic brim.",
        "Vessels: aorta, IVC, SMA, hepatic artery, splenic artery & vein.",
        "Muscles next to kidneys: psoas and quadratus lumborum.",
        "Diaphragmatic crura — hypoechoic linear muscle anterior to the spine, attaching to upper lumbar vertebrae.",
      ],
    },
    {
      title: "Retroperitoneal Lymphadenopathy",
      points: [
        "Normal nodes usually not seen; < 1 cm. Located in mesentery, renal hilum and along the aorta.",
        "> 1 cm suggests infection or malignancy (e.g., lymphoma).",
        "“Sandwich” sign — nodes surrounding/compressing the aorta and IVC.",
        "Enlarged nodes become hypoechoic or even anechoic.",
      ],
    },
    {
      title: "Retroperitoneal Fibrosis & Hematoma",
      points: [
        "Fibrosis: fibrous mass covering aorta, IVC, ureters and sacrum; cause usually unknown (infection, migraine meds, malignancy, aneurysm leak).",
        "Symptoms: back/flank pain, weight loss, N/V, malaise. Sono: large hypoechoic mass surrounding the aorta.",
        "Hematoma: most common in the psoas muscle, especially in hemophiliacs; also trauma & surgery.",
        "Hematoma labs: ↓ hematocrit; appearance hypoechoic, complex or hyperechoic depending on age.",
      ],
    },
  ],
  flashcards: [
    ["Number of lobes in the right lung", "Three — superior, middle, inferior."],
    ["Pleura covering the lung surface", "Visceral pleura."],
    ["Simple pleural effusion appearance", "Anechoic, dependent fluid; lung may float within it."],
    ["Complication of thoracentesis", "Pneumothorax."],
    ["Normal M-mode lung sign", "Seashore sign."],
    ["M-mode sign of pneumothorax", "Barcode sign."],
    ["Lung consolidation appearance", "Tissue-like (liver/spleen) with linear air bronchogram echoes."],
    ["Boundaries of the retroperitoneum", "Posterior parietal peritoneum to transversalis fascia; diaphragm to pelvic brim."],
    ["Muscles seen next to the kidneys", "Psoas and quadratus lumborum."],
    ["Abnormal lymph node size", "> 1 cm."],
    ["“Sandwich” sign", "Enlarged nodes surrounding the aorta and IVC (e.g., lymphoma)."],
    ["Retroperitoneal fibrosis appearance", "Large hypoechoic mass surrounding the aorta."],
    ["Most common site of retroperitoneal hematoma", "Psoas muscle (especially hemophiliacs)."],
  ],
  quiz: [
    { q: "The left lung typically has how many lobes?", options: ["One", "Two", "Three", "Four"], answer: 1, explanation: "Left: superior & inferior. Right: three." },
    { q: "Complex pleural fluid suggests:", options: ["Normal finding", "Infection or blood", "Pneumothorax", "Ascites"], answer: 1, explanation: "Internal echoes suggest infection (empyema) or hemorrhage." },
    { q: "A complication of thoracentesis is:", options: ["Pneumothorax", "Ascites", "Lymphadenopathy", "Consolidation"], answer: 0, explanation: "Pneumothorax — confirmed with chest radiograph." },
    { q: "On M-mode, the barcode sign indicates:", options: ["Normal lung", "Pneumothorax", "Pleural effusion", "Consolidation"], answer: 1, explanation: "Barcode = pneumothorax; seashore = normal." },
    { q: "Tissue-like lung with linear bright echoes from air in bronchi is:", options: ["Pneumothorax", "Consolidation", "Effusion", "Sequestration"], answer: 1, explanation: "Lung consolidation with air bronchograms." },
    { q: "The retroperitoneum is bounded inferiorly by the:", options: ["Diaphragm", "Pelvic brim", "Umbilicus", "Kidneys"], answer: 1, explanation: "Diaphragm superiorly; pelvic brim inferiorly." },
    { q: "Hypoechoic linear muscles anterior to the spine are the:", options: ["Psoas", "Diaphragmatic crura", "Rectus abdominis", "Quadratus lumborum"], answer: 1, explanation: "The crura extend caudally anterior to the spine." },
    { q: "Abdominal lymph nodes are considered enlarged when larger than:", options: ["0.5 cm", "1 cm", "2 cm", "3 cm"], answer: 1, explanation: "> 1 cm suggests infection or malignancy." },
    { q: "Nodes surrounding the aorta and IVC create the:", options: ["Sandwich sign", "Seashore sign", "Target sign", "Mickey sign"], answer: 0, explanation: "The “sandwich” sign — classic for lymphoma." },
    { q: "A hemophiliac patient's retroperitoneal hematoma is most likely in the:", options: ["Psoas muscle", "Adrenal gland", "Perirenal fat", "Lesser sac"], answer: 0, explanation: "The psoas is the most common site." },
  ],
  mnemonics: [
    { title: "Lung lobes", device: "“Right has 3 (three letters in ‘yes’), Left has 2 (heart takes room)”", meaning: "Right lung: 3 lobes. Left lung: 2 lobes." },
    { title: "M-mode lung", device: "“Beach = Breathing, Barcode = Bad”", meaning: "Seashore sign = normal sliding; barcode sign = pneumothorax." },
    { title: "Lymph nodes", device: "“Over 1 = Worry some”", meaning: "Abdominal nodes > 1 cm are abnormal." },
    { title: "Sandwich sign", device: "“Nodes are the bread, vessels are the filling”", meaning: "Enlarged nodes surround the aorta and IVC (lymphoma)." },
  ],
};
