# Voice audition: record liver sections 1-3 with three different soft voices so the user can compare in the app.
import asyncio, json, os, re, subprocess, tempfile
from dotenv import load_dotenv
import imageio_ffmpeg
from emergentintegrations.llm.openai import OpenAITextToSpeech

load_dotenv('/app/backend/.env')
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
tts = OpenAITextToSpeech(api_key=os.environ['EMERGENT_LLM_KEY'])
INSTR = ("Voice: a soft, light, kind young British woman with a gentle Received Pronunciation accent. "
         "Tone: warm, cosy and reassuring, as if smiling while telling a peaceful story to a friend - never stern, formal or serious. "
         "Delivery: relaxed and flowing, gentle rise and fall, soft endings to sentences, calm natural pauses. "
         "Pronounce medical terms clearly but lightly.")
src = open('/app/scripts/gen_note_audio.py').read()
ns = {'re': re}
exec(src[src.index('SPOKEN = '):src.index('async def record')], ns)
spoken, chunks = ns['spoken'], ns['chunks']
secs = {s['id']: s for s in json.load(open('/tmp/sections_all.json'))}
PLAN = [('liver-s1', 'shimmer'), ('liver-s2', 'sage'), ('liver-s3', 'fable')]


async def rec(sid, voice):
    s = secs[sid]
    parts = [spoken(s['title']) + '.'] + [spoken(p if p.rstrip().endswith(('.', '?', '!')) else p + '.') for p in s['points']]
    raw = [await tts.generate_speech(text=c, model='gpt-4o-mini-tts', voice=voice, instructions=INSTR, response_format='mp3') for c in chunks(parts)]
    with tempfile.TemporaryDirectory() as d:
        for i, b in enumerate(raw):
            open(f'{d}/{i}.mp3', 'wb').write(b)
        open(f'{d}/l.txt', 'w').write(''.join(f"file '{d}/{i}.mp3'\n" for i in range(len(raw))))
        subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{d}/l.txt', '-ac', '1', '-ar', '24000', '-b:a', '32k', f'/app/frontend/assets/audio/{sid}.mp3'], check=True)
    print(sid, voice, 'ok')


async def main():
    await asyncio.gather(*(rec(s, v) for s, v in PLAN))

asyncio.run(main())
