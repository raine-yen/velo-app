import { FoodItem } from '@/types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const PROMPT = `Analyze this meal photo and identify every food item visible. For each item, estimate macronutrients for the portion shown.

Respond with a JSON array only — no markdown, no explanation, just the array.

[
  {
    "name": "Chicken breast",
    "servingDesc": "4 oz grilled",
    "calories": 187,
    "protein": 35,
    "carbs": 0,
    "fat": 4,
    "servings": 1
  }
]

Rules:
- Round all numbers to integers
- Use realistic portion sizes based on what's visible
- If you can't identify a food, skip it
- Include sauces, dressings, toppings as separate items`;

export type AnalyzedFood = { food: FoodItem; servings: number };

export async function analyzeMealPhoto(base64: string): Promise<AnalyzedFood[]> {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: 'image/jpeg', data: base64 } },
        ],
      }],
      generationConfig: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status}: ${errBody.slice(0, 200)}`);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON in response');

  const items = JSON.parse(match[0]) as {
    name: string; servingDesc: string; calories: number;
    protein: number; carbs: number; fat: number; servings: number;
  }[];

  return items.map((item, i) => ({
    food: {
      id: `ai_${Date.now()}_${i}`,
      name: item.name,
      servingDesc: item.servingDesc,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    },
    servings: item.servings ?? 1,
  }));
}
