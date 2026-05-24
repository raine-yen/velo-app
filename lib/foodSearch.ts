import { FoodItem } from '@/types';

const BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

function toFoodItem(p: any): FoodItem | null {
  const name = p.product_name_en || p.product_name;
  if (!name) return null;

  const n = p.nutriments ?? {};
  const hasServing = n['energy-kcal_serving'] != null;
  const serving = p.serving_size || '1 serving';

  const calories = hasServing ? Math.round(n['energy-kcal_serving']) : Math.round((n['energy-kcal_100g'] ?? 0) / 100 * 100);
  const protein = hasServing ? Math.round(n['proteins_serving'] ?? 0) : Math.round(n['proteins_100g'] ?? 0);
  const carbs = hasServing ? Math.round(n['carbohydrates_serving'] ?? 0) : Math.round(n['carbohydrates_100g'] ?? 0);
  const fat = hasServing ? Math.round(n['fat_serving'] ?? 0) : Math.round(n['fat_100g'] ?? 0);

  if (calories === 0 && protein === 0 && carbs === 0 && fat === 0) return null;

  return {
    id: `off_${p.id ?? p.code ?? Math.random()}`,
    name: name.trim(),
    servingDesc: serving,
    calories,
    protein,
    carbs,
    fat,
  };
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '20',
    fields: 'id,code,product_name,product_name_en,serving_size,nutriments',
  });

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) return [];
  const json = await res.json();

  return (json.products ?? [])
    .map(toFoodItem)
    .filter(Boolean) as FoodItem[];
}
