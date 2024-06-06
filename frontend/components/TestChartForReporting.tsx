import { FC } from "react"
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, Tooltip, XAxis, YAxis } from "recharts"

export const TestChartForReporting: FC = () => {
  return (
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
        <Bar dataKey="violations" fill="red" activeBar={<Rectangle fill="red" stroke="orange" />} />
        <Bar
          dataKey="potentialViolations"
          fill="blue"
          activeBar={<Rectangle fill="blue" stroke="lightblue" />}
        />
      </BarChart>
    </div>
  )
}
