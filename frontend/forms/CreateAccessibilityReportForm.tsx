import { FC, useState } from "react"
import { FetchedResultsContainer } from "../components/FetchedResultsContainer"
import { FormValidationError } from "../../backend/routeHandlers/types"
import { CreateAccessibilityReportResult } from "../../backend/routeHandlers/createAccessibilityReportHandler"

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

export const CheckAccessibilityForm: FC = () => {
  const [formValues, setFormValues] = useState(createInitialFormValues())
  const [formErrors, setFormErrors] = useState(createInitialFormErrors())
  const [generalFormError, setGeneralFormError] = useState("")
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
        body: JSON.stringify({ ...formValues }),
      })

      if (!response.ok) {
        const results: { formValidationErrors: FormValidationError[] } = await response.json()
        const newFormErrors = results.formValidationErrors.reduce(
          (formErrors, { key, message }) => {
            const formKey = formKeys.find((formKey) => formKey === key)
            if (formKey) {
              formErrors[formKey] = message
            }

            return formErrors
          },
          createInitialFormErrors(),
        )

        setFormErrors(newFormErrors)
        setResults(null)
        setFormLoading(false)
        return
      }

      const result: CreateAccessibilityReportResult = await response.json()

      setResults(result)
      setFormLoading(false)
    } catch (error) {
      console.error(error)

      setGeneralFormError("Failed to create accessibility report")
      setResults(null)
      setFormLoading(false)
    }
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
        results={results}
        handleClearResults={() => setResults(null)}
      />
    </div>
  )
}
