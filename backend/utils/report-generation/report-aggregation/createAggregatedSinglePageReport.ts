import { AccessibilityCheckerReport } from "../types"
import { calculateElementsWithNoViolationsPercentage } from "./calculateElementsWithNoViolationsPercentage"
import { levelAARuleIdsPerCategory } from "./levelAARuleIdsPerCategory"
import { levelARuleIdsPerCategory } from "./levelARuleIdsPerCategory"
import {
  Level,
  Category,
  levels,
  SinglePageReport,
  categories,
  RuleIdsPerCategoryPerLevel,
  RuleCountPerLevel,
  RuleCountPerLevelPerCategory,
  CategoryCount,
  LevelCount,
} from "./types"

export function createAggregatedSinglePageReport(report: AccessibilityCheckerReport) {
  // Temporary variables to store the aggregated data
  const ruleCountPerLevelPerCategory = createRuleCountPerLevelPerCategory()
  const pageReportSummaryRuleCountPerLevel = createRuleCountPerLevel()

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
      // Increment the values of the temporary variables
      ruleCountPerLevelPerCategory[associatedCategory][associatedLevel]++
      pageReportSummaryRuleCountPerLevel[associatedLevel]++

      pageReport.summary.totalCount++
      continue
    }

    console.error("Couldn't associate any category with ruleId:", ruleId)
  }

  pageReport.categoryCounts = mapRuleCountPerLevelPerCategoryToCategoryCounts(
    ruleCountPerLevelPerCategory,
  )
  pageReport.summary.levelCounts = mapRuleCountsPerLevelToLevelCounts(
    pageReportSummaryRuleCountPerLevel,
  )

  return pageReport
}

function createRuleCountPerLevel() {
  return levels.reduce((ruleCountPerLevel, level) => {
    ruleCountPerLevel[level] = 0
    return ruleCountPerLevel
  }, {} as RuleCountPerLevel)
}

function createRuleCountPerLevelPerCategory() {
  return categories.reduce((ruleCountPerLevelPerCategory, category) => {
    ruleCountPerLevelPerCategory[category] = createRuleCountPerLevel()
    return ruleCountPerLevelPerCategory
  }, {} as RuleCountPerLevelPerCategory)
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

function mapRuleCountPerLevelPerCategoryToCategoryCounts(
  ruleCountPerLevelPerCategory: RuleCountPerLevelPerCategory,
) {
  const categoryCounts: CategoryCount[] = []

  for (const [category, ruleCountPerLevel] of Object.entries(ruleCountPerLevelPerCategory)) {
    const levelCounts = mapRuleCountsPerLevelToLevelCounts(ruleCountPerLevel)
    const totalCount = levelCounts.reduce((totalCount, { count }) => totalCount + count, 0)

    categoryCounts.push({
      name: category as Category,
      totalCount,
      levelCounts,
    })
  }

  return categoryCounts
}

function mapRuleCountsPerLevelToLevelCounts(ruleCountsPerLevel: RuleCountPerLevel) {
  const levelCounts: LevelCount[] = []

  for (const [name, count] of Object.entries(ruleCountsPerLevel)) {
    levelCounts.push({ name: name as Level, count })
  }

  return levelCounts
}
