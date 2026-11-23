# One-time offline script: turns "Midterm quiz 1.pdf" into structured questions with per-option explanations.
# Output: /app/frontend/src/data/midterm.json  [{section, q, options[], answer, explanations[]}]
import asyncio, json, os, re
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
load_dotenv('/app/backend/.env')
text = open('/tmp/pdfs/mid.txt').read()
parts = re.split(r'\n(?=(?:Quiz Pancreas|Gallbladder and Bile Duct quiz|Liver Quiz))', text)
SYS = ("You are an expert abdominal sonography (RDMS) instructor. You receive raw text of a class quiz. Extract EVERY question in order. "
       "For multiple-choice keep the options exactly (strip letters/bullets). True/False questions: options ['True','False']; if the text states the answer, use it. "
       "If a question has no options (fill-in), create 4 plausible options with the correct one included. "
       "Determine the correct answer using standard sonography references (e.g., Penny, Examination Review for Ultrasound). "
       "For each option write a one-sentence explanation (max 30 words) of why it is correct or incorrect. "
       "Return ONLY JSON: {\"section\": \"<quiz name, e.g. Spleen>\", \"questions\": [{\"q\": str, \"options\": [str], \"answer\": <0-based index>, \"explanations\": [str per option]}]}")

async def run(part):
    chat = LlmChat(api_key=os.environ['EMERGENT_LLM_KEY'], session_id='mid-' + str(hash(part[:40])), system_message=SYS).with_model('openai', 'gpt-5.4')
    txt = ''
    async for ev in chat.stream_message(UserMessage(text=part)):
        if isinstance(ev, TextDelta): txt += ev.content
        elif isinstance(ev, StreamDone): break
    return json.loads(re.search(r'\{.*\}', txt, re.S).group(0))

async def main():
    res = []
    async def go(p):
        for _ in range(3):
            try: return await run(p)
            except Exception as e: print('retry', e, flush=True)
    outs = await asyncio.gather(*[go(p) for p in parts if p.strip()])
    for o in outs:
        for q in o['questions']:
            if len(q['explanations']) == len(q['options']) and 0 <= q['answer'] < len(q['options']):
                res.append({'section': o['section'], **q})
    json.dump(res, open('/app/frontend/src/data/midterm.json', 'w'), ensure_ascii=False, indent=0)
    print('total', len(res), {o['section']: len(o['questions']) for o in outs})
asyncio.run(main())
