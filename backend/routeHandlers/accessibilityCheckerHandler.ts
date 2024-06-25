import { Request, Response } from "express"
import { getValidatedUrlOrError } from "../utils/urlValidation"
import generateAggregatedReport from "../utils/report-generation/generateAggregatedReport"
import takeScreenshot from "../utils/takeScreenshot"

export default async function accessibilityCheckerHandler(req: Request, res: Response) {
  // We want to have a big timeout for this route, because crawling all domain urls
  // and checking them with the accessibility checker can take a long time.
  // 1000ms * 60 * 60 * 1.5 = 5400000ms = 1.5 hours
  req.setTimeout(5400000, () => {
    res.status(408).send({ error: "Request timed out" })
  })

  const urlParam: string | undefined = req.body.url
  const { url, error } = getValidatedUrlOrError(urlParam)

  if (error || !url) {
    return res.status(400).send({ error, url, urlParam })
  }

  const screenshotTaken = await takeScreenshot(url)
  if (!screenshotTaken) {
    return res.status(500).send({ error: "Failed to create screenshot for URL " + url.href })
  }

  const { aggregatedReport } = await generateAggregatedReport(url)
  return res.send({ result: aggregatedReport })
}
