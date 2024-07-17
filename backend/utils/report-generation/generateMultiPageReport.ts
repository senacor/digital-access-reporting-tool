import * as accessibilityChecker from "accessibility-checker"
import { crawlDomainUrlsRecursively } from "./crawlDomainUrlsRecursively"
import { createMultiPageReport } from "./report-aggregation/createMultiPageReport"
import { AccessibilityCheckerReport } from "./types"

export default async function generateMultiPageReport(
  url: URL,
  logoUrl: URL,
  screenshotPath: string | null,
) {
  // List of all accessibility checker reports that are generated for each URL
  const accessibilityCheckerReports: AccessibilityCheckerReport[] = []

  // Here we initialize a custom Set (=> ReportCreationSet) that automatically generates a report for each URL that is added to it.
  // The callback we pass to the Set will automatically fill the accessibilityCheckerReports array with the generated reports.
  const reportCreationSet = new ReportCreationSet({
    url,
    reportCallback: (report) => report && accessibilityCheckerReports.push(report),
  })

  // The ReportCreationSet is passed to the recursive URL crawler which will add each crawled URL to it and thus automatically generate a report for it.
  const crawledUrls = await crawlDomainUrlsRecursively(reportCreationSet)

  // The ReportCreationSet throttles the report creation and only a certain number of reports are generated in parallel.
  // This means when the crawling is finished, the report generation might still be running and we wait until all reports are created.
  while (
    reportCreationSet.queuedReportCreationCount > 0 ||
    reportCreationSet.runningReportCreationCount > 0
  ) {
    console.log(
      `🕒 Queued: ${reportCreationSet.queuedReportCreationCount} / Running: ${reportCreationSet.runningReportCreationCount}: Waiting for report generation to finish...`,
    )

    // Wait for 5 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  console.log("🚪 All reports generated. Closing accessibility checker...")
  await accessibilityChecker.close()

  console.log("📊 Aggregating reports...")
  const multiPageReport = createMultiPageReport(
    url,
    logoUrl,
    screenshotPath,
    accessibilityCheckerReports,
  )

  console.log("🚢 Shipping aggregated report!")
  return {
    multiPageReport,
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
   * Creates an extended custom Set that automatically generates a report for each URL that is added to the Set.
   * The report generation is throttled to a certain number of parallel creations.
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

  #createReport(url: string) {
    if (this.has(url)) {
      return
    }

    // Create the report creation for the passed URL
    const reportCreation = async () => {
      try {
        console.log(`📝 Creating report for ${url}...`)
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
        console.log(`🔥 Error for ${url}: error`)
        this.#reportCallback(null)
      }
    }

    // Add the report creation to the queue
    this.#queuedReportCreations.push(reportCreation)
    // Execute the next report creation function
    this.#executeNextReportCreation()
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
}
