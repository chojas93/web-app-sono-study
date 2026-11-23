# Targeted pass for sections still without pictures: take the images on the exact slide/textbook pages that discuss them,
# have AI vision confirm each one shows that subject, then add up to 2 per section.
import asyncio, base64, hashlib, io, json, os, re
import pymupdf as fitz
from PIL import Image
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent, TextDelta, StreamDone

load_dotenv('/app/backend/.env')
FE = '/app/frontend'
P = '/tmp/pdfs'
# (topic, section, keyword shown to the AI, [(pdf, page), ...])
TARGETS = [
    ('overview', 'FAST Exam', 'FAST exam (focused assessment with sonography for trauma)', [('overview', 57), ('overview', 58), ('book3', 128), ('book3', 113)]),
    ('biliary', 'Ascariasis', 'biliary ascariasis', [('biliary', 24), ('biliary', 25)]),
    ('chest', 'Lung Masses & Consolidation', 'lung consolidation or lung mass', [('chest', 14), ('chest', 15), ('book3', 768)]),
    ('male', 'Adrenal Rests', 'testicular adrenal rests', [('male', 49), ('book3', 919)]),
    ('male', 'Peyronie Disease', 'Peyronie disease (penile plaque)', [('male', 69)]),
    ('male', 'Prostatitis', 'prostatitis or prostatic abscess', [('male', 82), ('male', 84), ('male', 90), ('male', 92), ('book3', 910), ('book3', 911)]),
    ('msk', 'Galactocele', 'galactocele', [('msk', 45), ('msk', 46), ('book3', 979), ('book3', 1001)]),
    ('msk', 'Melanoma', 'melanoma (skin lesion or metastatic node)', [('msk', 68)]),
    ('liver', 'Jaundice & Bilirubin', 'jaundice / biliary obstruction causing jaundice', [('liver', 31), ('liver', 32), ('book3', 165), ('book3', 189)]),
    ('spleen', 'WBC Assessment', 'spleen findings related to white blood cell disorders (e.g. leukemia, lymphoma, splenomegaly)', [('spleen', 17), ('book3', 421)]),
]
SYS = ("You are an expert sonography educator. Look at the image and the page text. Return ONLY JSON "
       "{\"match\": true|false, \"type\": \"sonogram\"|\"anatomy\"|\"diagram\"|\"other\", \"caption\": \"<short neutral caption, <= 12 words>\", \"answer_in_image\": true|false}. "
       "match = the image clearly shows the given subject (not a logo, portrait, text slide or unrelated picture).")
docs = {}


def doc(n):
    if n not in docs:
        docs[n] = fitz.open(f'{P}/{n}.pdf')
    return docs[n]


async def check(subject, text, b64):
    chat = LlmChat(api_key=os.environ['EMERGENT_LLM_KEY'], session_id='t-' + hashlib.md5(b64[:500].encode()).hexdigest(), system_message=SYS).with_model('openai', 'gpt-5.4')
    txt = ''
    async for ev in chat.stream_message(UserMessage(text=f'SUBJECT: {subject}\nPAGE TEXT: {text[:600]}', file_contents=[ImageContent(image_base64=b64)])):
        if isinstance(ev, TextDelta):
            txt += ev.content
        elif isinstance(ev, StreamDone):
            break
    return json.loads(re.search(r'\{.*\}', txt, re.S).group(0))


async def main():
    ex = json.load(open(f'{FE}/src/data/extraMedia.json'))
    slides_ts = open(f'{FE}/src/data/extraSlides.ts').read()
    keys = re.findall(r'^  (x_\w+):', slides_ts, re.M)
    n = max(int(k.rsplit('_', 1)[1]) for k in keys)
    jobs = []
    for topic, sec, subject, pages in TARGETS:
        seen = set()
        for pdf, pno in pages:
            pg = doc(pdf)[pno - 1]
            for img in pg.get_images(full=True):
                try:
                    info = doc(pdf).extract_image(img[0])
                except Exception:
                    continue
                if info['width'] < 120 or info['height'] < 90:
                    continue
                h = hashlib.md5(info['image']).hexdigest()
                if h in seen:
                    continue
                seen.add(h)
                im = Image.open(io.BytesIO(info['image'])).convert('RGB')
                lo, hi = im.convert('L').getextrema()
                if hi - lo < 40:
                    continue
                im.thumbnail((720, 720))
                buf = io.BytesIO()
                im.save(buf, 'JPEG', quality=72)
                jobs.append((topic, sec, subject, pg.get_text(), buf.getvalue()))
    res = await asyncio.gather(*(check(s, t, base64.b64encode(b).decode()) for _, _, s, t, b in jobs), return_exceptions=True)
    count = {}
    for (topic, sec, _, _, data), r in zip(jobs, res):
        if isinstance(r, Exception) or not r.get('match') or r.get('type') == 'other' or count.get(sec, 0) >= 2:
            continue
        n += 1
        key = f'x_{topic}_{n}'
        open(f'{FE}/assets/slides/{key}.jpg', 'wb').write(data)
        keys.append(key)
        count[sec] = count.get(sec, 0) + 1
        quiz = r['type'] == 'sonogram' and not r.get('answer_in_image')
        ex[topic]['sectionImages'].append({'section': sec, 'key': key, 'caption': r['caption'], 'kind': r['type'], **({} if quiz else {'quiz': False})})
        if quiz:
            ex[topic]['imageCards'].append({'key': key, 'back': r['caption']})
        print(topic, '|', sec, '->', r['caption'])
    json.dump(ex, open(f'{FE}/src/data/extraMedia.json', 'w'), indent=1)
    open(f'{FE}/src/data/extraSlides.ts', 'w').write(slides_ts.split('export const extraSlides')[0] + 'export const extraSlides = {\n' + ''.join(f'  {k}: require("../../assets/slides/{k}.jpg"),\n' for k in keys) + '};\n')
    print('checked', len(jobs), 'added', sum(count.values()), 'still missing', [t[1] for t in TARGETS if t[1] not in count])

asyncio.run(main())
