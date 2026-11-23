# One-time offline script: expands each study-notes section using the 3rd edition textbook chapter text.
# Output: /app/frontend/src/data/detailedNotes.json  { "<topicId>": { "<section title>": [points...] } }
import asyncio, json, os, re, subprocess
from dotenv import load_dotenv
import pymupdf as fitz
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
load_dotenv('/app/backend/.env')
OUT = '/app/frontend/src/data/detailedNotes.json'
BOOK = '/tmp/pdfs/book3.pdf'
st = [25, 131, 257, 314, 359, 416, 465, 597, 642, 698, 761, 793, 854, 937, 1020]
rq = [106, 234, 295, 338, 397, 445, 574, 622, 677, 739, 774, 833, 915, 999]
ids = ['overview', 'liver', 'gallbladder', 'biliary', 'pancreas', 'spleen', 'urinary', 'adrenal', 'vasculature', 'gi', 'chest', 'neck', 'male', 'msk']
sections = json.loads(open('/tmp/pdfs/sections.json').read())  # {topicId: [{title, points}]}
doc = fitz.open(BOOK)
out = json.load(open(OUT)) if os.path.exists(OUT) else {}
SYS = ("You are an expert sonography (SPI/ABD registry) educator writing a study guide. Using ONLY facts supported by the provided textbook chapter, "
       "rewrite each study section with more thorough detail. For each section return 8-14 concise bullet points (each <= 40 words) covering anatomy, physiology, "
       "clinical findings, labs, sonographic appearance, measurements/normal values, Doppler, differentials and pitfalls as relevant to that section. "
       "Keep all correct facts from the existing points. No markdown, no numbering. Return ONLY JSON: {\"<exact section title>\": [\"point\", ...], ...} covering every section title given.")

async def run(c, tid):
    text = '\n'.join(doc[i].get_text() for i in range(st[c] - 1, rq[c] + 1))
    text = re.sub(r'\s+\n', '\n', text)[:350000]
    secs = sections[tid]
    prompt = "TEXTBOOK CHAPTER:\n" + text + "\n\nSECTIONS TO EXPAND:\n" + json.dumps(secs, ensure_ascii=False)
    chat = LlmChat(api_key=os.environ['EMERGENT_LLM_KEY'], session_id='notes-' + tid, system_message=SYS).with_model('openai', 'gpt-5.4')
    txt = ''
    async for ev in chat.stream_message(UserMessage(text=prompt)):
        if isinstance(ev, TextDelta): txt += ev.content
        elif isinstance(ev, StreamDone): break
    return json.loads(re.search(r'\{.*\}', txt, re.S).group(0))

async def main():
    sem = asyncio.Semaphore(4)
    async def go(c, tid):
        if tid in out: return
        async with sem:
            for attempt in range(3):
                try:
                    r = await run(c, tid)
                    out[tid] = {k: [str(p) for p in v] for k, v in r.items() if isinstance(v, list)}
                    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=0)
                    print('ok', tid, len(r), flush=True); return
                except Exception as e:
                    print('retry', tid, e, flush=True)
    await asyncio.gather(*[go(c, t) for c, t in enumerate(ids)])
    print('done', len(out))
asyncio.run(main())
