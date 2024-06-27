import * as accessibilityChecker from "accessibility-checker"
import { crawlDomainUrlsRecursively } from "./crawlDomainUrls"
import { createAggregatedMultiPageReport } from "./report-aggregation/createAggregatedMultiPageReport"
import { AccessibilityCheckerReport } from "./types"

export default async function generateAggregatedReport(url: URL, title: string) {
  const accessibilityCheckerReports: AccessibilityCheckerReport[] = []

  const reportCreationSet = new ReportCreationSet({
    url,
    reportCallback: (report) => report && accessibilityCheckerReports.push(report),
  })

  const crawledUrls = await crawlDomainUrlsRecursively(reportCreationSet)

  while (
    reportCreationSet.queuedReportCreationCount > 0 ||
    reportCreationSet.runningReportCreationCount > 0
  ) {
    console.log(
      `Waiting for report generation to finish... Queued: ${reportCreationSet.queuedReportCreationCount} | Running: ${reportCreationSet.runningReportCreationCount} 🕒`,
    )
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  console.log("All reports generated. Aggregating reports... 📊")

  const aggregatedReport = createAggregatedMultiPageReport(url, title, accessibilityCheckerReports)

  console.log("Aggregation finished. Shipping aggregated report! 🚢")

  return {
    aggregatedReport,
    accessibilityCheckerReports,
    crawledUrls,
  }
}

type ReportCreationSetArgs = {
  url: URL
  reportCallback: (report: AccessibilityCheckerReport | null) => void
  parallelCreationsLimit?: number
}

class ReportCreationSet extends Set<string> {
  #reportCallback: ReportCreationSetArgs["reportCallback"]
  #parallelCreationsLimit: number
  #queuedReportCreations: (() => Promise<void>)[] = []
  #runningReportCreationsCount = 0

  get queuedReportCreationCount() {
    return this.#queuedReportCreations.length
  }

  get runningReportCreationCount() {
    return this.#runningReportCreationsCount
  }

  /**
   * Creates a Set that automatically generates a report for each URL that is added to the set.
   * @param url URL to generate a report for
   * @param reportCallback Callback function that is called with the generated report
   * @param parallelCreationsLimit Maximum number of parallel report creations that are being handled at any time
   */
  constructor({ url, reportCallback, parallelCreationsLimit = 7 }: ReportCreationSetArgs) {
    super()
    this.#reportCallback = reportCallback
    this.#parallelCreationsLimit = parallelCreationsLimit

    // We call add() manually after our class was initialized completely
    // because super([url.href]) would cause an error since the Set class
    // calls add() internally which would fail because #reportCallback and #throttler
    // would not be set at that time yet.
    this.add(url.href)
  }

  #executeNextReportCreation() {
    if (!this.#queuedReportCreations.length) {
      return
    }

    if (this.#runningReportCreationsCount < this.#parallelCreationsLimit) {
      const fun = this.#queuedReportCreations.shift()
      if (!fun) {
        return
      }

      this.#runningReportCreationsCount += 1

      fun().then(() => {
        this.#runningReportCreationsCount -= 1
        this.#executeNextReportCreation()
      })
    }
  }

  #createReport(url: string) {
    if (this.has(url)) {
      return
    }

    this.#queuedReportCreations.push(async () => {
      try {
        console.log(`Creating report for ${url} 📝`)
        const { report } = await accessibilityChecker.getCompliance(url, url)

        // Sadly there's no better way to check if the report is an error
        const isReportError = "details" in report
        if (isReportError) {
          console.error(`Error in report for ${url}:`, report)
          this.#reportCallback(null)
          return
        }

        this.#reportCallback(report)
      } catch (error) {
        console.log(`Error for ${url}:`, error)
        this.#reportCallback(null)
      }
    })

    this.#executeNextReportCreation()
  }

  /**
   * We extended the add function of the Set class to automatically generate a report
   * for the URL that is being added to the set.
   * @param url
   * @returns this
   */
  add(url: string) {
    this.#createReport(url)
    super.add(url)
    return this
  }
}
