# One-time offline script: extract candidate figures from the course slide PDFs and the 3rd edition textbook chapters.
# Output: /tmp/cand/<topic>/<cid>.jpg and /tmp/cand/candidates.json [{cid, topic, src, page, text}]
import hashlib, io, json, os
import pymupdf as fitz
from PIL import Image

OUT = '/tmp/cand'
SLIDES = ['overview', 'liver', 'gallbladder', 'biliary', 'pancreas', 'spleen', 'urinary', 'adrenal', 'vasculature', 'gi', 'chest', 'neck', 'male', 'msk']
st = [25, 131, 257, 314, 359, 416, 465, 597, 642, 698, 761, 793, 854, 937, 1020]
ids = ['overview', 'liver', 'gallbladder', 'biliary', 'pancreas', 'spleen', 'urinary', 'adrenal', 'vasculature', 'gi', 'chest', 'neck', 'male', 'msk']
seen, cands = set(), []


def save(doc, xref, topic, src, pno, text):
    try:
        info = doc.extract_image(xref)
    except Exception:
        return
    if info['width'] < 220 or info['height'] < 160:
        return
    h = hashlib.md5(info['image']).hexdigest()
    if h in seen:
        return
    seen.add(h)
    try:
        im = Image.open(io.BytesIO(info['image'])).convert('RGB')
    except Exception:
        return
    # skip near-blank images (logos, backgrounds)
    ext = im.convert('L').getextrema()
    if ext[1] - ext[0] < 40:
        return
    im.thumbnail((800, 800))
    cid = f'{src}_{topic}_{pno}_{xref}'
    os.makedirs(f'{OUT}/{topic}', exist_ok=True)
    im.save(f'{OUT}/{topic}/{cid}.jpg', quality=72)
    cands.append({'cid': cid, 'topic': topic, 'src': src, 'page': pno, 'text': ' '.join(text.split())[:700]})


for t in SLIDES:
    d = fitz.open(f'/tmp/pdfs/{t}.pdf')
    for p in d:
        for img in p.get_images(full=True):
            save(d, img[0], t, 's', p.number + 1, p.get_text())

book = fitz.open('/tmp/pdfs/book3.pdf')
for c, t in enumerate(ids):
    for i in range(st[c] - 1, st[c + 1] - 1):
        p = book[i]
        for img in p.get_images(full=True):
            save(book, img[0], t, 'b', i + 1, p.get_text())

json.dump(cands, open(f'{OUT}/candidates.json', 'w'))
from collections import Counter
print(len(cands), Counter((c['topic'], c['src']) for c in cands))
