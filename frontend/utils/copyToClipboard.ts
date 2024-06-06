export async function copyToClipboard(elementId: string) {
  try {
    const node = document.getElementById(elementId)

    if (!node || !node.textContent) {
      throw new Error("Element not found")
    }

    if (!node.textContent) {
      throw new Error("No text content found")
    }

    await navigator.clipboard.writeText(node.textContent)
  } catch (error) {
    console.error("Failed to copy to clipboard", error)
  }
}
