import { biliarySections } from "./biliaryNotes";
import type { RawTopic } from "./types";

export const biliary: RawTopic = {
  id: "biliary",
  title: "The Bile Ducts",
  chapter: "Chapter 4",
  subtitle: "Biliary tree, obstruction, stones & cysts",
  icon: "git-branch",
  colorKey: "topicBiliary",
  sections: biliarySections,
  flashcards: [
    ["Normal CBD diameter (adult)", "≤ 6 mm (may be slightly larger with age or after cholecystectomy)."],
    ["Normal common hepatic duct", "≤ 4 mm."],
    ["Shotgun / parallel tube sign", "Dilated CBD running alongside the main portal vein."],
    ["Most common cause of biliary obstruction", "Choledocholithiasis (stones in the bile ducts)."],
    ["Mirizzi syndrome", "Stone impacted in the cystic duct/GB neck compressing the common hepatic duct."],
    ["Pneumobilia appearance", "Bright linear echoes with dirty shadowing/ring-down in the ducts."],
    ["Charcot triad", "Fever, RUQ pain, jaundice — cholangitis."],
    ["Klatskin tumor", "Cholangiocarcinoma at the junction of the right and left hepatic ducts."],
    ["Ascariasis", "Roundworm in the bile ducts — echogenic tubular structure (may move)."],
    ["Biliary atresia sign", "Triangular cord sign; small/absent GB in a jaundiced neonate."],
    ["Choledochal cyst", "Cystic dilation of the CBD, separate from the GB."],
    ["Caroli disease", "Saccular dilation of intrahepatic ducts; central dot sign."],
  ],
  quiz: [],
  mnemonics: [
    { title: "Cholangitis", device: "Charcot triad: “Fever, Pain, Yellow”", meaning: "Fever • RUQ pain • jaundice" },
    { title: "Duct sizes", device: "“4 for the hepatic, 6 for the common”", meaning: "CHD ≤ 4 mm; CBD ≤ 6 mm." },
    { title: "Klatskin", device: "“Klatskin sits at the fork”", meaning: "Cholangiocarcinoma at the hepatic duct bifurcation." },
    { title: "Caroli", device: "“Caroli = Central dot, Cystic intrahepatic ducts”", meaning: "Saccular intrahepatic duct dilation with portal radicle in the center." },
  ],
};
