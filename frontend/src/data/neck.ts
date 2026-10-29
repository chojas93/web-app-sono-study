import { neckSections } from "./neckNotes";
import type { RawTopic } from "./types";

export const neck: RawTopic = {
  id: "neck",
  title: "The Neck",
  chapter: "Chapter 12",
  subtitle: "Salivary glands, thyroid, parathyroid & nodes",
  icon: "body",
  colorKey: "topicNeck",
  sections: neckSections,
  flashcards: [
    ["Largest salivary gland", "Parotid gland."],
    ["Normal thyroid lobe size", "~4–6 cm long, 2–3 cm AP & transverse; isthmus ≤ 6 mm."],
    ["Muscle posterolateral to the thyroid", "Longus colli."],
    ["Graves disease", "Autoimmune hyperthyroidism — diffusely enlarged gland, “thyroid inferno” on color Doppler."],
    ["Hashimoto thyroiditis", "Most common cause of hypothyroidism — heterogeneous gland with micronodules."],
    ["Most common thyroid malignancy", "Papillary carcinoma — microcalcifications, hypoechoic, taller-than-wide."],
    ["Comet-tail artifact in a thyroid nodule", "Colloid — suggests a benign colloid nodule."],
    ["TI-RADS", "Scoring system for thyroid nodule features (composition, echogenicity, shape, margin, echogenic foci)."],
    ["Parathyroid adenoma", "Hypoechoic oval mass posterior to the thyroid; hypercalcemia; most common cause of primary hyperparathyroidism."],
    ["Thyroglossal duct cyst", "Midline cyst near the hyoid bone."],
    ["Fibromatosis colli", "Infant SCM muscle enlargement — torticollis."],
    ["Cystic hygroma", "Lymphangioma of the neck — multiseptated cystic mass."],
  ],
  quiz: [],
  mnemonics: [
    { title: "Graves", device: "“Graves = Gland on fire (thyroid inferno)”", meaning: "Hyperthyroid, hypervascular, enlarged gland." },
    { title: "Hashimoto", device: "“Hashimoto Hypo”", meaning: "Hashimoto thyroiditis → hypothyroidism." },
    { title: "Papillary carcinoma", device: "“Papillary = Popular, Psammoma (microcalcs)”", meaning: "Most common thyroid cancer; microcalcifications." },
    { title: "Thyroglossal cyst", device: "“Thyroglossal = Tongue to Thyroid, Midline”", meaning: "Midline neck cyst along the thyroglossal duct path near the hyoid." },
  ],
};
