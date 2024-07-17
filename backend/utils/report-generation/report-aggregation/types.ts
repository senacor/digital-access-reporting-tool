export const categories = [
  "textAlternatives",
  "logicalNavigationAndIntuitiveness",
  "codingStandards",
  "colorContrast",
  "inputAssistance",
  "keyboardOperability",
] as const
export type Category = (typeof categories)[number]
export type RuleIdsByCategory = Record<Category, Set<string>>
export type CategoryIssueCount = {
  name: Category
  totalIssueCount: number
  levelIssueCounts: LevelIssueCount[]
}

export const levels = ["A", "AA"] as const
export type Level = (typeof levels)[number]
export type RuleIdsByCategoryByLevel = Record<Level, RuleIdsByCategory>
export type LevelIssueCount = {
  name: Level
  issueCount: number
}
export type RuleCountByLevel = Record<Level, number>
export type RuleCountByLevelByCategory = Record<Category, RuleCountByLevel>

export type ReportSummary = {
  totalIssueCount: number
  levelIssueCounts: LevelIssueCount[]
  elementCount: number
  elementWithViolationCount: number
  elementsWithNoViolationsPercentage: number // 0.93 -> 93%
}

export type SinglePageReport = {
  url: string // "https://www.example.com/foo/bar"
  categoryIssueCounts: CategoryIssueCount[]
  summary: ReportSummary
}

export type MultiPageReport = SinglePageReport & {
  logoUrl: string // "https://www.example.com/logo.png"
  pageCount: number
  pageReports: SinglePageReport[]
}
