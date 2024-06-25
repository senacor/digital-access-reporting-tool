import { calculateElementsWithNoViolationsPercentage } from "./calculateElementsWithNoViolationsPercentage"
import { levelAARuleIdsPerCategory } from "./levelAARuleIdsPerCategory"
import { levelARuleIdsPerCategory } from "./levelARuleIdsPerCategory"
import {
  Level,
  Category,
  levels,
  CategoryCount,
  LevelCount,
  SinglePageReport,
  categories,
  AccessibilityCheckerReport,
  RuleIdsPerCategoryPerLevel,
  RuleCountsPerItem,
} from "./types"

export function createAggregatedSinglePageReport(report: AccessibilityCheckerReport) {
  const ruleCountsPerCategory = createRuleCountPerItem([...categories])
  const ruleCountsPerLevel = createRuleCountPerItem([...levels])
  const pageReport: SinglePageReport = {
    url: report.summary.URL,
    categoryCounts: [],
    summary: {
      totalCount: 0,
      levelCounts: [],
      elementCount: report.summary.counts.elements,
      elementWithViolationCount: report.summary.counts.elementsViolation,
      elementsWithNoViolationsPercentage: calculateElementsWithNoViolationsPercentage(
        report.summary.counts.elements,
        report.summary.counts.elementsViolation,
      ),
    },
  }

  for (const { ruleId } of report.results) {
    let associatedLevel: Level | undefined
    let associatedCategory: Category | undefined

    for (const level of levels) {
      const category = findAssociatedCategory(ruleId, level)
      if (category) {
        associatedLevel = level
        associatedCategory = category
        break
      }
    }

    if (associatedCategory && associatedLevel) {
      ruleCountsPerCategory[associatedCategory]++
      ruleCountsPerLevel[associatedLevel]++
      pageReport.summary.totalCount++
      continue
    }

    console.error("Couldn't associate any category with ruleId:", ruleId)
  }

  pageReport.categoryCounts = aggregateRuleCountsPerItem(ruleCountsPerCategory)
  pageReport.summary.levelCounts = aggregateRuleCountsPerItem(ruleCountsPerLevel)

  return pageReport
}

function createRuleCountPerItem<T extends Category | Level>(items: T[]) {
  return items.reduce((ruleCountPerItem, item) => {
    ruleCountPerItem[item] = 0
    return ruleCountPerItem
  }, {} as RuleCountsPerItem)
}

const ruleIdsPerCategoryPerLevel: RuleIdsPerCategoryPerLevel = {
  A: levelARuleIdsPerCategory,
  AA: levelAARuleIdsPerCategory,
}

function findAssociatedCategory(ruleId: string, level: Level) {
  for (const [category, ruleIds] of Object.entries(ruleIdsPerCategoryPerLevel[level])) {
    if (ruleIds.has(ruleId)) {
      return category as Category
    }
  }
}

function aggregateRuleCountsPerItem<T extends CategoryCount | LevelCount>(
  ruleCountsPerItem: RuleCountsPerItem,
) {
  return Object.entries(ruleCountsPerItem).map(([name, count]) => {
    return { name, count } as T
  })
}
