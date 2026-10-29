# One-time offline script: writes short explanations for the textbook questions into the app bundle.
import asyncio, json, os, re
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
load_dotenv('/app/backend/.env')
SRC='/app/frontend/src/data/bookQuestions.json'
OUT='/app/frontend/src/data/bookExplanations.json'
data=json.load(open(SRC))
out=json.load(open(OUT)) if os.path.exists(OUT) else {}
SYS=("You are a sonography (RDMS abdomen) instructor. For each multiple-choice question, write a brief explanation (1-2 sentences, max 45 words) "
     "of why the keyed answer is correct, adding a key fact that helps the student remember it. Do not contradict the keyed answer. "
     "Return ONLY a JSON object mapping each question id to its explanation string.")
async def run(batch):
    chat=LlmChat(api_key=os.environ['EMERGENT_LLM_KEY'],session_id='exp-'+batch[0][0],system_message=SYS).with_model('openai','gpt-5.4')
    lines=[]
    for qid,q in batch:
        opts=' | '.join(f"{'ABCD'[i]}. {o}" for i,o in enumerate(q['options']))
        lines.append(f"[{qid}] {q['q']}\nOptions: {opts}\nKeyed answer: {'ABCD'[q['answer']]}. {q['options'][q['answer']]}")
    txt=''
    async for ev in chat.stream_message(UserMessage(text='\n\n'.join(lines))):
        if isinstance(ev,TextDelta): txt+=ev.content
        elif isinstance(ev,StreamDone): break
    m=re.search(r'\{.*\}',txt,re.S)
    return json.loads(m.group(0))
async def main():
    items=[(f"{t}-b{q['n']}",q) for t,v in data.items() for q in v if f"{t}-b{q['n']}" not in out]
    batches=[items[i:i+15] for i in range(0,len(items),15)]
    sem=asyncio.Semaphore(5)
    async def go(b):
        async with sem:
            for attempt in range(3):
                try:
                    r=await run(b); out.update({k:v for k,v in r.items() if k in dict(b)}); print('ok',b[0][0],len(r),flush=True); return
                except Exception as e: print('retry',b[0][0],e,flush=True)
    await asyncio.gather(*[go(b) for b in batches])
    json.dump(out,open(OUT,'w'),ensure_ascii=False,indent=0)
    print('total',len(out))
asyncio.run(main())
