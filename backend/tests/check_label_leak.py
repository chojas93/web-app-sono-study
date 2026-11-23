# Label quiz: OCR each masked diagram and flag any remaining text that matches one of its answer labels (answer leakage).
import json
import re
from difflib import SequenceMatcher

from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
data = json.load(open("/app/frontend/src/data/labelQuiz.json"))
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower()).strip()
leaks = []
for d in data:
    res, _ = ocr(f"/app/frontend/assets/labels/{d['key']}.jpg")
    texts = [r[1] for r in (res or []) if not re.fullmatch(r"\s*\d+\s*", r[1])]
    for t in texts:
        nt = norm(t)
        if len(nt) < 3:
            continue
        for lab in d["labels"]:
            nl = norm(lab)
            if nt == nl or (len(nt) >= 5 and (nt in nl or SequenceMatcher(None, nt, nl).ratio() > 0.8)):
                leaks.append((d["key"], t, lab))
    print(d["key"], "residual text:", texts[:12])
print("\nLEAKS:", len(leaks))
for l in leaks:
    print("  ", l)
