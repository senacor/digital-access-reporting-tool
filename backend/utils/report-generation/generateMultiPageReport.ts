import fs from "node:fs"
import * as accessibilityChecker from "accessibility-checker"

import { crawlDomainUrlsRecursively } from "./crawlDomainUrlsRecursively"
import { createMultiPageReport } from "./report-aggregation/createMultiPageReport"
import { cpuCount, AccessibilityCheckerReport } from "./types"
import { withProxy } from "../proxy"

/**
 * Generic wait function- stops when either the condition is 'true' or the specified timeout has been reached.
 * Inspired by (credits to Nick): https://stackoverflow.com/questions/76418895/is-there-a-way-to-use-await-to-wait-until-a-condition-returns-true
 * @async
 * @function waitUntilTrue
 * @param () => boolean conditionFunction
 * @param number [interval=5000]
 * @param number [timeout=3600000]
 * @param boolean [throwOnTimeout=false]
 * @returns Promise<boolean>
 */
async function waitUntilTrue(
  conditionFunction: any,
  interval = 10000,
  timeout = 3600000,
  throwOnTimeout = false,
) {
  let timePassed = 0
  return new Promise<boolean>(function poll(resolve, reject) {
    let timeoutId: undefined | ReturnType<typeof setTimeout>
    if (timePassed >= timeout) {
      clearTimeout(timeoutId)
      return throwOnTimeout ? reject() : resolve(true)
    }
    if (conditionFunction()) {
      return resolve(false)
    }
    timePassed += interval
    const showMinutes = timePassed > 60000
    console.log(
      `🕒 After ${Math.round(timePassed / (showMinutes ? 60000 : 1000))} ${showMinutes ? "minute(s)" : "second(s)"} waiting for report generation to finish...`,
    )
    timeoutId = setTimeout(() => poll(resolve, reject), interval)
  })
}

export default async function generateMultiPageReport(
  url: URL,
  logoUrl: URL,
  screenshotUrl: string | null,
) {
  // List of all accessibility checker reports that are generated for each URL
  const accessibilityCheckerReports: AccessibilityCheckerReport[] = []

  // The ReportCreationSet is passed to the recursive URL crawler which will add each crawled URL to it and thus automatically generate a report for it.
  const crawledUrls = await crawlDomainUrlsRecursively(url.href)
  // Here we initialize a custom Set (=> ReportCreationSet) that automatically generates a report for each URL that is added to it.
  // The callback we pass to the Set will automatically fill the accessibilityCheckerReports array with the generated reports.
  const reportCreationSet = new ReportCreationSet({
    url,
    reportCallback: (report) => report && accessibilityCheckerReports.push(report),
  })

  crawledUrls.successes.forEach((cu) => reportCreationSet.add(cu))

  // The ReportCreationSet throttles the report creation and only a certain number of reports are generated in parallel.
  // This means when the crawling is finished, the report generation might still be running and we wait until all reports are created.
  const timedOut = await waitUntilTrue(() => {
    const percentage = `${crawledUrls.succeeded() == 0 ? 0 : Math.floor(((crawledUrls.succeeded() - reportCreationSet.queuedReportCreationsCount - reportCreationSet.runningReportCreationsCount) / crawledUrls.succeeded()) * 100)}% `
    process.stdout.write(percentage)
    return (
      crawledUrls.succeeded() == 0 ||
      reportCreationSet.queuedReportCreationsCount +
        reportCreationSet.runningReportCreationsCount ===
        0
    )
  })

  console.log(
    `🚪 ${timedOut ? "Not all (due to timeout)" : "All"} reports generated. Closing accessibility checker...`,
  )
  await accessibilityChecker.close()

  console.log("📊 Aggregating reports...")
  const multiPageReport = createMultiPageReport(
    url,
    logoUrl,
    screenshotUrl,
    accessibilityCheckerReports,
  )
  await fs.writeFile(
    "./.accessibility-checker/accessibility-report.json",
    JSON.stringify({ report: multiPageReport }),
    (error) => {
      if (error) {
        console.log(`🔥 Couldn't persist the accessibility report, reason: ${error}`)
      }
    },
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

  get queuedReportCreationsCount() {
    return this.#queuedReportCreations.length
  }

  get runningReportCreationsCount() {
    return this.#runningReportCreationsCount
  }

  /**
   * Creates an extended custom Set that automatically generates a report for each URL that is added to the Set.
   * The report generation is throttled to a certain number of parallel creations.
   * @param url URL to generate a report for
   * @param reportCallback Callback function that is called with the generated report
   * @param parallelCreationsLimit Maximum number of parallel report creations that are being handled at any time
   */
  constructor({ url, reportCallback, parallelCreationsLimit = cpuCount }: ReportCreationSetArgs) {
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
      ++this.#runningReportCreationsCount
      let reportCallbackParameter: any = null
      try {
        console.log(`📝 Creating report for ${url}...`)
        const proxy = await withProxy()
        if (proxy) process.env["HTTP_PROXY"] = `https://${proxy.host}:${proxy.port}`
        const { report } = await accessibilityChecker.getCompliance(url, url)
        reportCallbackParameter = report
        // Sadly there's no better way to check if the report is an error
        const isReportError = "details" in report
        if (isReportError) {
          console.error(`Error in report for ${url}:`, report)
          reportCallbackParameter = null
        }
      } catch (error) {
        console.log(`🔥 Error for ${url}: ${error}`)
      } finally {
        --this.#runningReportCreationsCount
        this.#reportCallback(reportCallbackParameter)
        console.log(`✔ Completed reporting for ${url}!`)
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
      fun().then(() => {
        this.#executeNextReportCreation()
      })
    }
  }
}
