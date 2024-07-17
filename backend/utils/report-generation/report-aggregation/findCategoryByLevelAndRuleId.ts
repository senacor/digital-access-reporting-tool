import { levelAARuleIdsByCategory } from "./levelAARuleIdsByCategory"
import { levelARuleIdsByCategory } from "./levelARuleIdsByCategory"
import { Category, Level, RuleIdsByCategoryByLevel } from "./types"

const ruleIdsByCategoryByLevel: RuleIdsByCategoryByLevel = {
  A: levelARuleIdsByCategory,
  AA: levelAARuleIdsByCategory,
}

export function findCategoryByLevelAndRuleId(level: Level, ruleId: string) {
  const ruleIdsByCategory = ruleIdsByCategoryByLevel[level]

  for (const [category, ruleIds] of Object.entries(ruleIdsByCategory)) {
    if (ruleIds.has(ruleId)) {
      return category as Category
    }
  }
}
