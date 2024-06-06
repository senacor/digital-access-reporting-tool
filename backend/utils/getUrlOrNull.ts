export default function getUrlOrNull(url: string, baseUrl?: string) {
  try {
    return new URL(url, baseUrl) // Resolves relative URLs with the baseUrl
  } catch (error) {
    return null
  }
}
