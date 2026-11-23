# One-time offline script: tag every image-quiz caption with its underlying diagnosis/structure so a question never
# offers two choices that mean the same thing. Output: frontend/src/data/captionGroups.json {caption: "canonical diagnosis"}
import asyncio, json, os, re
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

load_dotenv('/app/backend/.env')
caps = json.load(open('/tmp/captions.json'))
SYS = ("You are a sonography educator. For each image caption give the single underlying diagnosis or structure it shows, as a short "
       "canonical lowercase name (e.g. 'Baker cyst at posterior knee' and 'Baker cyst in the popliteal fossa' -> 'baker cyst'; "
       "'Hepatic metastases — target lesions' and 'Multiple hepatic metastases in right lobe' -> 'hepatic metastases'). "
       "Captions that a student could not tell apart as answer choices MUST get the same name. Normal anatomy of the same organ/view gets the same name. "
       "Return ONLY JSON {\"<caption exactly as given>\": \"<canonical name>\", ...} covering every caption.")


async def main():
    chat = LlmChat(api_key=os.environ['EMERGENT_LLM_KEY'], session_id='capgroups', system_message=SYS).with_model('openai', 'gpt-5.4')
    txt = ''
    async for ev in chat.stream_message(UserMessage(text=json.dumps(caps, ensure_ascii=False))):
        if isinstance(ev, TextDelta):
            txt += ev.content
        elif isinstance(ev, StreamDone):
            break
    groups = json.loads(re.search(r'\{.*\}', txt, re.S).group(0))
    missing = [c for c in caps if c not in groups]
    print('captions', len(caps), 'groups', len(set(groups.values())), 'missing', missing[:10])
    json.dump({c: groups.get(c, c.lower()) for c in caps}, open('/app/frontend/src/data/captionGroups.json', 'w'), indent=1, ensure_ascii=False)

asyncio.run(main())
