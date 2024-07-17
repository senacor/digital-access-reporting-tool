import getValidUrlOrNull from "../utils/getValidUrlOrNull"
import generateMultiPageReport from "../utils/report-generation/generateMultiPageReport"
import takeScreenshot from "../utils/takeScreenshot"
import { ResponseBody, ServerError, TypedExpressRequest, TypedExpressResponse } from "./utils/types"
import { MultiPageReport } from "../utils/report-generation/report-aggregation/types"
import { z } from "zod"
import { securedUrlSchema, urlSchema } from "./utils/schemas"
import { getFormErrorsFromValidatedRequestBody } from "./utils/getFormErrorsFromValidatedRequestBody"

const requestBodySchema = z.object({
  url: securedUrlSchema,
  logoUrl: urlSchema,
})

type ReqBody = z.infer<typeof requestBodySchema>
type Data = { screenshotPath: string | null; report: MultiPageReport }
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
  let serverError: ServerError | null = null
  const validatedRequestBody = requestBodySchema.safeParse(req.body)

  if (!validatedRequestBody.success) {
    const formErrors = getFormErrorsFromValidatedRequestBody(validatedRequestBody)
    return res.status(400).send({ data: null, formErrors, serverError })
  }

  const url = getValidUrlOrNull(validatedRequestBody.data.url)
  if (!url) {
    const formError: FormError = { key: "url", message: "URL is not valid" }
    return res.status(400).send({ data: null, formErrors: [formError], serverError })
  }

  const logoUrl = getValidUrlOrNull(validatedRequestBody.data.logoUrl)
  if (!logoUrl) {
    const formError: FormError = { key: "logoUrl", message: "Logo URL is not valid" }
    return res.status(400).send({ data: null, formErrors: [formError], serverError })
  }

  const screenshotPath = await takeScreenshot(url)
  if (!screenshotPath) {
    serverError = { message: "Failed to create screenshot for URL " + url.href }
  }

  const { multiPageReport } = await generateMultiPageReport(url, logoUrl)
  const data: Data = { screenshotPath, report: multiPageReport }

  return res.send({ data, formErrors: null, serverError })
}
