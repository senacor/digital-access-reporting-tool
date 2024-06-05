import * as cheerio from "cheerio";
import fetch, { FetchError, Response } from "node-fetch";
import getUrlOrNull from "./getUrlOrNull";

export default async function crawlDomainUrls(url: string) {
  const urls = new Set<string>();

  await crawlDomainUrlsRecursively(url, urls);

  return Array.from(urls);
}

async function crawlDomainUrlsRecursively(
  url: string,
  crawledUrls: Set<string>,
) {
  if (crawledUrls.has(url)) {
    return;
  }

  crawledUrls.add(url);

  const html = await fetchHtmlFromUrl(url);
  if (!html) {
    return;
  }

  const urls = await findSameDomainUrls(html, url);
  const urlsArray = Array.from(urls);

  for (let i = 0; i < urlsArray.length; i += 5) {
    const urlsToCrawl = urlsArray.slice(i, i + 5);

    await Promise.all(
      urlsToCrawl.map(async (url) => {
        await crawlDomainUrlsRecursively(url, crawledUrls);
      }),
    );
  }
}

const fetchHtmlFromUrl = async (url: string) => {
  let response: Response | null = null;

  try {
    response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    return html;
  } catch (error) {
    if (error instanceof FetchError) {
      console.error(`Failed to fetch ${url}: ${error.message}`);
    } else {
      console.error(error);
    }

    return null;
  }
};

const findSameDomainUrls = async (html: string, htmlUrl: string) => {
  const urlsFoundOnSite = new Set<string>();
  const $ = cheerio.load(html);

  $("a").each((_, link) => {
    let href = $(link).attr("href");
    if (!href) {
      return;
    }

    // If the href is a relative URL, we skip some common prefixes.
    if (excludedPrefixes.some((prefix) => href?.startsWith(prefix))) {
      return;
    }

    // We already excluded the anchor as a prefix.
    // Now we check if the href contains an anchor and simply use the URL without it
    if (href.includes("#")) {
      href = href.split("#")[0];
    }

    // For simplicity reasons we remove query parameters to avoid crawling the same page multiple times.
    // This might lead to some missing pages but is a good trade-off to avoid duplicate pages.
    if (href.includes("?")) {
      href = href.split("?")[0];
    }

    // Some URLs contain session IDs or other parameters separated by a semicolon.
    // E.g. https://example.com/page;jsessionid=1234 -> https://javarevisited.blogspot.com/2012/08/what-is-jsessionid-in-j2ee-web.html
    // While crawling we might end up with the same link with different session IDs, so we cut them off.
    if (href.includes(";")) {
      href = href.split(";")[0];
    }

    // We want to avoid to crawl files like images, PDFs, etc.
    if (fileExtensions.some((ext) => href.endsWith(ext))) {
      return;
    }

    const url = getUrlOrNull(href, htmlUrl);
    if (!url) {
      console.log("Invalid URL found:", href);
      return;
    }

    const isSameDomain = url.hostname === new URL(htmlUrl).hostname;
    const hasNotBeenFoundYet = !urlsFoundOnSite.has(url.href);

    if (isSameDomain && hasNotBeenFoundYet) {
      urlsFoundOnSite.add(url.href);
    }
  });

  return urlsFoundOnSite;
};

const excludedPrefixes = [
  "#", // Anchor links lead to the same page
  "mailto:", // Usually followed by an email address
  "tel:", // Usually followed by a phone number
];

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
];
