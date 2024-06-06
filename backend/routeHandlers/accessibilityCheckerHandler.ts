import * as accessibilityChecker from "accessibility-checker"
import { Request, Response } from "express"
import validateUrlParamAndReturnError from "../utils/validateUrlParamAndReturnError"
import { aggregateAccessibilityCheckerReport } from "../utils/report-aggregation/aggregateAccessibilityCheckerReport"

export default async function accessibilityCheckerHandler(req: Request, res: Response) {
  const url = req.body.url
  const validationError = validateUrlParamAndReturnError(req.body.url)

  if (validationError) {
    return res.status(400).send({ error: validationError })
  }

  accessibilityChecker.getCompliance(url, url, (result) => {
    accessibilityChecker.close()

    // TODO: Probably rather create a check with Zod or something similar
    // https://zod.dev/
    const isReportError = "details" in result
    if (isReportError) {
      return res.status(500).send({ error: result })
    }

    const aggregatedResult = aggregateAccessibilityCheckerReport(result)
    return res.send({ result: aggregatedResult })
  })
}
