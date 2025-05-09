import { assert, expect } from "chai"
import { before, after, describe, it } from "mocha"

import getValidUrlOrNull from "../utils/getValidUrlOrNull"
import takeScreenshot from "../utils/takeScreenshot"
import generateMultiPageReport from "../utils/report-generation/generateMultiPageReport"

let url: URL | null
let logoUrl: URL | null

before(() => {
  assert.isNotEmpty(process.env.URL, "URL is required")
  assert.isNotEmpty(process.env.LOGO_URL, "Logo URL is required")
  url = getValidUrlOrNull(process.env.URL || "")
  logoUrl = getValidUrlOrNull(process.env.LOGO_URL || "")
})

after(() => {})

describe("Generate equal access multi-page report", () => {
  it("WCAG", async () => {
    const screenshotUrl = await takeScreenshot(url!)
    assert.isNotEmpty(screenshotUrl, `Failed to create screenshot for URL: ${url}`)
    const { multiPageReport } = await generateMultiPageReport(url!, logoUrl!, screenshotUrl)
    assert.isNotEmpty(multiPageReport)
    expect(multiPageReport.pageCount).to.be.above(0)
  })
})
