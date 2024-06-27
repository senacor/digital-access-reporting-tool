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
  totalCount: number
  levelCounts: LevelCount[]
}

export const levels = ["A", "AA"] as const
export type Level = (typeof levels)[number]
export type RuleIdsPerCategoryPerLevel = Record<Level, RuleIdsPerCategory>
export type LevelCount = {
  name: Level
  count: number
}
export type RuleCountPerLevel = Record<Level, number>
export type RuleCountPerLevelPerCategory = Record<Category, RuleCountPerLevel>

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
  title: string
  pageCount: number
  pageReports: SinglePageReport[]
  categoryCounts: CategoryCount[]
  summary: ReportSummary
}
