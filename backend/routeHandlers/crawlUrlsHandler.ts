import { Request, Response } from "express"
import crawlDomainUrls from "../utils/report-generation/crawlDomainUrls"
import { getValidatedUrlOrError } from "../utils/urlValidation"
import { FormValidationError } from "./types"

export type CrawlWebsiteUrlsResult = {
  urls: string[]
}

export default async function crawlUrlsHandler(req: Request, res: Response) {
  const formValidationErrors: FormValidationError[] = []
  const urlParam: string | undefined = req.body.url
  const urlValidation = getValidatedUrlOrError(urlParam)

  if (urlValidation.error || !urlValidation.url) {
    formValidationErrors.push({ key: "url", message: urlValidation.error })
    return res.status(400).send({ formValidationErrors })
  }

  const urls = await crawlDomainUrls(urlValidation.url)
  const result: CrawlWebsiteUrlsResult = { urls }

  return res.send(result)
}
