import { FC, useState } from "react"
import { FetchedResultsContainer } from "../components/FetchedResultsContainer"

export const CrawlWebsiteUrlsForm: FC = () => {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([])

  const handleCrawlWebsiteUrls = async () => {
    let urls: string[] = []
    setFormLoading(true)

    try {
      const response = await fetch("/api/crawl-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const result: { error: string } = await response.json()
        setError(result.error)
      } else {
        const result: { urls: string[] } = await response.json()
        urls = result.urls
      }
    } catch (error) {
      console.log(error)
      setError("Failed to crawl website urls")
    }

    setWebsiteUrls(urls)
    setFormLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Crawl website URLs</h2>

      <div className={`flex flex-col gap-1 w-full max-w-96 group ${error ? "error" : ""}`}>
        <input
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed group-[.error]:shadow-sm group-[.error]:shadow-red-600"
          type="text"
          name="url"
          placeholder="https://www.example.com"
          value={url}
          onChange={(e) => {
            setError("")
            setUrl(e.target.value)
          }}
          onKeyDown={(e) => e.key === "Enter" && handleCrawlWebsiteUrls()}
          disabled={formLoading}
        />
        {error && <span className="w-full px-1 text-sm text-red-600">{error}</span>}
      </div>

      <button
        className="disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleCrawlWebsiteUrls}
        disabled={formLoading}
      >
        Crawl urls
      </button>

      <FetchedResultsContainer
        id="website-urls"
        results={websiteUrls}
        handleClearResults={() => setWebsiteUrls([])}
      />
    </div>
  )
}
