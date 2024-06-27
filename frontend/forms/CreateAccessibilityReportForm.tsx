import { FC, useState } from "react"
import { FetchedResultsContainer } from "../components/FetchedResultsContainer"
import {
  CreateAccessibilityReportRequestBody,
  CreateAccessibilityReportResponseBody,
} from "../../backend/routeHandlers/createAccessibilityReportHandler"
import { mapResponseFormErrorsToFormErrors } from "./mapResponseFormErrorsToFormErrors"

type FormValues = CreateAccessibilityReportRequestBody
type FormErrors = Record<keyof FormValues, string>
type RequestResults = CreateAccessibilityReportResponseBody

function createEmptyFormValues(): FormValues {
  return { url: "", title: "" }
}

function createEmptyFormErrors(): FormErrors {
  return { url: "", title: "" }
}

export const CheckAccessibilityForm: FC = () => {
  const [formValues, setFormValues] = useState(createEmptyFormValues())
  const [formErrors, setFormErrors] = useState(createEmptyFormErrors())
  const [generalFormError, setGeneralFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [data, setData] = useState<RequestResults["data"]>(null)

  const handleCreateAccessibilityReport = async () => {
    setFormLoading(true)

    try {
      const response = await fetch("/api/create-accessibility-report", {
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
      console.error(error)

      setGeneralFormError("Failed to create accessibility report")
      setData(null)
    }

    setFormLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Create accessibility report</h2>

      <div className={`flex flex-col gap-1 w-full max-w-96 group ${formErrors.url ? "error" : ""}`}>
        <input
          className="max-w-96 disabled:opacity-50 disabled:cursor-not-allowed group-[.error]:shadow-sm group-[.error]:shadow-red-600"
          type="text"
          name="url"
          placeholder="https://www.example.com"
          value={formValues.url}
          onChange={(e) => {
            setFormValues({ ...formValues, url: e.target.value })
            setFormErrors({ ...formErrors, url: "" })
            setGeneralFormError("")
          }}
          onKeyDown={(e) => e.key === "Enter" && handleCreateAccessibilityReport()}
          disabled={formLoading}
        />
        {formErrors.url && (
          <span className="w-full px-1 text-sm text-red-600">{formErrors.url}</span>
        )}
      </div>

      <div
        className={`flex flex-col gap-1 w-full max-w-96 group ${formErrors.title ? "error" : ""}`}
      >
        <input
          className="max-w-96 disabled:opacity-50 disabled:cursor-not-allowed group-[.error]:shadow-sm group-[.error]:shadow-red-600"
          type="text"
          name="title"
          placeholder="Some report title"
          value={formValues.title}
          onChange={(e) => {
            setFormValues({ ...formValues, title: e.target.value })
            setFormErrors({ ...formErrors, title: "" })
            setGeneralFormError("")
          }}
          onKeyDown={(e) => e.key === "Enter" && handleCreateAccessibilityReport()}
          disabled={formLoading}
        />

        {formErrors.title && (
          <span className="w-full px-1 text-sm text-red-600">{formErrors.title}</span>
        )}
      </div>

      {generalFormError && (
        <span className="w-full px-2 py-4 font-bold text-center text-red-600 rounded-md shadow-md bg-red-100/50 max-w-96 shadow-red-600">
          {generalFormError}
        </span>
      )}

      <button
        className="disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleCreateAccessibilityReport}
        disabled={formLoading}
      >
        Create report
      </button>

      <FetchedResultsContainer
        id="create-accessibility-report"
        results={data}
        handleClearResults={() => setData(null)}
      />
    </div>
  )
}
