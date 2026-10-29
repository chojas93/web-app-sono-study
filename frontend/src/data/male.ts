import { maleSections } from "./maleNotes";
import type { RawTopic } from "./types";

export const male: RawTopic = {
  id: "male",
  title: "The Male Pelvis",
  chapter: "Chapter 13",
  subtitle: "Scrotum, testes, penis & prostate",
  icon: "male",
  colorKey: "topicMale",
  sections: maleSections,
  flashcards: [
    ["Cryptorchidism", "Undescended testis — most often in the inguinal canal; ↑ cancer risk."],
    ["Testicular torsion findings", "Absent/decreased intratesticular flow, enlarged hypoechoic testis; whirlpool of the cord."],
    ["Bell clapper deformity", "Tunica vaginalis surrounds testis completely — predisposes to torsion."],
    ["Hydrocele location", "Between the two layers of the tunica vaginalis."],
    ["Varicocele", "Dilated pampiniform plexus veins (> 2–3 mm), usually left; increase with Valsalva."],
    ["Spermatocele vs epididymal cyst", "Spermatocele contains sperm (low-level echoes), usually in epididymal head."],
    ["Epididymo-orchitis", "Enlarged hypoechoic epididymis ± testis with increased flow."],
    ["Most common testicular malignancy", "Seminoma — homogeneous hypoechoic mass."],
    ["Testicular tumor markers", "AFP, hCG, LDH."],
    ["Testicular microlithiasis", "Multiple tiny nonshadowing echogenic foci in the testis."],
    ["Peyronie disease", "Fibrous plaques of the tunica albuginea — penile curvature."],
    ["Prostate zone where most cancers arise", "Peripheral zone."],
    ["BPH arises in…", "Transition zone."],
    ["Normal PSA", "< 4 ng/mL."],
  ],
  quiz: [],
  mnemonics: [
    { title: "Testicular tumor markers", device: "“A Healthy Lad”", meaning: "AFP • hCG • LDH" },
    { title: "Prostate zones", device: "“Peripheral = Problem (cancer), Transition = Tummy growth (BPH)”", meaning: "Cancer: peripheral zone. BPH: transition zone." },
    { title: "Varicocele side", device: "“Left is Long”", meaning: "Left testicular vein drains into the long left renal vein → more varicoceles on the left." },
    { title: "Torsion", device: "“No flow, Go (to surgery)”", meaning: "Absent flow in a painful testis is a surgical emergency." },
    { title: "Seminoma", device: "“Seminoma = Smooth & Solid, hypo”", meaning: "Homogeneous hypoechoic mass; most common testicular malignancy." },
  ],
};
