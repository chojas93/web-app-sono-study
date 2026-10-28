import type { RawTopic } from "./types";

export const overview: RawTopic = {
  id: "overview",
  title: "Abdominal Sonography Overview",
  chapter: "Chapter 1",
  subtitle: "Terms, prep, patient care, artifacts & FAST",
  icon: "scan",
  colorKey: "topicOverview",
  sections: [
    {
      title: "Sonographic Descriptive Terms",
      points: [
        "Anechoic — without echoes (black on the image).",
        "Hyperechoic — having many echoes (brighter than surrounding tissue).",
        "Hypoechoic — having few echoes (darker than surrounding tissue).",
        "Isoechoic — having the same echogenicity as surrounding tissue.",
      ],
    },
    {
      title: "Echogenicity of Abdominal Organs",
      points: [
        "Normal order from greatest (brightest) to least (darkest):",
        "Renal sinus → pancreas → spleen → liver → renal cortex → renal pyramids → gallbladder.",
      ],
    },
    {
      title: "Simple Cyst Criteria (STAR)",
      points: [
        "Smooth walls/borders, Through transmission, Anechoic, Round shape.",
        "High-frequency transducers may show a tiny amount of internal debris in a simple cyst.",
        "Large debris, septations, mural nodules or a fluid–fluid level = complex cyst.",
      ],
    },
    {
      title: "Patient Preparation",
      points: [
        "Abdominal sonogram (especially with a gallbladder): fast 8 hours; some authors suggest 6 hours is enough.",
        "Emergency/nonfasting patients can still be scanned diagnostically.",
        "Renal sonograms: fasting not typically required; patient may be asked to be well hydrated (bladder assessment).",
        "Diabetic patients who must fast should be scheduled early in the morning to prevent hypoglycemia.",
        "Perform abdominal sonography before radiographic exams that use barium.",
        "Small part sonography (scrotum, thyroid) requires no preparation.",
      ],
    },
    {
      title: "Clinical History & Key Labs",
      points: [
        "Review prior sonograms, CT, MRI, nuclear medicine, radiography, endoscopy and lab reports.",
        "Correlating clinical and sonographic findings gives the most targeted exam.",
        "Leukocytosis (↑ WBC) = inflammatory response/infection — think any “-itis” or abscess.",
        "Decreased hematocrit = bleeding.",
      ],
    },
    {
      title: "Basic Patient Care",
      points: [
        "Body temperature 98.6 °F (oral).",
        "Adult pulse 60–100 beats/min; respiration 12–20 breaths/min; BP < 120/80 mm Hg.",
        "IV bag must stay elevated to prevent retrograde flow.",
        "Urinary bag stays below the bladder to prevent retrograde urine flow and UTI.",
        "UTI is one of the most common nosocomial (hospital-acquired) infections.",
      ],
    },
    {
      title: "Infection Control",
      points: [
        "Standard precautions (formerly universal): hand hygiene, PPE, safe injection practices, safe handling of contaminated equipment/surfaces, respiratory hygiene/cough etiquette.",
        "CDC recommends alcohol-based hand rub as the primary mode of hand hygiene; wash with soap when hands are visibly soiled.",
        "Wear gloves (change between patients); be mindful of latex allergies.",
        "Use probe covers for endocavity exams; sterile covers and sterile gel for invasive procedures.",
        "Disinfect transducer, machine and stretcher after every exam.",
      ],
    },
    {
      title: "Invasive & Sterile Procedures",
      points: [
        "Informed consent and lab results are obtained first.",
        "Coagulopathy labs: PT, PTT, INR, fibrinogen and platelets.",
        "Sterile field preparation and surgical (sterile) asepsis must be maintained.",
      ],
    },
    {
      title: "Instrumentation",
      points: [
        "Higher frequency = better resolution but poorer penetration.",
        "Lower frequency = better penetration with less resolution.",
        "Linear array 7.5–18 MHz+: superficial structures — thyroid, scrotum, breast, MSK, appendix, pylorus.",
        "Curved array 2.0–5.0 MHz: general abdomen — liver, aorta, pancreas.",
      ],
    },
    {
      title: "Imaging Artifacts",
      points: [
        "Anisotropy — tendons/fibers appear hypoechoic when the beam is not perpendicular.",
        "Comet tail — tapering reverberation from tiny strong reflectors (e.g., cholesterol crystals).",
        "Clean shadow (stones/bone) vs dirty shadow (gas).",
        "Edge artifact — refractive shadowing at the edges of curved structures.",
        "Mirror image — duplicate structure deep to a strong reflector (e.g., diaphragm).",
        "Acoustic enhancement — brightness deep to fluid-filled structures.",
        "Refraction, reverberation, ring down, side lobes and slice thickness artifacts.",
      ],
    },
    {
      title: "Doppler Artifacts",
      points: [
        "Pulsed Doppler aliasing and color Doppler aliasing (sampling too slowly for the velocity).",
        "Doppler noise and the wall filter.",
        "Twinkle artifact — rapidly changing color behind rough, strong reflectors such as stones or calcifications.",
      ],
    },
    {
      title: "Body Systems & Peritoneum",
      points: [
        "Body systems work together to preserve homeostasis — the tendency to maintain internal equilibrium.",
        "Know which organs are intraperitoneal vs retroperitoneal, the peritoneal spaces, and pathologies associated with ascites.",
      ],
    },
    {
      title: "Abdominal Pathology Overview",
      points: [
        "Mass = neoplasm/tumor: benign, potentially malignant (precancerous) or malignant.",
        "Malignant tumors invade adjacent tissue and can metastasize; benign typically do not.",
        "Mass effect — a tumor displacing adjacent anatomy, causing symptoms such as pain.",
        "Pediatric malignant tumors often contain “blast”: hepatoblastoma, neuroblastoma, nephroblastoma.",
        "Sign = objective, observed by others (fever, vomiting, elevated labs). Symptom = subjective, felt by the patient (nausea, headache, pain).",
        "Cancer often presents vaguely: weight loss, fever, fatigue, pain, skin changes.",
        "Tumor markers — substances produced by cancer cells or by organs in response to cancer.",
      ],
    },
    {
      title: "FAST Exam",
      points: [
        "Point-of-care sonography assessing abdomen and pelvis for free fluid after trauma.",
        "eFAST adds lungs (pneumothorax) and heart (pericardial effusion).",
        "Views: RUQ, LUQ, pelvis, pericardium, anterior thorax, pericolic gutters, pleural spaces, parasternal and apical heart.",
      ],
    },
  ],
  flashcards: [
    ["Anechoic", "Without echoes."],
    ["Hypoechoic", "Having few echoes."],
    ["Isoechoic", "Having the same echogenicity as surrounding tissue."],
    ["Order of organ echogenicity (brightest → darkest)", "Renal sinus → pancreas → spleen → liver → renal cortex → renal pyramids → gallbladder."],
    ["STAR criteria", "Simple cyst: Smooth walls, Through transmission, Anechoic, Round."],
    ["Recommended fasting time for abdominal sonogram", "8 hours (some authors suggest 6)."],
    ["When should diabetic fasting patients be scheduled?", "Early in the morning, to prevent hypoglycemia."],
    ["Leukocytosis indicates…", "Inflammatory response, usually infection."],
    ["Decreased hematocrit indicates…", "Bleeding."],
    ["Normal adult pulse & respiration", "Pulse 60–100 bpm; respiration 12–20 breaths/min."],
    ["Where should a urinary catheter bag be placed?", "Below the level of the bladder to prevent retrograde flow/UTI."],
    ["Primary mode of hand hygiene per CDC", "Alcohol-based hand rub."],
    ["Labs checked for coagulopathy before invasive procedures", "PT, PTT, INR, fibrinogen, platelets."],
    ["Frequency vs. resolution/penetration", "Higher frequency → better resolution, worse penetration."],
    ["Transducer for general abdominal imaging", "Curved array, 2.0–5.0 MHz."],
    ["Doppler artifact behind stones/calcifications", "Twinkle artifact."],
    ["Sign vs. symptom", "Sign is objective (observed); symptom is subjective (felt by patient)."],
    ["eFAST adds evaluation of…", "Lungs for pneumothorax and heart for pericardial effusion."],
  ],
  quiz: [
    {
      q: "Which organ is normally the MOST echogenic of the following?",
      options: ["Liver", "Pancreas", "Spleen", "Renal cortex"],
      answer: 1,
      explanation: "Order: renal sinus → pancreas → spleen → liver → renal cortex → renal pyramids → gallbladder. Of these, the pancreas is brightest.",
    },
    {
      q: "A structure with the same echogenicity as surrounding tissue is:",
      options: ["Hypoechoic", "Anechoic", "Isoechoic", "Hyperechoic"],
      answer: 2,
      explanation: "Isoechoic means having the same echogenicity.",
    },
    {
      q: "Which is NOT part of the simple cyst (STAR) criteria?",
      options: ["Smooth walls", "Through transmission", "Internal septations", "Round shape"],
      answer: 2,
      explanation: "Septations make a cyst complex. STAR = Smooth, Through transmission, Anechoic, Round.",
    },
    {
      q: "A diabetic patient requiring a fasting abdominal sonogram should be scheduled:",
      options: ["Late afternoon", "Early morning", "After lunch", "After a barium study"],
      answer: 1,
      explanation: "Early-morning scheduling prevents hypoglycemic episodes.",
    },
    {
      q: "Abdominal sonography should be performed ______ radiographic studies that use barium.",
      options: ["After", "Before", "During", "Instead of"],
      answer: 1,
      explanation: "Barium interferes with sonography, so the sonogram is performed first.",
    },
    {
      q: "A decrease in hematocrit most likely indicates:",
      options: ["Infection", "Bleeding", "Dehydration", "Liver failure"],
      answer: 1,
      explanation: "Decreased hematocrit indicates bleeding; leukocytosis indicates infection.",
    },
    {
      q: "Which is one of the most common causes of nosocomial infection?",
      options: ["Pneumonia", "Urinary tract infection", "Hepatitis B", "Skin abscess"],
      answer: 1,
      explanation: "UTI is one of the most common hospital-acquired infections.",
    },
    {
      q: "Which transducer is best for evaluating the appendix?",
      options: ["2–5 MHz curved array", "Phased array 2 MHz", "High-frequency linear array", "Vector array 3 MHz"],
      answer: 2,
      explanation: "High-frequency linear arrays (7.5–18 MHz) are used for superficial structures including the appendix and pylorus.",
    },
    {
      q: "Increasing transducer frequency results in:",
      options: ["Better penetration, worse resolution", "Better resolution, worse penetration", "Better both", "No change"],
      answer: 1,
      explanation: "Higher frequency improves resolution but sacrifices penetration.",
    },
    {
      q: "Labs used to evaluate for coagulopathies include all EXCEPT:",
      options: ["PT", "PTT", "Platelets", "Amylase"],
      answer: 3,
      explanation: "PT, PTT, INR, fibrinogen and platelets assess clotting. Amylase is a pancreatic enzyme.",
    },
    {
      q: "Which is a SYMPTOM rather than a sign?",
      options: ["Fever", "Vomiting", "Nausea", "Elevated WBC"],
      answer: 2,
      explanation: "Nausea is felt by the patient (subjective) — a symptom.",
    },
    {
      q: "Which pediatric tumor follows the “blast” theme of childhood malignancy?",
      options: ["Hemangioma", "Neuroblastoma", "Adenoma", "Lipoma"],
      answer: 1,
      explanation: "Hepatoblastoma, neuroblastoma and nephroblastoma are pediatric malignancies.",
    },
    {
      q: "The FAST exam primarily evaluates for:",
      options: ["Gallstones", "Free fluid after trauma", "Liver masses", "Appendicitis"],
      answer: 1,
      explanation: "FAST assesses the abdomen and pelvis for free fluid secondary to traumatic injury.",
    },
  ],
  mnemonics: [
    { title: "Simple cyst criteria", device: "STAR", meaning: "Smooth walls • Through transmission • Anechoic • Round" },
    {
      title: "Organ echogenicity (bright → dark)",
      device: "“Real Pancakes Seem Like Really Rich Goodies”",
      meaning: "Renal sinus → Pancreas → Spleen → Liver → Renal cortex → Renal pyramids → Gallbladder",
    },
    {
      title: "Standard precautions",
      device: "“Happy People Stay Safe & Respectful”",
      meaning: "Hand hygiene • PPE • Safe injections • Safe handling of equipment/surfaces • Respiratory hygiene",
    },
    { title: "Pediatric malignancy", device: "“BLAST = Baby cancer”", meaning: "Hepatoblastoma • Neuroblastoma • Nephroblastoma" },
    { title: "Sign vs symptom", device: "“Signs are Seen, Symptoms are Sensed”", meaning: "Signs = objective (observed). Symptoms = subjective (felt)." },
    { title: "Frequency trade-off", device: "“High freq = High detail, Low depth”", meaning: "↑ frequency → ↑ resolution, ↓ penetration" },
  ],
};
