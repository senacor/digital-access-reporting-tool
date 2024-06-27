import { AccessibilityCheckerReport } from "../types"
import { calculateElementsWithNoViolationsPercentage } from "./calculateElementsWithNoViolationsPercentage"
import { createAggregatedSinglePageReport } from "./createAggregatedSinglePageReport"
import { LevelCount, MultiPageReport } from "./types"

export const createAggregatedMultiPageReport = (
  url: URL,
  title: string,
  reports: AccessibilityCheckerReport[],
) => {
  const multiPageReport: MultiPageReport = {
    urlOrigin: url.origin,
    title,
    pageCount: 0,
    pageReports: [],
    categoryCounts: [],
    summary: {
      totalCount: 0,
      levelCounts: [],
      elementCount: 0,
      elementWithViolationCount: 0,
      elementsWithNoViolationsPercentage: 0,
    },
  }

  for (const report of reports) {
    const pageReport = createAggregatedSinglePageReport(report)

    multiPageReport.pageCount++
    multiPageReport.pageReports.push(pageReport)
    multiPageReport.summary.totalCount += pageReport.summary.totalCount
    multiPageReport.summary.elementCount += pageReport.summary.elementCount
    multiPageReport.summary.elementWithViolationCount +=
      pageReport.summary.elementWithViolationCount

    for (const categoryCount of pageReport.categoryCounts) {
      const aggregatedCategory = multiPageReport.categoryCounts.find(
        (category) => category.name === categoryCount.name,
      )

      if (!aggregatedCategory) {
        multiPageReport.categoryCounts.push(categoryCount)
        continue
      }

      aggregatedCategory.totalCount += categoryCount.totalCount
      aggregateLevelCount(aggregatedCategory.levelCounts, categoryCount.levelCounts)
    }

    aggregateLevelCount(multiPageReport.summary.levelCounts, pageReport.summary.levelCounts)
  }

  multiPageReport.summary.elementsWithNoViolationsPercentage =
    calculateElementsWithNoViolationsPercentage(
      multiPageReport.summary.elementCount,
      multiPageReport.summary.elementWithViolationCount,
    )

  return multiPageReport
}

function aggregateLevelCount(
  aggregationTargetLevelCounts: LevelCount[],
  levelCounts: LevelCount[],
) {
  for (const levelCount of levelCounts) {
    const aggregationTargetLevelCount = aggregationTargetLevelCounts.find(
      (level) => level.name === levelCount.name,
    )

    if (!aggregationTargetLevelCount) {
      aggregationTargetLevelCounts.push(levelCount)
      continue
    }

    aggregationTargetLevelCount.count += levelCount.count
  }
}
