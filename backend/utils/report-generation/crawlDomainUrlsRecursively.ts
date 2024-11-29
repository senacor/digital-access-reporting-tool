import * as cheerio from "cheerio"
import http from "node:http"
import https from "node:https"
import { cpuCount } from "./types"
import getValidUrlOrNull from "../getValidUrlOrNull"
import logger from "../logger"
import axios, { AxiosError } from "axios"

/**
 * The actual response.
 */
class CrawledUrls {
  successes: Set<string> = new Set<string>()
  failures: Set<string> = new Set<string>()
  #empty: boolean = true

  isEmpty() {
    return this.#empty
  }
  success(url: string): Set<string> {
    if (url) {
      this.#empty = false
      return this.successes.add(url)
    } else {
      return this.successes
    }
  }
  failure(url: string): Set<string> {
    if (url) {
      this.#empty = false
      return this.failures.add(url)
    } else {
      return this.failures
    }
  }
  has(url: string) {
    return this.successes.has(url) || this.failures.has(url)
  }
  succeeded() {
    return this.successes.size
  }
  failed() {
    return this.failures.size
  }
}

/**
 * Set some meaningful defaults for Axios connections.
 * @see <a href="https://nodejs.org/api/http.html#new-agentoptions">new Agent([options])</a>
 */
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: cpuCount * 5,
  scheduling: "fifo",
})
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: cpuCount * 5,
  scheduling: "fifo",
})

/**
 * Recursively crawls all URLs beginning with the given URL.
 * This can take a long time and should be used with caution since their is no limit on how many URLs are crawled.
 *
 * @param url URL string to start the crawling process.
 * @param crawledUrls Contains all crawled URLs by their status (success or failure).
 * @param seenReferences Contains all further references, starting with the root one, ever seen on any page.
 * @returns The crawled URLs object.
 */
export async function crawlDomainUrlsRecursively(
  url: string,
  crawledUrls = new CrawledUrls(),
  seenReferences = new Set<string>(),
  delay: number = 1000,
) {
  const topLevel = crawledUrls.isEmpty()
  if (topLevel) {
    seenReferences.add(url)
  }
  const promises: Promise<CrawledUrls>[] = []
  // Fetch the HTML of the URL with a random delay to not bomb the server too much.
  const html = await new Promise<string | null>((resolve) =>
    setTimeout(
      async () => await fetchHtmlFromUrl(url).then(resolve),
      Math.floor(Math.random() * delay),
    ),
  )
  // Go down the page tree, using children references,
  // stop scraping if the referred link doesn't resolve to HTML
  if (html) {
    crawledUrls.success(url)
    // Find all domain URLs on the page and add them to the Set of URLs to crawl.
    const references = await findSameDomainUrls(url, html, seenReferences)
    references.forEach((r) => {
      promises.push(
        crawlDomainUrlsRecursively(
          r,
          crawledUrls,
          seenReferences.add(r),
          references.size > 24 ? delay * 4 : delay,
        ),
      )
    })
  } else {
    crawledUrls.failure(url)
  }

  return Promise.all<Promise<CrawledUrls>>(promises)
    .then(() => crawledUrls)
    .finally(() => {
      if (topLevel)
        console.log(
          `🕷️ Finished crawling URLs, succeeded: ${crawledUrls.succeeded()}, failed: ${crawledUrls.failed()}`,
        )
    })
}

const fetchHtmlFromUrl = async (url: string) => {
  const accept = "text/html,application/xhtml+xml,application/xml"
  // select a random user agent from the list
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)]
  const options = {
    // Set to accept HTML-like responses only since some sites return docs w/o extensions
    // see also: https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation/List_of_default_Accept_values
    headers: {
      Accept: accept,
      "User-Agent": ua,
    },
    withCredentials: true,
    // Axios, together with 'http' adapter do not send cookies on redirects
    // see: https://github.com/axios/axios/issues/3862
    beforeRedirect: (
      options: Record<string, any>,
      responseDetails: { headers: Record<string, any> },
    ) => {
      const setCookies: any = responseDetails.headers["set-cookie"]
      if (!setCookies) {
        return
      }
      const cookies =
        typeof setCookies === "string"
          ? setCookies.split(";")[0]
          : setCookies.reduceRight(
              (accumulator: string, currentValue: string) =>
                accumulator + "; " + currentValue.split(";")[0],
            )
      options.headers["Cookie"] = cookies
    },
    httpAgent: httpAgent,
    httpsAgent: httpsAgent,
    //Aborts request after 10 minutes
    signal: newAbortSignal(600000),
    validateStatus: (status: number) => {
      return status >= 200 && status <= 308
    },
  }
  return new Promise<string | null>((resolve) => {
    axios
      .get(url, options)
      .then((response) => {
        let contentType = response.headers["content-type"]
        if (acceptContentType(accept, contentType) && response.data) {
          resolve(response.data)
        } else {
          logger.print(
            "debug",
            `${url}: rejected due to response missing data or having content type: ${contentType}`,
          )
          resolve(null)
        }
      })
      .catch((error: Error | AxiosError) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            logger.print("info", `On URL: ${url}: responded with status ${error.response.status}`)
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            logger.print(
              "error",
              `On URL: ${url}: ${JSON.stringify({ message: error.message, cause: error.cause, code: error.code, status: error.status }, null, 2)}`,
            )
          } else {
            // Something happened in setting up the request that triggered an Error
            logger.print(
              "error",
              `On URL: ${url}: ${JSON.stringify({ message: error.message, cause: error.cause, code: error.code, status: error.status }, null, 2)}`,
            )
          }
        }

        resolve(null)
      })
  })
}

const findSameDomainUrls = async (
  pageUrl: string,
  pageHtml: string,
  seenReferences: Set<string>,
) => {
  const pageHostname = new URL(pageUrl).hostname
  const $ = cheerio.load(pageHtml)
  const urlsFoundOnPage = new Set<string>()

  $("a").each((_, anchor) => {
    let href = $(anchor).attr("href")
    if (!href) {
      return
    }
    // cleanse the reference - all kind of documents can sneak through otherwise
    href = href.trim()

    // If the href is a relative URL, skip some common prefixes.
    if (excludedPrefixes.some((prefix) => href?.toLowerCase().startsWith(prefix))) {
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
    if (fileExtensions.some((ext) => href.toLowerCase().endsWith(ext))) {
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
    if (urlsFoundOnPage.has(validUrl.href) || seenReferences.has(validUrl.href)) {
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
  "javascript:", // see: https://developer.mozilla.org/en-US/docs/Web/URI/Schemes/javascript
]

const fileExtensions = [
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

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:24.10) Gecko/20100101 Firefox/133.0",
]

/**
 * @see <a href="https://axios-http.com/docs/cancellation">Cancelling requests</a>
 */
function newAbortSignal(timeoutMs: number) {
  const abortController = new AbortController()
  setTimeout(() => abortController.abort(), timeoutMs || 0)
  return abortController.signal
}

/**
 * Some of the pages return content, different from HTML (like PDF documents), therefore we need to filter out
 * such content.
 * @param accept the accept header
 * @param contentType the original content type from the response with optional parameters
 * @returns true if the content type/subtype would be appropriate for the specified accept header
 */
function acceptContentType(accept: string, contentType: string) {
  const regEx = /(.*);.*/
  if (contentType) {
    return accept.includes(contentType.trim().replace(regEx, "$1"))
  }
  return false
}
