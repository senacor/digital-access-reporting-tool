import getValidUrlOrNull from "../utils/getValidUrlOrNull"
import generateAggregatedReport from "../utils/report-generation/generateAggregatedReport"
import takeScreenshot from "../utils/takeScreenshot"
import { ResponseBody, ServerError, TypedExpressRequest, TypedExpressResponse } from "./utils/types"
import { MultiPageReport } from "../utils/report-generation/report-aggregation/types"
import { z } from "zod"
import mapZodIssuesToFormValidationErrors from "./utils/mapZodIssuesToFormValidationErrors"
import { urlSchema } from "./utils/schemas"

const requestBodySchema = z.object({
  url: urlSchema,
  title: z
    .string({ required_error: "Report title is required" })
    .min(1, "Report title is required"),
})

type ReqBody = z.infer<typeof requestBodySchema>
type Data = { screenshotPath: string; report: MultiPageReport }
type ResBody = ResponseBody<Data, ReqBody>
type FormErrors = NonNullable<ResBody["formErrors"]>
type FormError = FormErrors[number]

export type {
  ReqBody as CreateAccessibilityReportRequestBody,
  ResBody as CreateAccessibilityReportResponseBody,
}

export default async function createAccessibilityReportHandler(
  req: TypedExpressRequest<ReqBody>,
  res: TypedExpressResponse<ResBody>,
) {
  const validatedBody = requestBodySchema.safeParse(req.body)
  if (!validatedBody.success) {
    const formErrors = mapZodIssuesToFormValidationErrors(validatedBody.error.issues)
    return res.status(400).send({ data: null, formErrors, serverError: null })
  }

  const url = getValidUrlOrNull(validatedBody.data.url)
  if (!url) {
    const formError: FormError = { key: "url", message: "URL is not valid" }
    return res.status(400).send({ data: null, formErrors: [formError], serverError: null })
  }

  const screenshotPath = await takeScreenshot(url)
  if (!screenshotPath) {
    const serverError: ServerError = { message: "Failed to create screenshot for URL " + url.href }
    return res.status(500).send({ data: null, formErrors: null, serverError })
  }

  const { aggregatedReport } = await generateAggregatedReport(url, validatedBody.data.title)
  const data: Data = { screenshotPath, report: aggregatedReport }

  return res.send({ data, formErrors: null, serverError: null })
}
