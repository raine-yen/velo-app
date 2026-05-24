import { WorkoutType } from '@/types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export type GeneratedDay = {
  dayIndex: number; // 0 = Mon … 6 = Sun
  type: WorkoutType;
  title: string;
  description: string;
  durationMin: number;
  intensity: number; // 1-10
};

export type GeneratedPlan = {
  weekLabel: string;
  days: GeneratedDay[];
};

const PROMPT = (request: string) => `You are an expert athletic coach. Generate a training plan based on this request:

"${request}"

Respond with a JSON array only — no markdown, no explanation.

Each entry is one workout day:
[
  {
    "dayIndex": 0,
    "type": "run",
    "title": "Easy recovery run",
    "description": "Keep HR in zone 2. Focus on form.",
    "durationMin": 40,
    "intensity": 4
  }
]

Rules:
- dayIndex: 0=Monday through 6=Sunday
- type must be one of: run, ride, swim, lift, crossfit, sport, walk, yoga, other
- intensity: 1-10 scale
- Only include workout days (skip rest days)
- title: short (3-5 words)
- description: 1-2 coaching sentences
- durationMin: realistic for the sport and intensity
- Respond with the array only`;

export async function generatePlan(request: string): Promise<GeneratedDay[]> {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT(request) }] }],
      generationConfig: { temperature: 0.4 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON in response');

  return JSON.parse(match[0]) as GeneratedDay[];
}
