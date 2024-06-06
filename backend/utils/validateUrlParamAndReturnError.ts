import getUrlOrNull from "./getUrlOrNull"

export default function validateUrlParamAndReturnError(url: string) {
  if (!url) {
    return "URL is required"
  }

  if (!getUrlOrNull(url)) {
    return "URL not valid"
  }

  return null
}
