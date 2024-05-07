import { useState } from "react";
import "./App.css";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const renderTestChart = () => {
  const data = [{ name: "Page A", uv: 400, pv: 2400, amt: 2400 }];
  return (
    <LineChart width={600} height={300} data={data}>
      <Line type="monotone" dataKey="uv" stroke="#8884d8" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="name" />
      <YAxis />
    </LineChart>
  );
};

function App() {
  const [url, setUrl] = useState("http://www.devk.de/");
  const [acsResults, setAcsResults] = useState<unknown | null>(null);
  const [acsResultsHidden, setAcsResultsHidden] = useState(false);
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([]);
  const [websiteUrlsHidden, setWebsiteUrlsHidden] = useState(false);

  const handleCheckAccessibility = async () => {
    const response = await fetch("/api/achecker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    setAcsResults(data);
    console.log(data);
  };

  const handleCrawlWebsiteUrls = async () => {
    const response = await fetch("/api/crawler", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    setWebsiteUrls(data);
    console.log(data);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <input
          type="text"
          name="url"
          placeholder="http://www.example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheckAccessibility()}
        />

        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
          <button onClick={handleCheckAccessibility}>
            Check accessibility
          </button>
          <button onClick={handleCrawlWebsiteUrls}>Crawl website urls</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Accessibility Results</h2>
            <button onClick={() => setAcsResultsHidden(!acsResultsHidden)}>
              {acsResultsHidden ? "Show" : "Hide"}
            </button>
          </div>
          {!acsResultsHidden && (
            <pre style={{ textAlign: "left" }}>
              {JSON.stringify(acsResults, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Website Urls</h2>
            <button onClick={() => setWebsiteUrlsHidden(!websiteUrlsHidden)}>
              {websiteUrlsHidden ? "Show" : "Hide"}
            </button>
          </div>
          {!websiteUrlsHidden && (
            <pre style={{ textAlign: "left" }}>
              {JSON.stringify(websiteUrls, null, 2)}
            </pre>
          )}
        </div>
      </div>
      <div>{renderTestChart()}</div>
    </div>
  );
}

export default App;
