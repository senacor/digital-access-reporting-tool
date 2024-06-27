import * as cheerio from "cheerio"
import getValidUrlOrNull from "../getValidUrlOrNull"
import logger from "../logger"
import axios, { AxiosError } from "axios"

export default async function crawlDomainUrls(url: URL) {
  const crawledUrls = await crawlDomainUrlsRecursively(new Set([url.href]))
  return Array.from(crawledUrls.successes)
}

export type CrawledUrls = {
  successes: Set<string>
  failures: Set<string>
}

export async function crawlDomainUrlsRecursively(
  urls: Set<string>,
  urlsIterator: Iterator<string, string | undefined> = urls[Symbol.iterator](),
  crawledUrls: CrawledUrls = { successes: new Set<string>(), failures: new Set<string>() },
) {
  const url = urlsIterator.next().value
  if (!url) {
    console.log("Finished crawling URLs 🕷️")
    return crawledUrls
  }

  // Fetch the HTML of the URL with a small delay to not bomb the server too much.
  const html = await new Promise<string | null>((resolve) => {
    setTimeout(async () => await fetchHtmlFromUrl(url).then(resolve), 100)
  })

  if (!html) {
    crawledUrls.failures.add(url)
    return crawlDomainUrlsRecursively(urls, urlsIterator, crawledUrls)
  }

  crawledUrls.successes.add(url)

  const foundUrls = await findSameDomainUrls(url, html, crawledUrls)
  foundUrls.forEach((url) => urls.add(url))

  return crawlDomainUrlsRecursively(urls, urlsIterator, crawledUrls)
}

const fetchHtmlFromUrl = async (url: string) => {
  return new Promise<string | null>((resolve) => {
    axios
      .get(url, {
        maxRedirects: 2, // Limit the amount of following redirects to 2 to speed up the crawling process.
      })
      .then((response) => {
        if (response.data) {
          resolve(response.data)
        } else {
          resolve(null)
        }
      })
      .catch((error: Error | AxiosError) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            logger.print("info", `Responded with status ${error.response.status} on URL: ${url}`)
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            logger.print(
              "error",
              `${JSON.stringify({ message: error.message, cause: error.cause, code: error.code, status: error.status }, null, 2)}`,
            )
          } else {
            // Something happened in setting up the request that triggered an Error
            logger.print(
              "error",
              `${JSON.stringify({ message: error.message, cause: error.cause, code: error.code, status: error.status }, null, 2)}`,
            )
          }
        }

        resolve(null)
      })
  })
}

const findSameDomainUrls = async (pageUrl: string, pageHtml: string, crawledUrls: CrawledUrls) => {
  const pageHostname = new URL(pageUrl).hostname
  const $ = cheerio.load(pageHtml)
  const urlsFoundOnPage = new Set<string>()

  $("a").each((_, anchor) => {
    let href = $(anchor).attr("href")
    if (!href) {
      return
    }

    // If the href is a relative URL, skip some common prefixes.
    if (excludedPrefixes.some((prefix) => href?.startsWith(prefix))) {
      return
    }

    // The anchor as a prefix was already excluded before.
    // Check if the href contains an anchor and simply use the URL without it
    // to avoid crawling the same page multiple times.
    if (href.includes("#")) {
      href = href.split("#")[0]
    }

    // For simplicity reasons we remove query parameters to avoid crawling the same page multiple times.
    if (href.includes("?")) {
      href = href.split("?")[0]
    }

    // Some URLs contain session IDs or other parameters separated by a semicolon.
    // E.g. https://example.com/page;jsessionid=1234 -> https://javarevisited.blogspot.com/2012/08/what-is-jsessionid-in-j2ee-web.html
    // While crawling we might end up with the same link with different session IDs, so we cut them off.
    if (href.includes(";")) {
      href = href.split(";")[0]
    }

    // We want to avoid to crawl files like images, PDFs, etc.
    if (
      fileExtensionsLowerCase.some((ext) => href.endsWith(ext)) ||
      fileExtensionsUppercase.some((ext) => href.endsWith(ext))
    ) {
      return
    }

    const validUrl = getValidUrlOrNull(href, pageUrl)
    if (!validUrl) {
      logger.print(
        "info",
        `Invalid URL found on page (${pageUrl}) in an anchor: ${JSON.stringify({ anchorAttributes: anchor.attributes }, null, 2)}`,
      )
      return
    }

    // We only want to crawl URLs from the same domain.
    if (validUrl.hostname !== pageHostname) {
      return
    }

    // Skip URLs that were already found on the page or that were already crawled.
    if (
      urlsFoundOnPage.has(validUrl.href) ||
      crawledUrls.successes.has(validUrl.href) ||
      crawledUrls.failures.has(validUrl.href)
    ) {
      return
    }

    urlsFoundOnPage.add(validUrl.href)
  })

  return urlsFoundOnPage
}

const excludedPrefixes = [
  "#", // Anchor links lead to the same page
  "mailto:", // Usually followed by an email address
  "tel:", // Usually followed by a phone number
]

const fileExtensionsLowerCase = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".zip",
  ".rar",
  ".tar",
  ".ico",
  ".vcf",
  ".ics",
  ".csv",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".mp3",
  ".mp4",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".wav",
  ".xml",
  ".eps",
]

const fileExtensionsUppercase = fileExtensionsLowerCase.map((ext) => ext.toUpperCase())
