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
  const [url, setUrl] = useState("http://www.google.com");
  const [results, setResults] = useState<unknown | null>(null);

  const handleSubmit = async () => {
    const response = await fetch("/api/achecker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    console.log(data);
    setResults(data);
  };

  return (
    <div>
      <input
        type="text"
        name="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
      />
      <button onClick={handleSubmit}>Submit</button>
      <pre>{JSON.stringify(results)}</pre>
      {renderTestChart()}
    </div>
  );
}

export default App;
