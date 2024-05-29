import * as cheerio from "cheerio";
import fetch from "node-fetch";

export async function crawlDomainUrls(url: string) {
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

  const uniqueUrlsFoundOnSite = await findUniqueSameDomainUrlsOnSite(url);
  const urlArray = Array.from(uniqueUrlsFoundOnSite);

  for (let i = 0; i < urlArray.length; i += 5) {
    const urlsToCrawl = urlArray.slice(i, i + 5);

    await Promise.all(
      urlsToCrawl.map(async (url) => {
        await crawlDomainUrlsRecursively(url, crawledUrls);
      }),
    );
  }
}

const excludedUrlPrefixes = ["mailto:", "tel:", "#"];

const fileExtensions = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".zip",
];

const findUniqueSameDomainUrlsOnSite = async (siteUrl: string) => {
  const urlsFoundOnSite = new Set<string>();

  try {
    const siteResponse = await fetch(siteUrl);

    if (siteResponse.ok) {
      const siteHtml = await siteResponse.text();
      const $ = cheerio.load(siteHtml);

      $("a").each((_, link) => {
        let href = $(link).attr("href");

        if (!href) {
          return;
        }

        if (excludedUrlPrefixes.some((prefix) => href?.startsWith(prefix))) {
          return;
        }

        if (href.includes("#")) {
          href = href.split("#")[0]; // Remove anchor links so we don't crawl the same page multiple times
        }

        if (href.includes("?")) {
          href = href.split("?")[0]; // Remove query params so we don't crawl the same page multiple times
        }

        if (href.includes(";")) {
          href = href.split(";")[0]; // Remove query params so we don't crawl the same page multiple times
        }

        const fullUrl = new URL(href, siteUrl); // Resolve relative URLs
        const isSameDomain = fullUrl.hostname === new URL(siteUrl).hostname;
        const hasNotBeenFoundYet = !urlsFoundOnSite.has(fullUrl.href);
        const isFileUrl = fileExtensions.some((ext) =>
          fullUrl.pathname.endsWith(ext),
        );

        if (isSameDomain && hasNotBeenFoundYet && !isFileUrl) {
          urlsFoundOnSite.add(fullUrl.href);
        }
      });
    }
  } catch (error) {
    console.error(error);
  }

  return urlsFoundOnSite;
};
