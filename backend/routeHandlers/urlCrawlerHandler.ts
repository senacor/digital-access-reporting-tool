import { Request, Response } from "express"
import crawlDomainUrls from "../utils/crawlDomainUrls"
import { validateAndReturnUrlOrError } from "../utils/urlValidation"

export default async function urlCrawlerHandler(req: Request, res: Response) {
  const urlParam: string | undefined = req.body.url
  const urlOrError = validateAndReturnUrlOrError(urlParam)

  if (urlOrError.error || !urlOrError.url) {
    return res.status(400).send({ error: urlOrError.error, url: urlParam })
  }

  crawlDomainUrls(urlOrError.url.href).then((urls) => {
    res.send({ urls })
  })
}
