import { inspect } from "util"
import { assert } from "chai"

import { withProxy, releaseProxies } from "../utils/proxy"

before(() => {})

after(async () => {
  await releaseProxies()
})

describe("Get proxy", () => {
  it("proxy enabled", async () => {
    const result: any = await withProxy()
    assert.isNotEmpty(result, "at least one proxy must have been selected")
    console.log(`selected proxy: ${inspect(result)}`)
  })
})
