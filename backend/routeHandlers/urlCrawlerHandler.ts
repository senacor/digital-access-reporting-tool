import { Request, Response } from "express"
import validateUrlParamAndReturnError from "../utils/validateUrlParamAndReturnError"
import crawlDomainUrls from "../utils/crawlDomainUrls"

export default async function urlCrawlerHandler(req: Request, res: Response) {
  const url = req.body.url
  const validationError = validateUrlParamAndReturnError(req.body.url)

  if (validationError) {
    return res.status(400).send({ error: validationError })
  }

  crawlDomainUrls(url).then((urls) => {
    res.send({ urls })
  })
}
