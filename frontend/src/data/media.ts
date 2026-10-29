import type { TopicMedia } from "./types";

export const media: Record<string, TopicMedia> = {
  overview: {
    sectionImages: [
      { section: "Imaging Artifacts", key: "ov_comet", caption: "Comet tail artifact" },
      { section: "Imaging Artifacts", key: "ov_shadow", caption: "Clean shadow (CS) vs dirty shadow (DS)" },
      { section: "Imaging Artifacts", key: "ov_mirror", caption: "Mirror image artifact at the diaphragm" },
      { section: "Imaging Artifacts", key: "ov_enhance", caption: "Acoustic enhancement deep to a cyst" },
      { section: "Imaging Artifacts", key: "ov_reverb", caption: "Reverberation artifact" },
      { section: "Imaging Artifacts", key: "ov_ringdown", caption: "Ring down artifact" },
      { section: "Doppler Artifacts", key: "ov_twinkle", caption: "Twinkle artifact behind a stone" },
    ],
    imageCards: [
      { key: "ov_shadow", front: "Name the two shadow types labeled CS and DS", back: "Clean shadow (stone/bone) and dirty shadow (gas)." },
      { key: "ov_enhance", front: "Which artifact is seen deep to this anechoic cyst?", back: "Acoustic (posterior) enhancement." },
      { key: "ov_twinkle", front: "Which Doppler artifact is shown?", back: "Twinkle artifact — rapidly changing color behind a rough, strong reflector." },
    ],
  },
  liver: {
    sectionImages: [
      { section: "Porta Hepatis", key: "lv_mickey", caption: "Portal triad — the “Mickey” sign" },
      { section: "Fatty Liver Disease", key: "lv_fatty", caption: "Fatty liver: echogenic parenchyma" },
      { section: "Hepatitis", key: "lv_starry", caption: "Acute hepatitis — “starry sky” appearance" },
      { section: "Cirrhosis & Portal Hypertension", key: "lv_cirrhosis", caption: "Cirrhosis with nodular surface and ascites" },
      { section: "Vascular Disorders", key: "lv_pvt", caption: "Portal vein thrombosis on color Doppler" },
      { section: "Cysts, Abscesses & Infection", key: "lv_hydatid", caption: "Hydatid cyst with daughter cysts" },
      { section: "Benign Liver Masses", key: "lv_hemangioma", caption: "Cavernous hemangioma: small hyperechoic mass" },
      { section: "Liver Cancer", key: "lv_mets", caption: "Hepatic metastases — target lesions" },
      { section: "Liver Doppler, TIPS & Transplant", key: "lv_tips", caption: "TIPS stenosis — elevated velocity" },
    ],
    imageCards: [
      { key: "lv_mickey", front: "Name the sign seen in this transverse porta hepatis image", back: "“Mickey sign” — portal vein (face), hepatic artery & CBD (ears)." },
      { key: "lv_starry", back: "Acute hepatitis — “starry sky” (bright portal triads in a hypoechoic liver)." },
      { key: "lv_hydatid", back: "Hydatid (echinococcal) cyst with daughter cysts." },
      { key: "lv_mets", back: "Hepatic metastases — multiple target/bull's-eye lesions." },
    ],
  },
  gallbladder: {
    sectionImages: [
      { section: "Cholelithiasis (Gallstones)", key: "gb_stones", caption: "Gallstones with posterior shadowing" },
      { section: "Sludge", key: "gb_sludge", caption: "Dependent, nonshadowing sludge" },
      { section: "Polyps, Cholesterolosis & Adenomyomatosis", key: "gb_polyp", caption: "Gallbladder polyp — ball on the wall" },
      { section: "Polyps, Cholesterolosis & Adenomyomatosis", key: "gb_adeno", caption: "Adenomyomatosis with comet-tail artifact" },
      { section: "Acute Cholecystitis", key: "gb_acute", caption: "Acute cholecystitis: wall thickening, stones" },
      { section: "Complicated Cholecystitis", key: "gb_emphys", caption: "Emphysematous cholecystitis — gas in the wall" },
      { section: "Hydrops, Courvoisier & Porcelain GB", key: "gb_porcelain", caption: "Porcelain gallbladder (calcified wall)" },
      { section: "Gallbladder Carcinoma", key: "gb_carcinoma", caption: "Gallbladder carcinoma with vascular flow" },
    ],
    imageCards: [
      { key: "gb_stones", back: "Cholelithiasis — mobile echogenic stones with shadowing." },
      { key: "gb_sludge", back: "Gallbladder sludge — low-level, dependent, nonshadowing echoes." },
      { key: "gb_adeno", back: "Adenomyomatosis — comet-tail artifact from Rokitansky–Aschoff sinuses." },
    ],
  },
  pancreas: {
    sectionImages: [
      { section: "Sonography of the Pancreas", key: "pc_anatomy", caption: "Transverse pancreas & surrounding vessels" },
      { section: "Acute Pancreatitis", key: "pc_acute", caption: "Diffuse acute pancreatitis" },
      { section: "Acute Pancreatitis", key: "pc_pseudo", caption: "Pancreatic pseudocyst" },
      { section: "Chronic Pancreatitis", key: "pc_chronic", caption: "Chronic pancreatitis with calcifications" },
      { section: "Pancreatic Adenocarcinoma", key: "pc_adeno", caption: "Courvoisier gallbladder from head mass" },
    ],
    imageCards: [
      { key: "pc_chronic", back: "Chronic pancreatitis — echogenic calcifications throughout the gland." },
      { key: "pc_pseudo", back: "Pancreatic pseudocyst — anechoic collection with enhancement." },
    ],
  },
  gi: {
    sectionImages: [
      { section: "Gut Signature", key: "gi_gut", caption: "Normal gut signature (stomach)" },
      { section: "Acute Appendicitis", key: "gi_appy", caption: "Acute appendicitis — noncompressible > 6 mm" },
      { section: "Hypertrophic Pyloric Stenosis", key: "gi_hps", caption: "Pyloric stenosis — thickened muscle" },
      { section: "HPS Mimics", key: "gi_whirl", caption: "Midgut volvulus — whirlpool sign" },
      { section: "Intussusception", key: "gi_intus", caption: "Intussusception — target sign" },
      { section: "Intestinal Obstruction & Bezoars", key: "gi_sbo", caption: "SBO — plicae circulares (keyboard sign)" },
      { section: "Inflammatory Bowel & Cancer", key: "gi_crohn", caption: "Crohn disease — thickened bowel" },
    ],
    imageCards: [
      { key: "gi_whirl", back: "Whirlpool sign — midgut malrotation with volvulus." },
      { key: "gi_sbo", back: "Small bowel obstruction — dilated loops with plicae circulares (keyboard sign)." },
      { key: "gi_appy", back: "Acute appendicitis — dilated, noncompressible blind-ended tube." },
    ],
  },
  spleen: {
    sectionImages: [
      { section: "Sonography of the Spleen", key: "sp_normal", caption: "Normal spleen" },
      { section: "Splenomegaly", key: "sp_megaly", caption: "Splenomegaly" },
      { section: "Splenic Cysts & Abscess", key: "sp_cyst", caption: "Simple splenic cyst" },
      { section: "Splenic Infarct", key: "sp_infarct", caption: "Wedge-shaped hypoechoic infarct" },
      { section: "Splenic Trauma", key: "sp_trauma", caption: "Splenic laceration / hematoma" },
      { section: "Benign Masses & Granulomas", key: "sp_hemangioma", caption: "Splenic hemangioma — hyperechoic" },
      { section: "Malignant Disease", key: "sp_lymphoma", caption: "Splenic lymphoma — hypoechoic masses" },
    ],
    imageCards: [
      { key: "sp_infarct", back: "Acute splenic infarct — hypoechoic wedge-shaped area." },
      { key: "sp_hemangioma", back: "Splenic hemangioma — the most common benign splenic tumor." },
      { key: "sp_lymphoma", back: "Lymphoma — focal hypoechoic splenic masses." },
    ],
  },
  urinary: {
    sectionImages: [
      { section: "Renal Variants", key: "ur_dromedary", caption: "Dromedary hump & junctional line" },
      { section: "Simple & Complex Renal Cysts", key: "ur_cyst", caption: "Simple renal cyst" },
      { section: "Polycystic & Cystic Diseases", key: "ur_adpkd", caption: "ADPKD — enlarged kidney full of cysts" },
      { section: "Polycystic & Cystic Diseases", key: "ur_mcdk", caption: "MCDK — noncommunicating cysts" },
      { section: "Renal Infection", key: "ur_pyo", caption: "Pyonephrosis — debris in dilated system" },
      { section: "Obstruction & Hydronephrosis", key: "ur_hydro", caption: "Mild vs moderate hydronephrosis" },
      { section: "Stones & Nephrocalcinosis", key: "ur_stone", caption: "Renal stone with twinkle artifact" },
      { section: "Stones & Nephrocalcinosis", key: "ur_msk", caption: "Medullary sponge kidney — bright pyramids" },
      { section: "Benign Renal Masses", key: "ur_aml", caption: "Angiomyolipoma — echogenic mass" },
      { section: "Malignant Renal Masses", key: "ur_rcc", caption: "Renal cell carcinoma" },
      { section: "Renal Vascular Disease", key: "ur_ras", caption: "Renal artery stenosis — PSV 428 cm/s" },
      { section: "Pediatric Kidney", key: "ur_wilms", caption: "Wilms tumor (nephroblastoma)" },
      { section: "Ureters", key: "ur_jets", caption: "Ureteral jets on color Doppler" },
      { section: "Ureters", key: "ur_ureterocele", caption: "Ureterocele in the bladder" },
    ],
    imageCards: [
      { key: "ur_mcdk", back: "Multicystic dysplastic kidney — noncommunicating cysts replacing the kidney." },
      { key: "ur_hydro", back: "Hydronephrosis — dilated renal collecting system (mild vs moderate)." },
      { key: "ur_msk", back: "Medullary sponge kidney — echogenic, nonshadowing pyramids." },
      { key: "ur_jets", back: "Ureteral jets — proves ureteral patency." },
    ],
  },
  adrenal: {
    sectionImages: [
      { section: "Adrenal Adenoma", key: "ad_adenoma", caption: "Adrenal adenoma — solid hypoechoic mass" },
      { section: "Pheochromocytoma", key: "ad_pheo", caption: "Pheochromocytoma" },
      { section: "Neuroblastoma", key: "ad_neuro", caption: "Neuroblastoma — heterogeneous mass" },
      { section: "Adrenal Hemorrhage", key: "ad_hemorrhage", caption: "Neonatal adrenal hemorrhage" },
    ],
    imageCards: [
      { key: "ad_neuro", front: "Large heterogeneous suprarenal mass in a 2-year-old — likely diagnosis?", back: "Neuroblastoma." },
      { key: "ad_hemorrhage", front: "Suprarenal mass in a stressed neonate with ↓ hematocrit?", back: "Adrenal hemorrhage." },
    ],
  },
  vasculature: {
    sectionImages: [
      { section: "Celiac Trunk", key: "va_celiac", caption: "Normal vs abnormal celiac flow" },
      { section: "Sonography of the Aorta", key: "va_aortawave", caption: "High-resistance infrarenal aortic flow" },
      { section: "Abdominal Aortic Aneurysm", key: "va_aaa", caption: "AAA with mural thrombus" },
      { section: "EVAR, Dissection & Rupture", key: "va_endoleak", caption: "Type I endoleak" },
      { section: "EVAR, Dissection & Rupture", key: "va_dissection", caption: "Aortic dissection — intimal flap" },
      { section: "Pseudoaneurysm & AV Fistula", key: "va_pseudo", caption: "Pseudoaneurysm — swirling “yin-yang” flow" },
      { section: "IVC Pathology", key: "va_ivcthrombus", caption: "IVC thrombus (diagram)" },
    ],
    imageCards: [
      { key: "va_aaa", back: "Abdominal aortic aneurysm (> 3 cm) with mural thrombus." },
      { key: "va_dissection", back: "Aortic dissection — intimal flap within the lumen." },
      { key: "va_pseudo", back: "Pseudoaneurysm — perivascular sac with swirling flow and a neck." },
    ],
  },
  chest: {
    sectionImages: [
      { section: "Pleural & Pericardial Effusion", key: "rt_effusion", caption: "Pleural effusion above the liver" },
      { section: "Pneumothorax", key: "rt_mmode", caption: "M-mode: seashore (normal) vs barcode (PTX)" },
      { section: "Retroperitoneum Anatomy", key: "rt_psoas", caption: "Psoas & quadratus lumborum muscles" },
      { section: "Retroperitoneal Lymphadenopathy", key: "rt_nodes", caption: "Enlarged retroperitoneal nodes" },
      { section: "Retroperitoneal Fibrosis & Hematoma", key: "rt_fibrosis", caption: "Hypoechoic mass surrounding the aorta" },
    ],
    imageCards: [
      { key: "rt_mmode", front: "Top vs bottom M-mode: which sign means pneumothorax?", back: "Bottom — the “barcode” sign. Top is the normal “seashore” sign." },
      { key: "rt_effusion", back: "Pleural effusion — anechoic fluid above the diaphragm." },
    ],
  },
  biliary: {
    sectionImages: [
      { section: "Anatomy and Physiology", key: "biliary_2", caption: "Biliary tree anatomy (diagram)" },
      { section: "Sonography of the Bile Ducts", key: "biliary_3", caption: "Bile duct sonography views" },
      { section: "Sonography of the Bile Ducts", key: "biliary_4", caption: "Shotgun sign or parallel tube sign." },
      { section: "Choledocholithiasis", key: "biliary_6", caption: "Choledocholithiasis — stone in the CBD" },
      { section: "Choledocholithiasis", key: "biliary_7", caption: "Mirizzi syndrome" },
      { section: "Pneumobilia", key: "biliary_8", caption: "Pneumobilia — bright echoes in bile ducts" }
    ],
    imageCards: [],
  },
  male: {
    sectionImages: [
      { section: "Vascular Anatomy of the Male Pelvis", key: "male_2", caption: "Male pelvis vascular anatomy (diagram)" },
      { section: "Cryptorchidism", key: "male_4", caption: "Cryptorchidism — undescended testis" },
      { section: "Testicular Torsion", key: "male_5", caption: "Testicular torsion — absent flow" },
      { section: "Torsion of the Testicular Appendages", key: "male_6", caption: "Torsion of a testicular appendage" },
      { section: "Hydrocele", key: "male_7", caption: "Hydrocele surrounding the testis" }
    ],
    imageCards: [],
  },
  msk: {
    sectionImages: [
      { section: "Tendonitis", key: "msk_7", caption: "Tendonitis with hyperemia" },
      { section: "Tendon Rupture", key: "msk_8", caption: "Biceps tendon rupture" }
    ],
    imageCards: [],
  },
  neck: {
    sectionImages: [
      { section: "Sonography of the Salivary Glands", key: "neck_parotid", caption: "Normal parotid gland" },
      { section: "Pathology of the Salivary Glands", key: "neck_salivary", caption: "Salivary gland mass with internal flow" },
      { section: "Goiter", key: "neck_goiter", caption: "Goiter — diffusely enlarged thyroid" },
      { section: "Hashimoto Thyroiditis and Hypothryoidism", key: "neck_hashimoto", caption: "Hashimoto thyroiditis — heterogeneous gland" },
      { section: "Benign Nodules", key: "neck_benign", caption: "Benign thyroid nodule" },
      { section: "Benign Nodules", key: "neck_colloid", caption: "Colloid nodule with comet-tail artifact" },
      { section: "Malignant Thyroid Nodules", key: "neck_malignant", caption: "Malignant thyroid nodules" },
      { section: "Parathyroid Adenoma", key: "neck_parathyroid", caption: "Parathyroid adenoma posterior to the thyroid" },
      { section: "Cervical Lymph Nodes", key: "neck_node", caption: "Cervical lymph node with echogenic hilum" },
      { section: "Thyroglossal Duct Cyst", key: "neck_thyroglossal", caption: "Thyroglossal duct cyst" },
      { section: "Fibromatosis Colli", key: "neck_fibromatosis", caption: "Fibromatosis colli — enlarged SCM muscle" },
    ],
    imageCards: [
      { key: "neck_colloid", back: "Colloid nodule — comet-tail artifact suggests benign." },
      { key: "neck_parathyroid", back: "Parathyroid adenoma — hypoechoic oval mass posterior to the thyroid." },
      { key: "neck_thyroglossal", back: "Thyroglossal duct cyst — midline neck cyst near the hyoid." },
    ],
  },
};
