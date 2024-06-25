import * as accessibilityChecker from "accessibility-checker"
import { crawlDomainUrlsRecursively } from "./crawlDomainUrls"
import { createAggregatedMultiPageReport } from "./report-aggregation/createAggregatedMultiPageReport"
import { AccessibilityCheckerReport } from "./types"

export default async function generateAggregatedReport(url: URL) {
  const accessibilityCheckerReports: AccessibilityCheckerReport[] = []

  const reporterSet = new ReportCreatorSet({
    url,
    reportCallback: (report) => report && accessibilityCheckerReports.push(report),
  })

  const crawledUrls = await crawlDomainUrlsRecursively(reporterSet)

  while (reporterSet.queuedReportCreationCount > 0 || reporterSet.runningReportCreationCount > 0) {
    console.log(
      `Waiting for report generation to finish... Queued: ${reporterSet.queuedReportCreationCount} | Running: ${reporterSet.runningReportCreationCount} 🕒`,
    )
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  console.log("All reports generated. Aggregating reports... 📊")

  const aggregatedReport = createAggregatedMultiPageReport(url, accessibilityCheckerReports)

  console.log("Aggregation finished. Shipping aggregated report! 🚢")

  return {
    aggregatedReport,
    accessibilityCheckerReports,
    crawledUrls,
  }
}

type ReportCreatorSetArgs = {
  url: URL
  reportCallback: (report: AccessibilityCheckerReport | null) => void
  parallelCreationsLimit?: number
}

class ReportCreatorSet extends Set<string> {
  #reportCallback: ReportCreatorSetArgs["reportCallback"]
  #parallelCreationsLimit: number
  #queuedReportCreations: (() => Promise<void>)[] = []
  #runningCreationCount = 0

  get queuedReportCreationCount() {
    return this.#queuedReportCreations.length
  }

  get runningReportCreationCount() {
    return this.#runningCreationCount
  }

  /**
   * Creates a Set that automatically generates a report for each URL that is added to the set.
   * @param url URL to generate a report for
   * @param reportCallback Callback function that is called with the generated report
   * @param parallelCreationsLimit Maximum number of parallel report creations that are being handled at any time
   */
  constructor({ url, reportCallback, parallelCreationsLimit = 7 }: ReportCreatorSetArgs) {
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

    if (this.#runningCreationCount < this.#parallelCreationsLimit) {
      const fun = this.#queuedReportCreations.shift()
      if (!fun) {
        return
      }

      this.#runningCreationCount += 1

      fun().then(() => {
        this.#runningCreationCount -= 1
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
        const result = await accessibilityChecker.getCompliance(url, url)
        const report = result.report

        // TODO: Probably rather create a check with Zod (https://zod.dev/) or something similar
        const isReportError = "details" in report

        if (isReportError) {
          console.error(`Error in report for ${url}:`, report)
          this.#reportCallback(null)
        } else {
          this.#reportCallback(report)
        }
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
