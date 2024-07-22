import { FC, useState } from "react"
import { FetchedResultsContainer } from "../components/FetchedResultsContainer"
import {
  CrawlUrlsRequestBody,
  CrawlUrlsResponseBody,
} from "../../backend/route-handlers/crawlUrlsHandler"
import { mapResponseFormErrorsToFormErrors } from "./mapResponseFormErrorsToFormErrors"

type FormValues = CrawlUrlsRequestBody
type FormErrors = Record<keyof FormValues, string>
type RequestResults = CrawlUrlsResponseBody

function createEmptyFormValues(): FormValues {
  return { url: "" }
}
function createEmptyFormErrors(): FormErrors {
  return { url: "" }
}

export const CrawlWebsiteUrlsForm: FC = () => {
  const [formValues, setFormValues] = useState(createEmptyFormValues())
  const [formErrors, setFormErrors] = useState(createEmptyFormErrors())
  const [generalFormError, setGeneralFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [data, setData] = useState<RequestResults["data"]>(null)

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

      const { data, formErrors, serverError }: RequestResults = await response.json()

      if (serverError) {
        setGeneralFormError(serverError.message)
      }

      if (formErrors) {
        const newFormErrors = mapResponseFormErrorsToFormErrors(formErrors, createEmptyFormErrors())
        setFormErrors(newFormErrors)
      }

      setData(data)
    } catch (error) {
      console.log(error)

      setGeneralFormError("Failed to crawl website urls")
      setData(null)
    }

    setFormLoading(false)
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
        results={data}
        handleClearResults={() => setData(null)}
      />
    </div>
  )
}
