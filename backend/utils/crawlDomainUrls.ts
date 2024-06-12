import * as cheerio from "cheerio"
import fetch, { FetchError, Response } from "node-fetch"
import { getValidUrlOrNull } from "./urlValidation"

export default async function crawlDomainUrls(url: string) {
  const urls = new Set<string>()
  const urlsWithServerError = new Set<string>()

  await crawlDomainUrlsRecursively(url, urls, urlsWithServerError)

  return Array.from(urls)
}

async function crawlDomainUrlsRecursively(
  url: string,
  crawledUrls: Set<string>,
  urlsWithServerError: Set<string>,
) {
  if (crawledUrls.has(url) || urlsWithServerError.has(url)) {
    return
  }

  const html = await fetchHtmlFromUrl(url)
  if (!html) {
    urlsWithServerError.add(url)
    return
  }

  crawledUrls.add(url)

  const urls = await findSameDomainUrls(html, url, crawledUrls, urlsWithServerError)
  const urlsArray = Array.from(urls)

  for (let i = 0; i < urlsArray.length; i += 5) {
    const urlsToCrawl = urlsArray.slice(i, i + 5)

    await Promise.all(
      urlsToCrawl.map(async (url) => {
        await crawlDomainUrlsRecursively(url, crawledUrls, urlsWithServerError)
      }),
    )
  }
}

const fetchHtmlFromUrl = async (url: string) => {
  let response: Response | null = null

  try {
    // Limit the amount of following redirects to 2 to speed up the crawling process.
    response = await fetch(url, {
      redirect: "follow",
      follow: 2,
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`)
      return null
    }

    const html = await response.text()
    return html
  } catch (error) {
    if (error instanceof FetchError) {
      console.error(`Failed to fetch ${url}: ${error.message}`)
    } else {
      console.error(error)
    }

    return null
  }
}

const findSameDomainUrls = async (
  html: string,
  htmlUrl: string,
  crawledUrls: Set<string>,
  urlsWithServerError: Set<string>,
) => {
  const urlsFoundOnPage = new Set<string>()
  const $ = cheerio.load(html)

  $("a").each((_, link) => {
    let href = $(link).attr("href")
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
    if (fileExtensions.some((ext) => href.endsWith(ext))) {
      return
    }

    const url = getValidUrlOrNull(href, htmlUrl)
    if (!url) {
      console.log("Invalid URL found:", href)
      return
    }

    const isSameDomain = url.hostname === new URL(htmlUrl).hostname
    const hasAlreadyBeenFound = urlsFoundOnPage.has(url.href) || crawledUrls.has(url.href)
    const hasAlreadyProducedAnError = urlsWithServerError.has(url.href)

    if (isSameDomain && !hasAlreadyBeenFound && !hasAlreadyProducedAnError) {
      urlsFoundOnPage.add(url.href)
    }
  })

  return urlsFoundOnPage
}

const excludedPrefixes = [
  "#", // Anchor links lead to the same page
  "mailto:", // Usually followed by an email address
  "tel:", // Usually followed by a phone number
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
]
