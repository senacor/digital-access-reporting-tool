import { AccessibilityCheckerReport } from "../types"
import { calculateElementsWithNoViolationsPercentage } from "./calculateElementsWithNoViolationsPercentage"
import { createSinglePageReport } from "./createSinglePageReport"
import { LevelIssueCount, MultiPageReport, SinglePageReport, TreePageReport } from "./types"

/**
 * Aggregates multiple single page reports into a joined multi page report.
 *
 * @param url The entry point from which the reports were generated. Usually this should be the home page of the domain.
 * @param logoUrl The URL of the logo that should be displayed in the report.
 * @param accessibilityCheckerReports The reports generated by the accessibility checker tool which should be aggregated.
 * @returns A multi page report that contains all aggregated single page reports.
 */
export const createMultiPageReport = (
  url: URL,
  logoUrl: URL,
  screenshotPath: string | null,
  accessibilityCheckerReports: AccessibilityCheckerReport[],
) => {
  const multiPageReport: MultiPageReport = {
    url: url.origin,
    logoUrl: logoUrl.href,
    screenshotPath,
    pageCount: 0,
    pageReports: [],
    categoryIssueCounts: [],
    summary: {
      totalIssueCount: 0,
      levelIssueCounts: [],
      elementCount: 0,
      elementWithViolationCount: 0,
      elementsWithNoViolationsPercentage: 0,
    },
    treePageReport: null,
  }

  for (const accessibilityCheckerReport of accessibilityCheckerReports) {
    const singlePageReport = createSinglePageReport(accessibilityCheckerReport)

    // The aggregation of the category issue counts is a bit more complex since
    // they're stored in an array, we have to find them in the multiPageReport
    // and aggregate them one by one.
    for (const singlePageCategoryIssueCounts of singlePageReport.categoryIssueCounts) {
      const multiPageCategoryIssueCount = multiPageReport.categoryIssueCounts.find(
        (category) => category.name === singlePageCategoryIssueCounts.name,
      )

      // If we can't find the category in the multi page report, we copy the current one
      if (!multiPageCategoryIssueCount) {
        multiPageReport.categoryIssueCounts.push({
          name: singlePageCategoryIssueCounts.name,
          totalIssueCount: singlePageCategoryIssueCounts.totalIssueCount,
          levelIssueCounts: singlePageCategoryIssueCounts.levelIssueCounts.map((level) => ({
            ...level,
          })),
        })
        continue
      }

      multiPageCategoryIssueCount.totalIssueCount += singlePageCategoryIssueCounts.totalIssueCount
      aggregateLevelIssueCounts(
        multiPageCategoryIssueCount.levelIssueCounts,
        singlePageCategoryIssueCounts.levelIssueCounts,
      )
    }

    // Here we aggregate the simpler values of the multi page report
    multiPageReport.pageCount++
    multiPageReport.pageReports.push(singlePageReport)
    multiPageReport.summary.totalIssueCount += singlePageReport.summary.totalIssueCount

    aggregateLevelIssueCounts(
      multiPageReport.summary.levelIssueCounts,
      singlePageReport.summary.levelIssueCounts,
    )

    multiPageReport.summary.elementCount += singlePageReport.summary.elementCount
    multiPageReport.summary.elementWithViolationCount +=
      singlePageReport.summary.elementWithViolationCount
  }

  multiPageReport.summary.elementsWithNoViolationsPercentage =
    calculateElementsWithNoViolationsPercentage(
      multiPageReport.summary.elementCount,
      multiPageReport.summary.elementWithViolationCount,
    )

  multiPageReport.treePageReport = createTreePageReport(multiPageReport.pageReports)

  return multiPageReport
}

function aggregateLevelIssueCounts(
  aggregatedLevelIssueCounts: LevelIssueCount[],
  levelIssueCountsToAggregate: LevelIssueCount[],
) {
  // The aggregation of the level issue counts is a bit more complex since
  // they're stored in an array, we have to find them in the aggregatedLevelIssueCounts
  // and aggregate them one by one.
  for (const levelIssueCountToAggregate of levelIssueCountsToAggregate) {
    const aggregatedLevelIssueCount = aggregatedLevelIssueCounts.find(
      (level) => level.name === levelIssueCountToAggregate.name,
    )

    // If we can't find the category in the multi page report, we copy the current one
    if (!aggregatedLevelIssueCount) {
      aggregatedLevelIssueCounts.push({ ...levelIssueCountToAggregate })
      continue
    }

    aggregatedLevelIssueCount.issueCount += levelIssueCountToAggregate.issueCount
  }
}

function createTreePageReport(pages: SinglePageReport[]) {

  const base: TreePageReport = emptyTreePageReport("/")

  for (const page of pages) {
    const protocol = new URL(page.url).protocol
    const path = page.url.match(/\/[^/]+/g)

    if (!path) continue

    const fullPath = protocol + "/" + path?.join("")
    let curr = base

    path?.forEach((_e, i) => {
      // prepend the protocl (e.g. https: and '/' to the current path)
      const currPath = protocol + "/" + path?.slice(0, i+1).join("")
      const child = curr.children.find(e => e.url === currPath)

      if (child) {
        curr = child
      } else {
        const treeReport = emptyTreePageReport(currPath)
        curr.children.push(treeReport)
        curr = curr.children[curr.children.length-1]
        curr.children = curr.children.sort((a,b) => a.url.localeCompare(b.url))
      }
      if (fullPath === currPath) {
        curr.page = page
      }
    })
  }

  // calculate sums
  calculateStats(base)

  return base
}

function emptyTreePageReport(url: string): TreePageReport {
  return {
    url: url,
    page: null,
    children: [],
    categoryIssueCounts: [],
    summary: {
      totalIssueCount: 0,
      levelIssueCounts: [],
      elementCount: 0,
      elementWithViolationCount: 0,
      elementsWithNoViolationsPercentage: 0
    },
  }
}

function calculateStats(treePage: TreePageReport) {
  if (treePage.page !== null) {
    treePage.summary = treePage.page.summary
    treePage.categoryIssueCounts = treePage.page.categoryIssueCounts
  }

  for (const child of treePage.children) {
    calculateStats(child)

    for (const singlePageCategoryIssueCounts of child.categoryIssueCounts) {
      const multiPageCategoryIssueCount = treePage.categoryIssueCounts.find(
        (category) => category.name === singlePageCategoryIssueCounts.name,
      )

      // If we can't find the category in the multi page report, we copy the current one
      if (!multiPageCategoryIssueCount) {
        treePage.categoryIssueCounts.push({
          name: singlePageCategoryIssueCounts.name,
          totalIssueCount: singlePageCategoryIssueCounts.totalIssueCount,
          levelIssueCounts: singlePageCategoryIssueCounts.levelIssueCounts.map((level) => ({
            ...level,
          })),
        })
        continue
      }

      multiPageCategoryIssueCount.totalIssueCount += singlePageCategoryIssueCounts.totalIssueCount
      aggregateLevelIssueCounts(
        multiPageCategoryIssueCount.levelIssueCounts,
        singlePageCategoryIssueCounts.levelIssueCounts,
      )
    }

    // Here we aggregate the simpler values of the multi page report
    treePage.summary.totalIssueCount += child.summary.totalIssueCount

    aggregateLevelIssueCounts(
      treePage.summary.levelIssueCounts,
      child.summary.levelIssueCounts,
    )

    treePage.summary.elementCount += child.summary.elementCount
    treePage.summary.elementWithViolationCount +=
      child.summary.elementWithViolationCount
  }

  treePage.summary.elementsWithNoViolationsPercentage =
    calculateElementsWithNoViolationsPercentage(
      treePage.summary.elementCount,
      treePage.summary.elementWithViolationCount,
    )
}