import * as cheerio from "cheerio";
import fetch from "node-fetch";

export async function crawlDomainUrls(url: string) {
  const crawledUrls: Set<string> = new Set();

  try {
    const response = await fetch(url);

    if (response.ok) {
      if (!crawledUrls.has(url)) {
        crawledUrls.add(url);
      }

      const data = await response.text();
      const $ = cheerio.load(data);

      $("a").each((_, link) => {
        const href = $(link).attr("href");

        if (!href) {
          return;
        }

        // Resolve relative URLs
        const fullUrl = new URL(href, url);
        const isSameDomain = fullUrl.hostname === new URL(url).hostname;
        const hasNotBeenCrawled = !crawledUrls.has(fullUrl.href);

        if (isSameDomain && hasNotBeenCrawled) {
          crawledUrls.add(fullUrl.href);
        }
      });
    } else {
      console.error("Error:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  return Array.from(crawledUrls);
}
