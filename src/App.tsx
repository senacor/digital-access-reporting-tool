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

const renderTestChart = () => {
  const data = [
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
  ];
  return (
    <BarChart
      width={500}
      height={300}
      data={data}
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
          <button onClick={handleCheckAccessibility}>
            Check accessibility
          </button>
          <button onClick={handleCrawlWebsiteUrls}>Crawl website urls</button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <h2>Accessibility Results</h2>
            <button onClick={() => setAcsResultsHidden(!acsResultsHidden)}>
              {acsResultsHidden ? "Show" : "Hide"}
            </button>
          </div>
          {!acsResultsHidden && (
            <pre className="text-left">
              {JSON.stringify(acsResults, null, 2)}
            </pre>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <h2>Website Urls</h2>
            <button onClick={() => setWebsiteUrlsHidden(!websiteUrlsHidden)}>
              {websiteUrlsHidden ? "Show" : "Hide"}
            </button>
          </div>
          {!websiteUrlsHidden && (
            <pre className="text-left">
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
