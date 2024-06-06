import { useState } from "react"
import { FetchedResultsContainer } from "./components/FetchedResultsContainer"
import { TestChartForReporting } from "./components/TestChartForReporting"
import { ReportResult } from "accessibility-checker/lib/api/IChecker"

function App() {
  const [urlInput, setUrlInput] = useState("https://www.devk.de/")
  const [formLoading, setFormLoading] = useState(false)
  const [accessibilityCheckerResults, setAccessibilityCheckerResults] =
    useState<ReportResult | null>(null)
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([])

  const handleCheckAccessibility = async () => {
    let data: ReportResult | null = null
    setFormLoading(true)

    try {
      const response = await fetch("/api/accessibility-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      })

      data = await response.json()
    } catch (error) {
      console.error(error)
    }

    setFormLoading(false)
    setAccessibilityCheckerResults(data)
  }

  const handleCrawlWebsiteUrls = async () => {
    let data: string[] = []
    setFormLoading(true)

    try {
      const response = await fetch("/api/url-crawler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      })

      data = await response.json()
    } catch (error) {
      console.log(error)
    }

    setFormLoading(false)
    setWebsiteUrls(data)
  }

  return (
    <div className="flex flex-col w-full gap-6">
      <h1>Digital Access Reporting Tool</h1>
      <div className="flex flex-col items-center gap-4">
        <input
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          type="text"
          name="url"
          placeholder="http://www.example.com"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheckAccessibility()}
          disabled={formLoading}
        />

        <div className="flex justify-center gap-2">
          <button
            className="disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCheckAccessibility}
            disabled={formLoading}
          >
            Check accessibility
          </button>
          <button
            className="disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCrawlWebsiteUrls}
            disabled={formLoading}
          >
            Crawl website urls
          </button>
        </div>

        <FetchedResultsContainer
          id="acs-results"
          results={accessibilityCheckerResults}
          handleClearResults={() => setAccessibilityCheckerResults(null)}
        />

        <FetchedResultsContainer
          id="website-urls"
          results={websiteUrls}
          handleClearResults={() => setWebsiteUrls([])}
        />
      </div>

      <TestChartForReporting />
    </div>
  )
}

export default App
