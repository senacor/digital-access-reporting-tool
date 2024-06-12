import * as accessibilityChecker from "accessibility-checker"
import { Request, Response } from "express"
import { createAggregatedMultiPageReport } from "../utils/report-aggregation/createAggregatedMultiPageReport"
import crawlDomainUrls from "../utils/crawlDomainUrls"
import { AccessibilityCheckerReport } from "../utils/report-aggregation/types"
import { validateAndReturnUrlOrError } from "../utils/urlValidation"

export default async function accessibilityCheckerHandler(req: Request, res: Response) {
  // We want to have a big timeout for this route, because crawling all domain urls
  // and checking them with the accessibility checker can take a long time.
  // 1000ms * 60 * 60 * 1.5 = 5400000ms = 1.5 hours
  req.setTimeout(5400000, () => {
    res.status(408).send({ error: "Request timed out" })
  })

  const urlParam: string | undefined = req.body.url
  const urlOrError = validateAndReturnUrlOrError(urlParam)

  if (urlOrError.error || !urlOrError.url) {
    return res.status(400).send({ error: urlOrError, url: urlParam })
  }

  try {
    const sameDomainUrls = await crawlDomainUrls(urlOrError.url!.href)
    const reports: AccessibilityCheckerReport[] = []

    // Parallelize the accessibility checker requests to increase speed
    for (let i = 0; i < sameDomainUrls.length; i += 5) {
      const urlsToCheck = sameDomainUrls.slice(i, i + 5)

      await Promise.all(
        urlsToCheck.map(async (url) => {
          const report = await getAccessabilityCheckerReport(url)
          report && reports.push(report)
        }),
      )
    }

    await accessibilityChecker.close()

    return res.send({
      result: createAggregatedMultiPageReport(urlOrError.url, reports),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error })
  }
}

async function getAccessabilityCheckerReport(url: string) {
  try {
    const result = await accessibilityChecker.getCompliance(url, url)
    const report = result.report

    // TODO: Probably rather create a check with Zod or something similar
    // https://zod.dev/
    const isReportError = "details" in report
    if (isReportError) {
      console.error(`Error in report for ${url}:`, report)
      return null
    }

    return report
  } catch (error) {
    console.log(`Error for ${url}:`, error)
    return null
  }
}
