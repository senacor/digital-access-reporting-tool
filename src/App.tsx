import { useState } from "react";
import { FetchedResultsContainer } from "./components/FetchedResultsContainer";
import { TestChartForReporting } from "./components/TestChartForReporting";

function App() {
  const [urlInput, setUrlInput] = useState("https://www.devk.de/");
  const [formLoading, setFormLoading] = useState(false);
  const [acsResults, setAcsResults] = useState<unknown | null>(null);
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([]);

  const handleCheckAccessibility = async () => {
    let data: unknown | null = null;
    setFormLoading(true);

    try {
      const response = await fetch("/api/accessibility-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      });

      data = await response.json();
    } catch (error) {
      console.error(error);
    }

    setFormLoading(false);
    setAcsResults(data);
  };

  const handleCrawlWebsiteUrls = async () => {
    let data: string[] = [];
    setFormLoading(true);

    try {
      const response = await fetch("/api/url-crawler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      });

      data = await response.json();
    } catch (error) {
      console.log(error);
    }

    setFormLoading(false);
    setWebsiteUrls(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
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
          results={acsResults}
          handleClearResults={() => setAcsResults(null)}
        />

        <FetchedResultsContainer
          id="website-urls"
          results={websiteUrls}
          handleClearResults={() => setWebsiteUrls([])}
        />
      </div>

      <TestChartForReporting />
    </div>
  );
}

export default App;
