import express from "express";
import cors from "cors";
import * as aChecker from "accessibility-checker";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 42069;
// Use cors middleware and allow all origins
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.send({ hello: "world" });
});

app.post("/achecker", (req, res) => {
  const url: string = req.body.url;

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  aChecker.getCompliance(url, url, function (results) {
    aChecker.close();
    res.send({ results });
  });
});

app.post("/crawler", async (req, res) => {
  const url: string = req.body.url;

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  const URLs: Set<string> = new Set();
  await crawlUrls(url, URLs);

  res.send({ urls: Array.from(URLs) });
});

async function crawlUrls(url: string, crawledUrls: Set<string>) {
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
}

app.listen(port, () => console.log(`Server is running on port ${port}`));
