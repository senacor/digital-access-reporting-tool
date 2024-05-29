import express from "express";
import cors from "cors";
import * as aChecker from "accessibility-checker";
import { crawlDomainUrls } from "./crawlDomainUrls";

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

  const urls = await crawlDomainUrls(url);

  res.send({ urls });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
