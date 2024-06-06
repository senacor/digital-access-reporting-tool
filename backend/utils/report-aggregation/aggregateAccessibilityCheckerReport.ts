import { IBaselineReport as AccessibilityCheckerReport } from "accessibility-checker/lib/common/engine/IReport"
import {
  LevelName,
  CategoryName,
  levelNames,
  AggregatedReportCategory,
  AggregatedReportLevel,
  AggregatedReport,
  categoryNames,
  ruleIdsPerCategoryPerLevel,
} from "./types"

export function aggregateAccessibilityCheckerReport(report: AccessibilityCheckerReport) {
  let totalCount = 0
  const ruleCountsPerCategoryName = createRuleCountPerCategoryName()
  const ruleCountsPerLevelName = createRuleCountPerLevelName()

  for (const { ruleId } of report.results) {
    let associatedLevelName: LevelName | undefined
    let associatedCategoryName: CategoryName | undefined

    for (const levelName of levelNames) {
      const foundCategoryName = findAssociatedCategoryName(ruleId, levelName)
      if (foundCategoryName) {
        associatedLevelName = levelName
        associatedCategoryName = foundCategoryName
        break
      }
    }

    if (associatedCategoryName && associatedLevelName) {
      ruleCountsPerCategoryName[associatedCategoryName]++
      ruleCountsPerLevelName[associatedLevelName]++
      totalCount++
      continue
    }

    console.error("Couldn't associate any category with ruleId:", ruleId)
  }

  return {
    url: report.summary.URL,
    categoryCounts: Object.entries(ruleCountsPerCategoryName).map<AggregatedReportCategory>(
      ([name, count]) => ({ name: name as CategoryName, count }),
    ),
    summary: {
      totalCount,
      levelCounts: Object.entries(ruleCountsPerLevelName).map<AggregatedReportLevel>(
        ([name, count]) => ({ name: name as LevelName, count }),
      ),
      elementsWithNoViolations: calculatePercentageOfElementsWithNoViolations(
        report.summary.counts.elements,
        report.summary.counts.elementsViolation,
      ),
    },
  } satisfies AggregatedReport
}

const createRuleCountPerCategoryName = () => {
  return categoryNames.reduce(
    (ruleCountPerCategoryName, categoryName) => {
      ruleCountPerCategoryName[categoryName] = 0
      return ruleCountPerCategoryName
    },
    {} as Record<CategoryName, number>,
  )
}

const createRuleCountPerLevelName = () => {
  return levelNames.reduce(
    (ruleCountPerLevelName, levelName) => {
      ruleCountPerLevelName[levelName] = 0
      return ruleCountPerLevelName
    },
    {} as Record<LevelName, number>,
  )
}

const findAssociatedCategoryName = (ruleId: string, level: LevelName) => {
  for (const [categoryName, ruleIds] of Object.entries(ruleIdsPerCategoryPerLevel[level])) {
    if (ruleIds.has(ruleId)) {
      return categoryName as CategoryName
    }
  }
}

/**
 * @param totalElements Number of all elements
 * @param elementsWithViolations Number of elements with violations
 * @returns number Percentage of elements with no violations as a number between 0 and 1
 */
const calculatePercentageOfElementsWithNoViolations = (
  totalElements: number,
  elementsWithViolations: number,
) => {
  // e.g.: (10 items * 100%) / 200 total items = 5%
  const percentageOfElementsWithViolations = (elementsWithViolations * 100) / totalElements
  // e.g.: (100% - 5%) / 100 = 0.95;
  const result = (100 - percentageOfElementsWithViolations) / 100
  const roundedResult = Math.round(result * 100) / 100
  roundedResult.toFixed(2)

  return roundedResult
}
