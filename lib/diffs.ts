/* Made-up diffs for the meal app's step 3 (design A23), so "Changed files" can show real-looking code.
   Files without an entry here are listed without a diff. */

export type DiffLine = { n: number; kind: " " | "+" | "-"; text: string };
export type FileDiff = { added: number; removed: number; lines: DiffLine[] };

export const diffs: Record<string, FileDiff> = {
  "lib/suggest-meals.ts": {
    added: 2,
    removed: 1,
    lines: [
      { n: 6, kind: " ", text: "export async function suggestMeals(householdId: string) {" },
      { n: 7, kind: " ", text: "  const stock = await pantry.current(householdId)" },
      { n: 8, kind: "+", text: "  const recent = await pantry.confirmedSince(householdId, 3)" },
      { n: 9, kind: "-", text: "  return runAgent(\"meal-planner\", { stock, count: 3 })" },
      { n: 9, kind: "+", text: "  return runAgent(\"meal-planner\", { stock, recent, count: 3 })" },
      { n: 10, kind: " ", text: "}" },
    ],
  },
  "app/today/page.tsx": {
    added: 48,
    removed: 0,
    lines: [
      { n: 1, kind: "+", text: "import { suggestMeals } from \"@/lib/suggest-meals\"" },
      { n: 2, kind: "+", text: "import { MealCard } from \"./meal-card\"" },
      { n: 3, kind: "+", text: "" },
      { n: 4, kind: "+", text: "export default async function Today() {" },
      { n: 5, kind: "+", text: "  const meals = await suggestMeals(await household())" },
      { n: 6, kind: "+", text: "  return <MealList title=\"Dinner ke liye?\" meals={meals} />" },
      { n: 7, kind: "+", text: "}" },
    ],
  },
  "agents/meal-planner/RULES.md": {
    added: 1,
    removed: 0,
    lines: [
      { n: 4, kind: " ", text: "- Suggest exactly 3 meals." },
      { n: 5, kind: " ", text: "- Only use what's in the kitchen." },
      { n: 6, kind: "+", text: "- Don't repeat a dish the family ate in the last 3 days." },
    ],
  },
  "plan.md": {
    added: 1,
    removed: 1,
    lines: [
      { n: 31, kind: "-", text: "3. **Meal suggestions**: the app's AI suggests 3 meals" },
      { n: 31, kind: "+", text: "3. **Meal suggestions**: the app's AI suggests 3 meals, and skips dishes from the last 3 days" },
    ],
  },
};
