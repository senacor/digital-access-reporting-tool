import { FC, useState } from "react"
import { FetchedResultsContainer } from "../components/FetchedResultsContainer"
import { MultiPageReport } from "../../backend/utils/report-generation/report-aggregation/types"

type CreateAccessibilityReportResult = {
  report: MultiPageReport
  screenshotPath: string
}

export const CheckAccessibilityForm: FC = () => {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [results, setResults] = useState<CreateAccessibilityReportResult | null>(null)

  const handleCreateAccessibilityReport = async () => {
    setFormLoading(true)

    try {
      const response = await fetch("/api/create-accessibility-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const result: { error: string } = await response.json()
        setError(result.error)
        setResults(null)
        setFormLoading(false)
        return
      }

      const result: CreateAccessibilityReportResult = await response.json()

      setResults(result)
      setFormLoading(false)
    } catch (error) {
      console.error(error)

      setError("Failed to create accessibility report")
      setResults(null)
      setFormLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Create accessibility report</h2>

      <div className={`flex flex-col gap-1 w-full max-w-96 group ${error ? "error" : ""}`}>
        <input
          className="max-w-96 disabled:opacity-50 disabled:cursor-not-allowed group-[.error]:shadow-sm group-[.error]:shadow-red-600"
          type="text"
          name="url"
          placeholder="https://www.example.com"
          value={url}
          onChange={(e) => {
            setError("")
            setUrl(e.target.value)
          }}
          onKeyDown={(e) => e.key === "Enter" && handleCreateAccessibilityReport()}
          disabled={formLoading}
        />
        {error && <span className="w-full px-1 text-sm text-red-600">{error}</span>}
      </div>

      <button
        className="disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleCreateAccessibilityReport}
        disabled={formLoading}
      >
        Create report
      </button>

      <FetchedResultsContainer
        id="acs-results"
        results={results}
        handleClearResults={() => setResults(null)}
      />
    </div>
  )
}
