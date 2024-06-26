export function getValidUrlOrNull(url: string, baseUrl?: string) {
  try {
    // Resolves relative URLs with the baseUrl.
    // URL("foo/bar", "http://www.example.com") -> "http://www.example.com/foo/bar"
    return new URL(url, baseUrl)
  } catch (error) {
    return null
  }
}

export function getValidatedUrlOrError(url?: string) {
  if (!url) {
    return {
      error: "URL is required",
    }
  }

  const validatedUrl = getValidUrlOrNull(url)
  if (!validatedUrl) {
    return {
      error: "URL is not valid",
    }
  }

  if (validatedUrl.protocol !== "https:") {
    return {
      error: "URL must start with https://",
    }
  }

  return { url: validatedUrl }
}
