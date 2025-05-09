import puppeteer from "puppeteer-extra"
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import * as accessibilityChecker from "accessibility-checker"

import logger from "./logger"
import { withProxy } from "./proxy"

const SCREENSHOT_BASE_URL =
  "https://raw.githubusercontent.com/senacor/digital-access-reporting-tool/refs/heads/feature/screenshots"
const screenshotPath = "screenshots/"
const screenshotType = "png"

const createScreenshotPath = (url: URL) => {
  return screenshotPath + url.hostname + "." + screenshotType
}

// register the Stealth and Ad-Blocker plugins with Puppeteer
puppeteer.use(AdblockerPlugin()).use(StealthPlugin())

export default async function takeScreenshot(url: URL) {
  let browser
  try {
    const screenshotPath = createScreenshotPath(url)
    const acConfig = await accessibilityChecker.getConfigUnsupported()
    const args: string[] = ["--ignore-certificate-errors"]
    const proxy = await withProxy()
    proxy && args.push(`--proxy-server=${proxy.host}:${proxy.port}`)
    browser = await puppeteer.launch({
      headless: acConfig.headless,
      defaultViewport: { width: 1920, height: 1080 },
      args: args,
    })
    const [page] = await browser.pages()
    await page.goto(url.href, { waitUntil: "domcontentloaded" })
    await acceptCookies(page)
    await page.screenshot({ path: screenshotPath, type: screenshotType })

    console.log("📸 Screenshot taken")
    return `${SCREENSHOT_BASE_URL}/${screenshotPath}`
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
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

async function acceptCookies(page: any) {
  try {
    const element = await page
      .locator(
        `a::-p-text(uswählen),
          :scope >>> tkds-button::-p-text(uswählen),
          :scope >>> a::-p-text(kzeptieren),
          :scope >>> a::-p-text(ustimmen),
          a::-p-text(eht klar),
          :scope >>> button::-p-text(ustimmen),
          :scope >>> button::-p-text(inverstanden),
          a::-p-text(kzeptieren),
          button::-p-text(kzeptieren),
          :scope >>> button::-p-text(kzeptieren),
          :scope >>> button::-p-text(ccept)
        `,
      )
      .setTimeout(3000)
    await element.click()
    await page.waitForNetworkIdle({ timeout: 3000, idleTime: 1000 })
    // Cookies have been accepted successfully
    return true
  } catch (error) {
    // An error occurred while accepting cookies
    console.log(`🔥 Error handling the consent dialog: ${error}`)
    return false
  }
}
