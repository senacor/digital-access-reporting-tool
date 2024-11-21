import { chromium } from "playwright-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import logger from "./logger"

const screenshotPath = "screenshots/"
const screenshotType = "png"

const createScreenshotPath = (url: URL) => {
  return screenshotPath + url.hostname + "." + screenshotType
}

// register the Stealth plugin in Playwright
chromium.use(StealthPlugin())

export default async function takeScreenshot(url: URL) {
  try {
    const browser = await chromium.launch()
    const screenshotPath = createScreenshotPath(url)
    const page = await browser.newPage()
    page.on('dialog', async dialog => { await dialog.dismiss() })

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(url.href)
    await page.screenshot({ path: screenshotPath, type: screenshotType })
    await browser.close()

    console.log("📸 Screenshot taken")

    return screenshotPath
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

    return null
  }
}
