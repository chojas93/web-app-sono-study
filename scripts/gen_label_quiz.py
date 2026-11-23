# One-time offline script: turn labelled anatomy diagrams into "name the numbered structure" quizzes.
# 1) OCR finds text labels in each diagram  2) AI vision keeps only real anatomical structure labels (and cleans the name)
# 3) each kept label is covered with a numbered badge. Writes frontend/assets/labels/*.jpg, src/data/labelSlides.ts, src/data/labelQuiz.json
import asyncio, base64, io, json, os, re
from PIL import Image, ImageDraw, ImageFont
from rapidocr_onnxruntime import RapidOCR
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent, TextDelta, StreamDone

load_dotenv('/app/backend/.env')
FE = '/app/frontend'
SRC = f'{FE}/assets/slides'
OUT = f'{FE}/assets/labels'
os.makedirs(OUT, exist_ok=True)
ex = json.load(open(f'{FE}/src/data/extraMedia.json'))
items = [(t, x) for t, m in ex.items() for x in m['sectionImages'] if x.get('kind') in ('diagram', 'anatomy')]
ocr = RapidOCR()

SYS = ("You are an anatomy and sonography educator. You get a labelled diagram and the list of text snippets found in it (index: text). "
       "Pick the snippets that are labels naming an anatomical structure, organ, vessel, zone or region shown in the drawing (not titles, captions, "
       "sentences, figure letters, directions like 'anterior', or symptom lists). Return ONLY JSON {\"usable\": true|false, \"labels\": [{\"i\": <index>, \"name\": \"<clean structure name, Title case>\"}]} "
       "usable = the image is an anatomy diagram/illustration where naming the labelled structures is a good study exercise. "
       "Only pick labels that sit next to, or are connected by a leader line to, the structure they name. If the names are a legend/key "
       "(letters or numbers in the drawing explained in a separate list), do not pick those names; if that leaves fewer than 3 labels set usable false.")


async def judge(b64, snippets):
    chat = LlmChat(api_key=os.environ['EMERGENT_LLM_KEY'], session_id='lbl-' + str(hash(b64[:300])), system_message=SYS).with_model('openai', 'gpt-5.4')
    txt = ''
    prompt = 'SNIPPETS:\n' + '\n'.join(f'{i}: {s}' for i, s in enumerate(snippets))
    async for ev in chat.stream_message(UserMessage(text=prompt, file_contents=[ImageContent(image_base64=b64)])):
        if isinstance(ev, TextDelta):
            txt += ev.content
        elif isinstance(ev, StreamDone):
            break
    return json.loads(re.search(r'\{.*\}', txt, re.S).group(0))


def font(size):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def bbox(quad):
    xs, ys = [q[0] for q in quad], [q[1] for q in quad]
    return (min(xs), min(ys), max(xs), max(ys))


def mask(path, numbered, blanks, out):
    # Every piece of text is covered so no answer shows through; quiz labels get their number (repeats share it).
    im = Image.open(path).convert('RGB')
    d = ImageDraw.Draw(im)
    for x0, y0, x1, y1 in blanks:
        d.rounded_rectangle([x0 - 2, y0 - 2, x1 + 2, y1 + 2], radius=3, fill=(236, 232, 224))
    for n, (x0, y0, x1, y1) in numbered:
        h = y1 - y0
        d.rounded_rectangle([x0 - 3, y0 - 3, x1 + 3, y1 + 3], radius=4, fill=(255, 244, 214), outline=(214, 96, 64), width=2)
        f = font(max(13, min(22, int(h * 1.0))))
        d.text(((x0 + x1) / 2, (y0 + y1) / 2), str(n), fill=(176, 58, 30), font=f, anchor='mm')
    im.save(out, quality=80)


async def main():
    prepared = []
    for t, x in items:
        path = f"{SRC}/{x['key']}.jpg"
        res, _ = ocr(path)
        if not res:
            continue
        snips = [(r[1].strip(), r[0]) for r in res if r[2] > 0.6 and 2 <= len(r[1].strip()) <= 40]
        if len(snips) < 3:
            continue
        prepared.append((t, x, path, snips, [bbox(r[0]) for r in res]))
    print('diagrams with text', len(prepared), 'of', len(items))
    sem = asyncio.Semaphore(10)

    cache_p = '/tmp/label_verdicts.json'
    cache = json.load(open(cache_p)) if os.path.exists(cache_p) else {}

    async def go(p):
        if p[1]['key'] in cache:
            return cache[p[1]['key']]
        async with sem:
            b64 = base64.b64encode(open(p[2], 'rb').read()).decode()
            try:
                return await judge(b64, [s for s, _ in p[3]])
            except Exception as e:
                print('err', e)
                return None
    verdicts = await asyncio.gather(*(go(p) for p in prepared))
    json.dump({p[1]['key']: v for p, v in zip(prepared, verdicts) if v}, open(cache_p, 'w'))
    quiz, keys, seen = [], [], set()
    for (t, x, path, snips, allboxes), v in zip(prepared, verdicts):
        if not v or not v.get('usable'):
            continue
        labs = [(l['name'].strip(), bbox(snips[l['i']][1])) for l in v.get('labels', []) if isinstance(l.get('i'), int) and l['i'] < len(snips)]
        labs.sort(key=lambda u: (u[1][1] // 20, u[1][0]))  # number top-to-bottom, left-to-right
        order, names = [], {}
        for name, b in labs:
            if name.lower() not in names:
                names[name.lower()] = len(order) + 1
                order.append(name)
        if len(order) < 3:
            continue
        sig = (t, tuple(sorted(names)))
        if sig in seen:  # same diagram extracted twice
            continue
        seen.add(sig)
        key = 'lb_' + x['key']
        numbered = [(names[n.lower()], b) for n, b in labs]
        mask(path, numbered, allboxes, f'{OUT}/{key}.jpg')
        keys.append(key)
        quiz.append({'topic': t, 'key': key, 'section': x['section'], 'caption': x['caption'], 'labels': order})
    json.dump(quiz, open(f'{FE}/src/data/labelQuiz.json', 'w'), indent=1)
    with open(f'{FE}/src/data/labelSlides.ts', 'w') as f:
        f.write('// Diagrams with their labels covered by numbered badges (generated by scripts/gen_label_quiz.py).\n')
        f.write('export const labelSlides = {\n' + ''.join(f'  {k}: require("../../assets/labels/{k}.jpg"),\n' for k in keys) + '};\n')
    print('diagram quizzes', len(quiz), 'labels', sum(len(q['labels']) for q in quiz))

asyncio.run(main())
