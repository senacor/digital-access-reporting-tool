import { z } from "zod"

export const urlSchema = z
  .string({ required_error: "URL is required" })
  .min(1, "URL is required")
  .url("URL is not valid")
  .startsWith("https://", "Must provide secure URL (https://)")
