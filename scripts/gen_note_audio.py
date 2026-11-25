# One-time offline script: record every study-notes section with a natural AI voice and bundle the audio in the app.
# Uses gpt-4o-mini-tts (voice "coral", warm delivery). Output: frontend/assets/audio/<sectionId>.mp3 (mono, 32 kbps)
# and frontend/src/data/noteAudio.ts. Safe to re-run: sections already recorded are skipped.
import asyncio, json, os, re, subprocess, tempfile
from dotenv import load_dotenv
import imageio_ffmpeg
from emergentintegrations.llm.openai import OpenAITextToSpeech

load_dotenv('/app/backend/.env')
FE = '/app/frontend'
OUT = f'{FE}/assets/audio'
os.makedirs(OUT, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
sections = json.load(open('/tmp/sections_text.json'))
tts = OpenAITextToSpeech(api_key=os.environ['EMERGENT_LLM_KEY'])
INSTR = ("Warm, calm and friendly female tutor reading study notes to a sonography student. Clear, unhurried pace, "
         "natural pauses between points, pronounce medical terms carefully.")

SPOKEN = [(r'(\d)\s*%', r'\1 percent'), (r'(\d)\s*°', r'\1 degrees'), (r'(\d)\s*×\s*(\d)', r'\1 by \2'), (r'×', ' times '),
          (r'\bcm/s\b', 'centimeters per second'), (r'\bmm\b', 'millimeters'), (r'\bcm\b', 'centimeters'), (r'\bMHz\b', 'megahertz'),
          (r'(\d)\s*–\s*(\d)', r'\1 to \2'), (r'(\d)\s*-\s*(\d)', r'\1 to \2'), (r'\s*=\s*', ' equals '), (r'>', ' greater than '), (r'<', ' less than '),
          (r'(\w)/(\w)', r'\1 or \2'), (r'[“”]', '"'), (r'’', "'"), (r'\s+', ' ')]


def spoken(t):
    for a, b in SPOKEN:
        t = re.sub(a, b, t)
    return t.strip()


def chunks(parts, limit=3800):
    out, cur = [], ''
    for p in parts:
        if cur and len(cur) + len(p) + 1 > limit:
            out.append(cur)
            cur = ''
        cur = (cur + ' ' + p).strip()
    return out + ([cur] if cur else [])


async def record(s, sem):
    path = f"{OUT}/{s['id']}.mp3"
    if os.path.exists(path):
        return 'skip'
    parts = [spoken(s['title']) + '.'] + [spoken(p if p.rstrip().endswith(('.', '?', '!')) else p + '.') for p in s['points']]
    async with sem:
        raw = []
        for c in chunks(parts):
            for attempt in range(3):
                try:
                    raw.append(await asyncio.wait_for(tts.generate_speech(text=c, model='gpt-4o-mini-tts', voice='coral', instructions=INSTR, response_format='mp3'), 180))
                    break
                except Exception as e:
                    print('retry', s['id'], attempt, str(e)[:120], flush=True)
            else:
                return 'fail'
    with tempfile.TemporaryDirectory() as d:
        files = []
        for i, b in enumerate(raw):
            open(f'{d}/{i}.mp3', 'wb').write(b)
            files.append(f'{d}/{i}.mp3')
        lst = f'{d}/list.txt'
        open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
        subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-ac', '1', '-ar', '24000', '-b:a', '32k', path], check=True)
    return 'ok'


async def main():
    sem = asyncio.Semaphore(8)
    res = await asyncio.gather(*(record(s, sem) for s in sections))
    print({r: res.count(r) for r in set(res)}, flush=True)
    done = [s['id'] for s in sections if os.path.exists(f"{OUT}/{s['id']}.mp3")]
    with open(f'{FE}/src/data/noteAudio.ts', 'w') as f:
        f.write('// Recorded AI narration for each study-notes section (generated once by scripts/gen_note_audio.py; plays offline).\n')
        f.write('export const noteAudio: Record<string, number> = {\n' + ''.join(f'  "{i}": require("../../assets/audio/{i}.mp3"),\n' for i in done) + '};\n')
    print('sections with audio', len(done), 'of', len(sections))

asyncio.run(main())
