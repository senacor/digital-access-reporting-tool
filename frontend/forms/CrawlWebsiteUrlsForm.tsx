import { FC, useState } from "react"
import { FetchedResultsContainer } from "../components/FetchedResultsContainer"
import { FormValidationError } from "../../backend/routeHandlers/types"
import { CrawlWebsiteUrlsResult } from "../../backend/routeHandlers/crawlUrlsHandler"

type FormValues = {
  url: string
}
type FormKey = keyof FormValues
type FormErrors = Record<FormKey, string>

function createInitialFormValues(): FormValues {
  return { url: "" }
}
function createInitialFormErrors(): FormErrors {
  return { url: "" }
}
const formKeys = Object.keys(createInitialFormValues()) as FormKey[]

export const CrawlWebsiteUrlsForm: FC = () => {
  const [formValues, setFormValues] = useState(createInitialFormValues())
  const [formErrors, setFormErrors] = useState(createInitialFormErrors())
  const [generalFormError, setGeneralFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [results, setResults] = useState<CrawlWebsiteUrlsResult | null>(null)

  const handleCrawlWebsiteUrls = async () => {
    setFormLoading(true)

    try {
      const response = await fetch("/api/crawl-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formValues }),
      })

      if (!response.ok) {
        const result: { formValidationErrors: FormValidationError[] } = await response.json()
        const newFormErrors = result.formValidationErrors.reduce((formErrors, { key, message }) => {
          const formKey = formKeys.find((formKey) => formKey === key)
          if (formKey) {
            formErrors[formKey] = message
          }

          return formErrors
        }, createInitialFormErrors())

        setFormErrors(newFormErrors)
        setResults(null)
        setFormLoading(false)
        return
      }

      const results: CrawlWebsiteUrlsResult = await response.json()
      setResults(results)
      setFormLoading(false)
    } catch (error) {
      console.log(error)

      setGeneralFormError("Failed to crawl website urls")
      setResults(null)
      setFormLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Crawl website URLs</h2>

      <div className={`flex flex-col gap-1 w-full max-w-96 group ${formErrors.url ? "error" : ""}`}>
        <input
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed group-[.error]:shadow-sm group-[.error]:shadow-red-600"
          type="text"
          name="url"
          placeholder="https://www.example.com"
          value={formValues.url}
          onChange={(e) => {
            setFormValues({ ...formValues, url: e.target.value })
            setFormErrors({ ...formErrors, url: "" })
            setGeneralFormError("")
          }}
          onKeyDown={(e) => e.key === "Enter" && handleCrawlWebsiteUrls()}
          disabled={formLoading}
        />
        {formErrors.url && (
          <span className="w-full px-1 text-sm text-red-600">{formErrors.url}</span>
        )}
      </div>

      {generalFormError && (
        <span className="w-full px-2 py-4 font-bold text-center text-red-600 rounded-md shadow-md bg-red-100/50 max-w-96 shadow-red-600">
          {generalFormError}
        </span>
      )}

      <button
        className="disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleCrawlWebsiteUrls}
        disabled={formLoading}
      >
        Crawl urls
      </button>

      <FetchedResultsContainer
        id="crawl-website-urls"
        results={results}
        handleClearResults={() => setResults(null)}
      />
    </div>
  )
}
