import { AccessibilityCheckerReport } from "../types"
import { calculateElementsWithNoViolationsPercentage } from "./calculateElementsWithNoViolationsPercentage"
import { createAggregatedSinglePageReport } from "./createAggregatedSinglePageReport"
import { CategoryCount, LevelCount, MultiPageReport } from "./types"

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

    aggregateItemCounts(multiPageReport.categoryCounts, pageReport.categoryCounts)
    aggregateItemCounts(multiPageReport.summary.levelCounts, pageReport.summary.levelCounts)
  }

  multiPageReport.summary.elementsWithNoViolationsPercentage =
    calculateElementsWithNoViolationsPercentage(
      multiPageReport.summary.elementCount,
      multiPageReport.summary.elementWithViolationCount,
    )

  return multiPageReport
}

const aggregateItemCounts = <T extends CategoryCount | LevelCount>(
  multiPageReportTarget: T[],
  itemCounts: T[],
) => {
  for (const { name, count } of itemCounts) {
    const aggregatedItem = multiPageReportTarget.find((item) => item.name === name)

    if (aggregatedItem) {
      aggregatedItem.count += count
    } else {
      multiPageReportTarget.push({ name, count } as T)
    }
  }
}
