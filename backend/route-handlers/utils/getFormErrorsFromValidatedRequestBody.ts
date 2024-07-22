import { z } from "zod"
import { FormValidationError } from "./types"

export function getFormErrorsFromValidatedRequestBody<RequestBody>(
  body: z.SafeParseError<Record<keyof RequestBody, string>>,
) {
  return body.error.issues.map(({ message, path }) => {
    const key = path[0] as keyof RequestBody
    return {
      key,
      message,
    } satisfies FormValidationError<RequestBody>
  })
}
