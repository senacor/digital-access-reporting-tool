import { chromium } from "playwright"
import logger from "./logger"

const screenshotPath = "screenshots/"

const createScreenshotPath = (url: URL) => {
  return screenshotPath + url.hostname + ".png"
}

export default async function takeScreenshot(url: URL) {
  try {
    const browser = await chromium.launch()
    const page = await browser.newPage()

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(url.href)
    await page.screenshot({ path: createScreenshotPath(url) })
    await browser.close()

    console.log("Screenshot taken 📸")

    return true
  } catch (error) {
    logger.print("error", "Failed to take screenshot")

    if (error instanceof Error) {
      logger.print(
        "error",
        `${JSON.stringify({ message: error.message, stack: error.stack }, null, 2)}`,
      )
    } else {
      logger.print("error", `${JSON.stringify(error, null, 2)}`)
    }

    return false
  }
}
