import { Request, Response } from "express"
import crawlDomainUrls from "../utils/report-generation/crawlDomainUrls"
import { getValidatedUrlOrError } from "../utils/urlValidation"

export default async function urlCrawlerHandler(req: Request, res: Response) {
  const urlParam: string | undefined = req.body.url
  const { url, error } = getValidatedUrlOrError(urlParam)

  if (error || !url) {
    return res.status(400).send({ error, url, urlParam })
  }

  crawlDomainUrls(url).then((urls) => {
    res.send({ urls })
  })
}
