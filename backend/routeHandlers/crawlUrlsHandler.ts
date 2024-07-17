import { Request, Response } from "express"
import { crawlDomainUrlsRecursively } from "../utils/report-generation/crawlDomainUrlsRecursively"
import getValidUrlOrNull from "../utils/getValidUrlOrNull"
import { ResponseBody } from "./utils/types"
import { z } from "zod"
import { securedUrlSchema } from "./utils/schemas"
import { getFormErrorsFromValidatedRequestBody } from "./utils/getFormErrorsFromValidatedRequestBody"

const requestBodySchema = z.object({
  url: securedUrlSchema,
})

type ReqBody = z.infer<typeof requestBodySchema>
type Data = { urls: string[] }
type ResBody = ResponseBody<Data, ReqBody>
type FormErrors = NonNullable<ResBody["formErrors"]>
type FormError = FormErrors[number]

export type { ReqBody as CrawlUrlsRequestBody, ResBody as CrawlUrlsResponseBody }

export default async function crawlUrlsHandler(req: Request, res: Response) {
  const validatedBody = requestBodySchema.safeParse(req.body)
  if (!validatedBody.success) {
    const formErrors = getFormErrorsFromValidatedRequestBody(validatedBody)
    return res.status(400).send({ data: null, formErrors, serverError: null })
  }

  const url = getValidUrlOrNull(validatedBody.data.url)
  if (!url) {
    const formError: FormError = { key: "url", message: "URL is not valid" }
    return res.status(400).send({ data: null, formErrors: [formError], serverError: null })
  }

  const crawledUrls = await crawlDomainUrlsRecursively(new Set([url.href]))
  const data: Data = { urls: Array.from(crawledUrls.successes) }

  return res.send({ data, formErrors: null, serverError: null })
}
