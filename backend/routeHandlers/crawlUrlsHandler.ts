import { Request, Response } from "express"
import crawlDomainUrls from "../utils/report-generation/crawlDomainUrls"
import { getValidUrlOrNull } from "../utils/getValidUrlOrNull"
import { ResponseBody } from "./utils/types"
import { z } from "zod"
import { urlSchema } from "./utils/schemas"
import mapZodIssuesToFormValidationErrors from "./utils/mapZodIssuesToFormValidationErrors"

const requestBodySchema = z.object({
  url: urlSchema,
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
    const formErrors = mapZodIssuesToFormValidationErrors(validatedBody.error.issues)
    return res.status(400).send({ data: null, formErrors, serverError: null })
  }

  const url = getValidUrlOrNull(validatedBody.data.url)
  if (!url) {
    const formError: FormError = { key: "url", message: "URL is not valid" }
    return res.status(400).send({ data: null, formErrors: [formError], serverError: null })
  }

  const urls = await crawlDomainUrls(url)
  const data: Data = { urls }

  return res.send({ data, formErrors: null, serverError: null })
}
