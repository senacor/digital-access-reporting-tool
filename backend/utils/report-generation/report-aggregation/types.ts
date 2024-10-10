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

// const singlePageReport: SinglePageReport = {
//   url: "https://www.example.com/foo/bar",
//   categoryIssueCounts: [
//     {
//       name: "textAlternatives",
//       totalIssueCount: 3,
//       levelIssueCounts: [
//         { name: "A", issueCount: 1 },
//         { name: "AA", issueCount: 2 },
//       ],
//     },
//     {
//       name: "codingStandards",
//       totalIssueCount: 2,
//       levelIssueCounts: [
//         { name: "A", issueCount: 1 },
//         { name: "AA", issueCount: 1 },
//       ],
//     }
//   ],
//   summary: {
//     totalIssueCount: 5,
//     levelIssueCounts: [
//       {
//         name: "A",
//         issueCount: 2
//       },
//       {
//         name: "AA",
//         issueCount: 3
//       }
//     ],
//     elementCount: 100,
//     elementWithViolationCount: 5,
//     elementsWithNoViolationsPercentage: 0.95,
//   },
// }

export type SinglePageReport = {
  url: string
  categoryIssueCounts: CategoryIssueCount[]
  summary: ReportSummary
}

// const multiPageReport: MultiPageReport = {
//   url: "https://www.example.com",
//   logoUrl: "https://www.example.com/logo.png",
//   screenshotPath: "screenshots/1234567890.png",
//   pageCount: 1,
//   pageReports: [{ ...singlePageReport }],
//   categoryIssueCounts: [
//     {
//       name: "textAlternatives",
//       totalIssueCount: 3,
//       levelIssueCounts: [
//         { name: "A", issueCount: 1 },
//         { name: "AA", issueCount: 2 },
//       ],
//     },
//     {
//       name: "codingStandards",
//       totalIssueCount: 2,
//       levelIssueCounts: [
//         { name: "A", issueCount: 1 },
//         { name: "AA", issueCount: 1 },
//       ],
//     }
//   ],
//   summary: {
//     totalIssueCount: 5,
//     levelIssueCounts: [
//       {
//         name: "A",
//         issueCount: 2
//       },
//       {
//         name: "AA",
//         issueCount: 3
//       }
//     ],
//     elementCount: 100,
//     elementWithViolationCount: 5,
//     elementsWithNoViolationsPercentage: 0.95,
//   },
// }
export type MultiPageReport = SinglePageReport & {
  logoUrl: string
  screenshotPath: string | null
  pageCount: number
  pageReports: SinglePageReport[]
  treePageReport: TreePageReport | null
}

export type TreePageReport = SinglePageReport & {
  page: SinglePageReport | null
  children: TreePageReport[]
}