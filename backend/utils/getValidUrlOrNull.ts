export function getValidUrlOrNull(url: string, baseUrl?: string) {
  try {
    // Resolves relative URLs with the baseUrl.
    // URL("foo/bar", "http://www.example.com") -> "http://www.example.com/foo/bar"
    return new URL(url, baseUrl)
  } catch (error) {
    return null
  }
}
