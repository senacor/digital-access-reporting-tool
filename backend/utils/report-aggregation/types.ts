import { levelAARuleIdsPerCategory } from "./levelAARuleIdsPerCategory"
import { levelARuleIdsPerCategory } from "./levelARuleIdsPerCategory"

export const categoryNames = [
  "textAlternatives",
  "logicalNavigationAndIntuitiveness",
  "codingStandards",
  "colorContrast",
  "inputAssistance",
  "keyboardOperability",
] as const

export type CategoryName = (typeof categoryNames)[number]

export const levelNames = ["A", "AA"] as const
export type LevelName = (typeof levelNames)[number]

export type RuleIdsPerCategory = Record<CategoryName, Set<string>>
export type RuleIdsPerCategoryPerLevel = Record<LevelName, RuleIdsPerCategory>

export const ruleIdsPerCategoryPerLevel: RuleIdsPerCategoryPerLevel = {
  A: levelARuleIdsPerCategory,
  AA: levelAARuleIdsPerCategory,
}

export type AggregatedReportCategory = {
  name: CategoryName
  count: number
}

export type AggregatedReportLevel = {
  name: LevelName
  count: number
}

export type AggregatedReportSummary = {
  totalCount: number
  levelCounts: AggregatedReportLevel[]
  elementsWithNoViolations: number // 0.93 -> 93%
}

export type AggregatedReport = {
  url: string // "http://www.example.com"
  categoryCounts: AggregatedReportCategory[]
  summary: AggregatedReportSummary
}
