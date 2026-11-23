# Image quiz: list caption pairs (same topic) that can co-appear as options (not filtered by quiz.ts similar()) but share the main finding words.
import json
import re
from itertools import combinations

EXCLUDE = {"biliary_2", "biliary_3", "male_2", "pc_anatomy", "rt_psoas", "va_ivcthrombus", "ur_adpkd", "ur_dromedary"}
src = open("/app/frontend/src/data/media.ts").read()
extra = json.load(open("/app/frontend/src/data/extraMedia.json"))
topics = {}
cur = None
for line in src.splitlines():
    m = re.match(r"^  (\w+): \{", line)
    if m:
        cur = m.group(1)
    m = re.search(r'\{ section: "[^"]*", key: "(\w+)", caption: "([^"]*)"(.*)\}', line)
    if m and cur and "quiz: false" not in m.group(3):
        topics.setdefault(cur, []).append((m.group(1), m.group(2)))
for t, v in extra.items():
    for x in v.get("sectionImages", []):
        if x.get("quiz") is not False:
            topics.setdefault(t, []).append((x["key"], x["caption"]))

STOP = {"with", "the", "and", "in", "of", "on", "ultrasound", "sonogram", "sonographic", "appearance", "color", "doppler", "image", "showing", "view"}
def words(s):
    return {w.rstrip("s") for w in re.sub(r"[^a-z ]", " ", s.lower()).split() if len(w) > 2}
def similar(a, b):
    A, B = words(a), words(b)
    return len(A & B) / max(1, min(len(A), len(B))) >= 0.75

for t in ["urinary", "msk", "liver"]:
    caps = sorted({c for k, c in topics.get(t, []) if k not in EXCLUDE})
    print(f"== {t}: {len(caps)} quizzable captions")
    for a, b in combinations(caps, 2):
        core = (words(a) & words(b)) - STOP
        if len(core) >= 2 and not similar(a, b):
            print(f"   CAN CO-APPEAR: '{a}'  <->  '{b}'  shared={sorted(core)}")
