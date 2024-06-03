import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const copyToClipboard = async (elementId: string) => {
  try {
    const node = document.getElementById(elementId);

    if (!node || !node.textContent) {
      throw new Error("Element not found");
    }

    if (!node.textContent) {
      throw new Error("No text content found");
    }

    await navigator.clipboard.writeText(node.textContent);
  } catch (error) {
    console.error("Failed to copy to clipboard", error);
  }
};

function App() {
  const [url, setUrl] = useState("https://www.devk.de/");
  const [formLoading, setFormLoading] = useState(false);
  const [acsResults, setAcsResults] = useState<unknown | null>(null);
  const [acsResultsHidden, setAcsResultsHidden] = useState(false);
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([]);
  const [websiteUrlsHidden, setWebsiteUrlsHidden] = useState(false);

  const handleCheckAccessibility = async () => {
    setFormLoading(true);
    const response = await fetch("/api/accessibility-checker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    setFormLoading(false);
    setAcsResults(data);
  };

  const handleCrawlWebsiteUrls = async () => {
    setFormLoading(true);
    const response = await fetch("/api/url-crawler", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    setFormLoading(false);
    setWebsiteUrls(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          name="url"
          placeholder="http://www.example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheckAccessibility()}
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2>Accessibility Results</h2>
            <div className="flex gap-2">
              <button onClick={() => setAcsResults(null)}>Clear</button>
              <button onClick={() => copyToClipboard("acs-results")}>
                Copy
              </button>
              <button onClick={() => setAcsResultsHidden(!acsResultsHidden)}>
                {acsResultsHidden ? "Show" : "Hide"}
              </button>
            </div>
          </div>
          {!acsResultsHidden && (
            <pre id="acs-results" className="text-left">
              {JSON.stringify(acsResults, null, 2)}
            </pre>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2>Website Urls</h2>
            <div className="flex gap-2">
              <button onClick={() => setWebsiteUrls([])}>Clear</button>
              <button onClick={() => copyToClipboard("website-urls")}>
                Copy
              </button>
              <button onClick={() => setWebsiteUrlsHidden(!websiteUrlsHidden)}>
                {websiteUrlsHidden ? "Show" : "Hide"}
              </button>
            </div>
          </div>
          {!websiteUrlsHidden && (
            <pre id="website-urls" className="text-left">
              {JSON.stringify(websiteUrls, null, 2)}
            </pre>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2>Test Chart (Probably suitable for reporting)</h2>
        <BarChart
          width={500}
          height={300}
          data={[
            {
              name: "Page A",
              violations: 400,
              potentialViolations: 350,
            },
            {
              name: "Page B",
              violations: 500,
              potentialViolations: 550,
            },
            {
              name: "Page C",
              violations: 300,
              potentialViolations: 230,
            },
            {
              name: "Page D",
              violations: 425,
              potentialViolations: 375,
            },
          ]}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="violations"
            fill="red"
            activeBar={<Rectangle fill="red" stroke="orange" />}
          />
          <Bar
            dataKey="potentialViolations"
            fill="blue"
            activeBar={<Rectangle fill="blue" stroke="lightblue" />}
          />
        </BarChart>
      </div>
    </div>
  );
}

export default App;
