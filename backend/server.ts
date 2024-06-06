import express from "express"
import accessibilityCheckerHandler from "./routeHandlers/accessibilityCheckerHandler"
import urlCrawlerHandler from "./routeHandlers/urlCrawlerHandler"

const app = express()
const port = process.env.PORT || 42069

app.use(express.json()) // Use express.json() middleware to parse JSON bodies

app.get("/", (_, res) => res.send({ hello: "world" }))
app.post("/accessibility-checker", accessibilityCheckerHandler)
app.post("/url-crawler", urlCrawlerHandler)

app.listen(port, () => console.log(`Backend server is running on port ${port}`))
