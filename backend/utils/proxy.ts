import * as tunnel from "tunnel"
import { Agent } from "node:https"
import process from "node:process"
import got from "got"
import * as cheerio from "cheerio"

import logger from "./logger"

enum ProxyAge {
  infant,
  adult,
  aged,
}

type Proxy = {
  host: string
  port: number
  secure: boolean
  alive: boolean
  age: ProxyAge
  agent?: Agent
}

const PROXIES_LIST_URL = new URL("https://www.sslproxies.org")
const REFRESH_INTERVAL = 40000

let refreshIntervalId: undefined | ReturnType<typeof setInterval>

let proxies: Proxy[] = []

let currentProxy: undefined | Proxy

export async function withProxy() {
  if (!process.env.USE_PROXY) {
    return null
  }
  if (proxies.length === 0) {
    await refreshLoop()
  }
  if (currentProxy) {
    currentProxy = await testProxy(currentProxy)
  }
  if (!currentProxy) {
    const youngProxies = proxies.filter((p) => p.age < ProxyAge.adult)
    currentProxy = await pickProxy(youngProxies)
    logger.info(
      "picked up fresh proxy: %s(age: %s) from the latest list of: %d",
      currentProxy.host,
      ProxyAge[currentProxy.age],
      youngProxies.length,
    )
  }
  return currentProxy
}

export async function releaseProxies() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId)
  }
}

process.on("exit", async (code) => {
  await releaseProxies()
  logger.info("Process exit event with code: %d", code)
})

/**
 * Schedules the refreshing of the proxy list every REFRESH_INTERVAL/1000 seconds.
 */
async function refreshLoop() {
  logger.info("refreshing proxies list...")
  currentProxy = undefined
  await refreshProxies(PROXIES_LIST_URL)
  refreshIntervalId = setTimeout(refreshLoop, REFRESH_INTERVAL)
}

async function refreshProxies(proxiesListUrl: URL) {
  const body = await got(proxiesListUrl).text()
  const $ = cheerio.load(body)
  const htmlTable = $("section#list").find("table")
  proxies = []
  htmlTable.find("tr").each((i, row: any) => {
    // skip the header row
    if (i === 0) return
    const proxy: Proxy = { host: "", port: 0, secure: false, alive: false, age: ProxyAge.aged }
    $(row)
      .find("td, th")
      .each((j, cell) => {
        const value = $(cell).text()
        switch (j) {
          case 0:
            proxy.host = value
            break
          case 1:
            proxy.port = +value
            break
          case 6:
            proxy.secure = value.toLowerCase() == "yes"
            break
          case 7:
            const checked = value.toLowerCase()
            proxy.age =
              checked.includes("sec") || checked.includes("min ")
                ? ProxyAge.infant
                : checked.includes("hour")
                  ? ProxyAge.aged
                  : ProxyAge.adult
            break
          default:
            break
        }
      })
    proxies.push(proxy)
  })
}

async function pickProxy(proxies: Proxy[]) {
  const promises: Promise<Proxy>[] = []
  proxies.forEach((p) => promises.push(testProxy(p)))
  return Promise.any<Proxy>(promises).then((proxy) => proxy)
}

async function testProxy(proxy: Proxy) {
  const options = {
    headers: {
      Accept: "application/json",
    },
    timeout: {
      request: REFRESH_INTERVAL - 2 * 1000,
    },
    agent: {
      https: tunnel.httpsOverHttp({
        proxy: {
          host: proxy.host,
          port: proxy.port,
        },
      }) as Agent,
    },
  }
  try {
    await got("https://httpbin.org/ip", options).json()
    proxy.alive = true
    proxy.agent = options.agent.https
    return proxy
  } catch (error: any) {
    throw error
  }
}
