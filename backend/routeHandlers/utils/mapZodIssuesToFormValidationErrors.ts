import { ZodIssue } from "zod"

export default function mapZodIssuesToFormValidationErrors<Body>(issues: ZodIssue[]) {
  return issues.map(({ message, path }) => {
    const key = path[0] as keyof Body
    return {
      key,
      message,
    }
  })
}
