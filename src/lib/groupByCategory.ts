import type { Location } from "@/data/mockData";
import { CATEGORIES } from "@/data/mockData";

export interface CategoryGroup {
  category: string;
  locations: Location[];
  isPriority: boolean;
}

export function groupByCategory(
  locations: Location[],
  priorityCategories?: Set<string>
): CategoryGroup[] {
  const map = new Map<string, Location[]>();
  locations.forEach((loc) => {
    const list = map.get(loc.category) || [];
    list.push(loc);
    map.set(loc.category, list);
  });

  const groups = CATEGORIES
    .filter((cat) => map.has(cat))
    .map((cat) => ({
      category: cat,
      locations: map.get(cat)!,
      isPriority: priorityCategories ? priorityCategories.has(cat) : true,
    }));

  if (!priorityCategories || priorityCategories.size === 0 || priorityCategories.size === CATEGORIES.length) {
    return groups;
  }

  // Selected categories first, then the rest — each sub-list keeps CATEGORIES order
  const priority = groups.filter((g) => g.isPriority);
  const rest = groups.filter((g) => !g.isPriority);
  return [...priority, ...rest];
}
