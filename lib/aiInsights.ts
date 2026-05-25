import { VeloHealthContext } from '@/lib/healthContext';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export type InsightKind = 'daily' | 'sleep' | 'training' | 'nutrition' | 'recovery';

export type VeloInsight = {
  kind: InsightKind;
  title: string;
  summary: string;
  action: string;
  tone: 'green' | 'yellow' | 'red';
};

export type CoachMessage = {
  title: string;
  answer: string;
  actions: string[];
};

const INSIGHT_SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['daily', 'sleep', 'training', 'nutrition', 'recovery'] },
    title: { type: 'string' },
    summary: { type: 'string' },
    action: { type: 'string' },
    tone: { type: 'string', enum: ['green', 'yellow', 'red'] },
  },
  required: ['kind', 'title', 'summary', 'action', 'tone'],
};

const COACH_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    answer: { type: 'string' },
    actions: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'answer', 'actions'],
};

function fallbackInsight(kind: InsightKind, context: VeloHealthContext): VeloInsight {
  const recovery = context.scores.recovery;
  const active = context.health?.activeMinutes ?? context.todayWorkouts.activeWorkoutMinutes;
  const sleep = context.health?.sleepHours ?? context.wellness?.sleepHours;

  if (kind === 'sleep') {
    return {
      kind,
      title: sleep ? 'Sleep is your lever' : 'Sleep data needed',
      summary: sleep ? `${sleep} hours logged. Recovery will be clearer with consistent overnight HRV and RHR.` : 'Velo needs Apple Health sleep samples to analyze stages.',
      action: sleep && sleep < 7 ? "Keep intensity controlled and protect tonight's sleep window." : 'Keep wearing your device overnight.',
      tone: sleep && sleep >= 7 ? 'green' : 'yellow',
    };
  }

  if (kind === 'training') {
    return {
      kind,
      title: 'Load check',
      summary: `${context.weekTraining.sessions} sessions and ${context.weekTraining.minutes} workout minutes this week.`,
      action: recovery !== null && recovery < 55 ? 'Favor easy work until recovery rebounds.' : 'A moderate session is reasonable if soreness is low.',
      tone: recovery !== null && recovery < 55 ? 'yellow' : 'green',
    };
  }

  if (kind === 'nutrition') {
    const remaining = context.profile.targets.calories - context.todayNutrition.calories;
    return {
      kind,
      title: 'Fuel status',
      summary: `${context.todayNutrition.calories} kcal consumed. ${context.health?.activeCalories ?? 0} active kcal burned.`,
      action: remaining > 600 ? 'Prioritize protein and carbs in your next meal.' : 'Keep the next meal simple and recovery-oriented.',
      tone: remaining > 0 ? 'yellow' : 'green',
    };
  }

  if (kind === 'recovery') {
    return {
      kind,
      title: recovery !== null ? 'Recovery read' : 'Recovery baseline building',
      summary: recovery !== null ? `Recovery is ${recovery}/100 from sleep, HRV, and resting HR.` : 'Recovery needs sleep, HRV, and resting HR to stabilize.',
      action: recovery !== null && recovery >= 70 ? 'Use the green light, but avoid stacking intensity without sleep.' : 'Keep the day aerobic or technique-focused.',
      tone: recovery !== null && recovery >= 70 ? 'green' : 'yellow',
    };
  }

  return {
    kind,
    title: "Today's guidance",
    summary: `Recovery ${recovery ?? 'needs data'}, active ${active} min, consumed ${context.todayNutrition.calories} kcal.`,
    action: recovery !== null && recovery < 55 ? 'Lower the training load and refuel well.' : 'Train with intent and keep recovery visible.',
    tone: recovery !== null && recovery < 55 ? 'yellow' : 'green',
  };
}

function fallbackCoach(question: string, context: VeloHealthContext): CoachMessage {
  return {
    title: 'Velo coach',
    answer: `Based on today's data, recovery is ${context.scores.recovery ?? 'still building'}, active time is ${context.health?.activeMinutes ?? 0} minutes, and intake is ${context.todayNutrition.calories} kcal. ${question ? 'Use that as the guardrail for your next choice.' : 'Ask about training, sleep, or fueling for a more specific answer.'}`,
    actions: ['Check recovery before intensity', 'Fuel around training', 'Prioritize sleep consistency'],
  };
}

async function generateStructured<T>(prompt: string, schema: object): Promise<T> {
  if (!API_KEY) throw new Error('Missing Gemini API key');

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return JSON.parse(text) as T;
}

export async function generateInsight(kind: InsightKind, context: VeloHealthContext): Promise<VeloInsight> {
  try {
    return await generateStructured<VeloInsight>(
      `You are Velo, a concise athletic health coach. Use this compact athlete context to produce one ${kind} insight. Keep summary and action under 120 characters each. No medical claims.\n\n${JSON.stringify(context)}`,
      INSIGHT_SCHEMA,
    );
  } catch {
    return fallbackInsight(kind, context);
  }
}

export async function generateCoachMessage(question: string, context: VeloHealthContext): Promise<CoachMessage> {
  try {
    return await generateStructured<CoachMessage>(
      `You are Velo, a calm AI health and training coach. Answer the athlete question using only this compact context. Keep the answer under 90 words and return 2-3 concrete actions. No diagnosis.\n\nQuestion: ${question || 'What should I focus on today?'}\n\nContext: ${JSON.stringify(context)}`,
      COACH_SCHEMA,
    );
  } catch {
    return fallbackCoach(question, context);
  }
}
