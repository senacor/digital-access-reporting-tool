import { IBaselineReport as AccessibilityCheckerReport } from "accessibility-checker/lib/common/engine/IReport"

export type AggregatedReport = {
  url: string // "http://www.example.com"
  summary: {
    total: number
    totalA: number
    totalAA: number
    elementsWithNoViolations: number // 0.93 -> 93%
  }
  categories: {
    textAlternatives: number
    logicalNavigationAndIntuitiveness: number
    codingStandards: number
    colorContrast: number
    inputAssistance: number
    keyboardOperability: number
  }
}

export function aggregateAccessibilityCheckerReport(report: AccessibilityCheckerReport) {
  // 🚧 WIP: aggregate the missing values

  return {
    url: report.summary.URL,
    summary: {
      total: 0,
      totalA: 0,
      totalAA: 0,
      elementsWithNoViolations: calculatePercentageOfElementsWithNoViolations(
        report.summary.counts.elements,
        report.summary.counts.elementsViolation,
      ),
    },
    categories: {
      textAlternatives: 0,
      logicalNavigationAndIntuitiveness: 0,
      codingStandards: 0,
      colorContrast: 0,
      inputAssistance: 0,
      keyboardOperability: 0,
    },
  } satisfies AggregatedReport
}

/**
 * @param totalElements Number of all elements
 * @param elementsWithViolations Number of elements with violations
 * @returns number Percentage of elements with no violations as a number between 0 and 1
 */
function calculatePercentageOfElementsWithNoViolations(
  totalElements: number,
  elementsWithViolations: number,
) {
  // e.g.: (10 items * 100%) / 200 total items = 5%
  const percentageOfElementsWithViolations = (elementsWithViolations * 100) / totalElements

  // e.g.: (100% - 5%) / 100 = 0.95;
  return (100 - percentageOfElementsWithViolations) / 100
}
