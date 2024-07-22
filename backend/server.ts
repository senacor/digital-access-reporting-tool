import express from "express"
import createAccessibilityReportHandler from "./route-handlers/createAccessibilityReportHandler"
import crawlUrlsHandler from "./route-handlers/crawlUrlsHandler"

const app = express()
const port = process.env.PORT || 42069

app.use(express.json()) // Use express.json() middleware to parse JSON bodies

app.get("/", (_, res) => res.send({ hello: "world" }))
app.post("/create-accessibility-report", createAccessibilityReportHandler)
app.post("/crawl-urls", crawlUrlsHandler)

app.listen(port, () => console.log(`🚀 Backend server is running on port ${port}`))
