# One-time offline script: AI vision looks at each candidate figure and matches it to a study-notes section.
# Output: /tmp/cand/classified.json {cid: {type, section, caption, quality, ...}}
import asyncio, base64, json, os, re
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent, TextDelta, StreamDone

load_dotenv('/app/backend/.env')
C = '/tmp/cand'
OUT = f'{C}/classified.json'
cands = json.load(open(f'{C}/candidates.json'))
sections = json.load(open(f'{C}/sections.json'))
out = json.load(open(OUT)) if os.path.exists(OUT) else {}

SYS = ("You are an expert sonography educator curating images for a study guide. You will see ONE image plus the text from the slide/page it came from "
       "and a list of study-guide section titles. Return ONLY JSON: {\"type\": \"sonogram\"|\"anatomy\"|\"diagram\"|\"other\", "
       "\"section\": \"<exact section title that best matches, or null>\", \"caption\": \"<short neutral caption naming the finding/structure, <= 12 words>\", "
       "\"answer_in_image\": true|false, \"quality\": 1-5}. "
       "type: sonogram = real ultrasound/Doppler image; anatomy = anatomical illustration, photo of specimen, or CT/MRI showing anatomy; "
       "diagram = schematic/flowchart/labelled drawing explaining a concept; other = logo, portrait, text-only, table, decorative or unclear. "
       "answer_in_image = the diagnosis/structure name is printed in the image itself. quality = how clear and useful it is for teaching this section. "
       "Use the page text (captions, slide titles, question text) to identify what the image shows. Choose a section only if it clearly fits.")


async def run(c):
    b64 = base64.b64encode(open(f"{C}/{c['topic']}/{c['cid']}.jpg", 'rb').read()).decode()
    titles = [s['title'] for s in sections[c['topic']]]
    src = 'course lecture slide' if c['src'] == 's' else 'review textbook page'
    prompt = f"Source: {src}.\nPAGE TEXT: {c['text']}\n\nSECTION TITLES: {json.dumps(titles)}"
    chat = LlmChat(api_key=os.environ['EMERGENT_LLM_KEY'], session_id='cls-' + c['cid'], system_message=SYS).with_model('openai', 'gpt-5.4')
    txt = ''
    async for ev in chat.stream_message(UserMessage(text=prompt, file_contents=[ImageContent(image_base64=b64)])):
        if isinstance(ev, TextDelta):
            txt += ev.content
        elif isinstance(ev, StreamDone):
            break
    r = json.loads(re.search(r'\{.*\}', txt, re.S).group(0))
    if r.get('section') not in titles:
        r['section'] = None
    return r


async def main():
    sem = asyncio.Semaphore(12)
    done = 0

    async def go(c):
        nonlocal done
        if c['cid'] in out:
            return
        async with sem:
            for _ in range(3):
                try:
                    out[c['cid']] = await run(c)
                    break
                except Exception as e:
                    print('retry', c['cid'], str(e)[:100])
        done += 1
        if done % 50 == 0:
            json.dump(out, open(OUT, 'w'))
            print('done', done, flush=True)

    await asyncio.gather(*(go(c) for c in cands))
    json.dump(out, open(OUT, 'w'))
    print('FINISHED', len(out))

asyncio.run(main())
