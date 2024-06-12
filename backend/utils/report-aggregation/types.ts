import { IBaselineReport } from "accessibility-checker/lib/common/engine/IReport"

export type AccessibilityCheckerReport = IBaselineReport

export const categories = [
  "textAlternatives",
  "logicalNavigationAndIntuitiveness",
  "codingStandards",
  "colorContrast",
  "inputAssistance",
  "keyboardOperability",
] as const
export type Category = (typeof categories)[number]
export type RuleIdsPerCategory = Record<Category, Set<string>>
export type CategoryCount = {
  name: Category
  count: number
}

export const levels = ["A", "AA"] as const
export type Level = (typeof levels)[number]
export type RuleIdsPerCategoryPerLevel = Record<Level, RuleIdsPerCategory>
export type LevelCount = {
  name: Level
  count: number
}

export type RuleCountsPerItem = Record<Category | Level, number>

export type ReportSummary = {
  totalCount: number
  levelCounts: LevelCount[]
  elementCount: number
  elementWithViolationCount: number
  elementsWithNoViolationsPercentage: number // 0.93 -> 93%
}

export type SinglePageReport = {
  url: string // "https://www.example.com/foo/bar"
  categoryCounts: CategoryCount[]
  summary: ReportSummary
}

export type MultiPageReport = {
  urlOrigin: string // "https://www.example.com"
  pageCount: number
  pageReports: SinglePageReport[]
  categoryCounts: CategoryCount[]
  summary: ReportSummary
}
