import { mskSections } from "./mskNotes";
import type { RawTopic } from "./types";

export const msk: RawTopic = {
  id: "msk",
  title: "MSK, Breast & Superficial Structures",
  chapter: "Chapter 14",
  subtitle: "Tendons, hips, breast & superficial masses",
  icon: "barbell",
  colorKey: "topicMSK",
  sections: mskSections,
  flashcards: [
    ["Normal tendon appearance", "Echogenic fibrillar pattern (longitudinal)."],
    ["Anisotropy", "Tendon appears hypoechoic when the beam isn't perpendicular."],
    ["Tendonitis", "Thickened, hypoechoic tendon ± hyperemia."],
    ["Most commonly ruptured tendon in the body", "Achilles tendon."],
    ["DDH imaging method", "Graf technique (coronal) — alpha angle ≥ 60° normal; dynamic stress views."],
    ["Femoral head coverage normal", "≥ 50% coverage by the acetabulum."],
    ["Galactocele", "Milk-filled cyst in a lactating woman."],
    ["Gynecomastia", "Male breast tissue enlargement — hypoechoic tissue behind the nipple."],
    ["Ganglion cyst", "Anechoic cyst near a joint/tendon sheath, usually the wrist."],
    ["Baker cyst", "Popliteal cyst between the medial gastrocnemius head and semimembranosus tendon."],
    ["Cellulitis appearance", "Thickened echogenic subcutaneous tissue with “cobblestone” hypoechoic strands."],
    ["Foreign body", "Echogenic focus ± shadowing, often with a hypoechoic halo."],
  ],
  quiz: [],
  mnemonics: [
    { title: "Tendon checks", device: "“Fibrils are Fine, Hypo is Hurt”", meaning: "Normal tendon is fibrillar/echogenic; hypoechoic thickening = tendonitis." },
    { title: "Graf alpha angle", device: "“60 is the hip-safe number”", meaning: "Alpha angle ≥ 60° and ≥ 50% coverage = normal infant hip." },
    { title: "Baker cyst", device: "“Baker bakes behind the knee, between Gastroc & Semimem”", meaning: "Popliteal cyst between medial gastrocnemius and semimembranosus." },
    { title: "Cellulitis", device: "“Cobblestone = Cellulitis”", meaning: "Hypoechoic fluid strands through echogenic fat." },
  ],
};
