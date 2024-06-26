import { Request, Response } from "express"
import { getValidatedUrlOrError } from "../utils/urlValidation"
import generateAggregatedReport from "../utils/report-generation/generateAggregatedReport"
import takeScreenshot from "../utils/takeScreenshot"
import { FormValidationError } from "./types"
import { MultiPageReport } from "../utils/report-generation/report-aggregation/types"

export type CreateAccessibilityReportResult = {
  report: MultiPageReport
  screenshotPath: string
}

export default async function createAccessibilityReportHandler(req: Request, res: Response) {
  const formValidationErrors: FormValidationError[] = []
  const urlParam: string | undefined = req.body.url
  const urlValidation = getValidatedUrlOrError(urlParam)

  if (urlValidation.error || !urlValidation.url) {
    formValidationErrors.push({ key: "url", message: urlValidation.error })
    return res.status(400).send({ formValidationErrors })
  }

  const screenshotPath = await takeScreenshot(urlValidation.url)
  if (!screenshotPath) {
    return res
      .status(500)
      .send({ error: "Failed to create screenshot for URL " + urlValidation.url.href })
  }

  const { aggregatedReport } = await generateAggregatedReport(urlValidation.url)
  const result = { screenshotPath, report: aggregatedReport }

  return res.send(result)
}
