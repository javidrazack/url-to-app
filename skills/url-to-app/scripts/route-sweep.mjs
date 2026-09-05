#!/usr/bin/env node
/**
 * From the generated project directory:
 * node <skill-path>/scripts/route-sweep.mjs <base-url> <routes.json> [width] [height]
 * Install playwright in that project and its Chromium browser before running.
 * Optional: ROUTE_SWEEP_STORAGE_STATE=/path/to/session.json (never commit sessions).
 * Exit 0: all checks passed; 1: route failures; 2: invalid input/setup failure.
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { validateLayoutChecks } from './layout-checks.mjs'

function routeUrl(path, base) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
    throw new Error('Route paths must start with a single / and include any app base path.')
  }
  const url = new URL(path, base)
  if (url.origin !== base.origin) throw new Error('Routes must stay on the base origin.')
  return url.href
}

export function validateManifest(input, baseUrl, width = 1440, height = 900) {
  const base = new URL(baseUrl)
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) {
    throw new Error('Use an HTTP(S) base URL without embedded credentials.')
  }
  for (const value of [width, height]) {
    if (!Number.isInteger(value) || value < 1) throw new Error('Viewport dimensions must be positive integers.')
  }
  if (!Array.isArray(input) || !input.length) throw new Error('Manifest must be a nonempty JSON array.')
  const seen = new Set()
  const routes = input.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error(`Invalid route entry ${index}.`)
    const allowed = ['path', 'selector', 'text', 'expectedPath', 'status', 'timeoutMs', 'errorSelector', 'layoutChecks']
    for (const key of Object.keys(entry)) {
      if (!allowed.includes(key)) throw new Error(`Unknown field ${key} in entry ${index}.`)
    }
    const url = routeUrl(entry.path, base)
    if (seen.has(url)) throw new Error(`Duplicate route: ${entry.path}`)
    seen.add(url)
    for (const key of ['selector', 'text']) {
      if (typeof entry[key] !== 'string' || !entry[key].trim()) throw new Error(`${entry.path}: ${key} is required.`)
    }
    if (entry.errorSelector !== undefined && (typeof entry.errorSelector !== 'string' || !entry.errorSelector.trim())) {
      throw new Error(`${entry.path}: errorSelector must be nonempty.`)
    }
    const status = entry.status ?? 200
    const timeoutMs = entry.timeoutMs ?? 15000
    if (!Number.isInteger(status) || status < 200 || status > 599) throw new Error(`${entry.path}: invalid status.`)
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new Error(`${entry.path}: invalid timeoutMs.`)
    const layoutChecks = validateLayoutChecks(entry.layoutChecks)
    return { ...entry, layoutChecks, url, expectedUrl: routeUrl(entry.expectedPath ?? entry.path, base), status, timeoutMs }
  })
  return { routes, viewport: { width, height } }
}

export async function sweep(browser, config, { storageState, inspectPage, reducedMotion } = {}) {
  const results = []
  for (const route of config.routes) {
    const errors = []
    let context
    let inspection
    try {
      // A fresh context prevents an earlier route's DOM or session changes masking failures.
      context = await browser.newContext({ viewport: config.viewport, ...(storageState ? { storageState } : {}), ...(reducedMotion ? { reducedMotion } : {}) })
      const page = await context.newPage()
      page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
      const critical = request => ['script', 'stylesheet'].includes(request.resourceType()) &&
        new URL(request.url()).origin === new URL(route.url).origin
      page.on('requestfailed', request => {
        if (critical(request)) errors.push(`asset failed: ${request.url()} (${request.failure()?.errorText})`)
      })
      page.on('response', response => {
        if (response.status() >= 400 && critical(response.request())) {
          errors.push(`asset HTTP ${response.status()}: ${response.url()}`)
        }
      })
      const response = await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: route.timeoutMs })
      if (!response || response.status() !== route.status) {
        throw new Error(`Expected HTTP ${route.status}, got ${response?.status() ?? 'no response'}.`)
      }
      await page.waitForURL(route.expectedUrl, { timeout: route.timeoutMs, waitUntil: 'domcontentloaded' })
      // CSS selector must identify completed route content, never the shell or a fallback.
      const target = page.locator(route.selector)
      await target.waitFor({ state: 'visible', timeout: route.timeoutMs })
      await page.waitForFunction(({ selector, text }) => {
        const node = document.querySelector(selector)
        const normalize = value => value.replace(/\s+/g, ' ').trim()
        return node && normalize(node.innerText ?? '').includes(normalize(text))
      }, { selector: route.selector, text: route.text }, { timeout: route.timeoutMs })
      const assertReady = async () => {
        if (await target.count() !== 1 || !await target.isVisible()) throw new Error('Expected exactly one visible content target.')
        const normalize = value => value.replace(/\s+/g, ' ').trim()
        if (!normalize(await target.innerText()).includes(normalize(route.text))) throw new Error('Expected route text disappeared.')
        if (page.url() !== route.expectedUrl) throw new Error(`Unexpected final URL: ${page.url()}`)
        const errorNodes = page.locator(route.errorSelector ?? '[data-route-error]')
        for (let i = 0; i < await errorNodes.count(); i++) {
          if (await errorNodes.nth(i).isVisible()) throw new Error('Visible route error state.')
        }
      }
      await assertReady()
      if (inspectPage) {
        inspection = await inspectPage(page, route)
        await assertReady()
      }
    } catch (error) {
      errors.push(error.message)
    } finally {
      if (context) {
        try { await context.close() } catch (error) { errors.push(`cleanup: ${error.message}`) }
      }
    }
    results.push({ path: route.path, ok: errors.length === 0, errors, ...(inspection === undefined ? {} : { inspection }) })
  }
  return results
}

export async function main(args = process.argv.slice(2)) {
  let browser
  try {
    const [baseUrl, manifestPath, width = '1440', height = '900'] = args
    if (!baseUrl || !manifestPath || args.length > 4) {
      throw new Error('Usage: node route-sweep.mjs <base-url> <routes.json> [width] [height]')
    }
    const config = validateManifest(JSON.parse(await readFile(manifestPath, 'utf8')), baseUrl, Number(width), Number(height))
    // Resolve from the app, not the installed skill's unrelated node_modules tree.
    const require = createRequire(resolve(process.cwd(), 'package.json'))
    let chromium
    try { ({ chromium } = require('playwright')) } catch {
      throw new Error('Install playwright in the app (npm install -D --save-exact playwright), then run this command from that app directory.')
    }
    browser = await chromium.launch()
    const results = await sweep(browser, config, { storageState: process.env.ROUTE_SWEEP_STORAGE_STATE })
    console.log(JSON.stringify({ passed: results.filter(r => r.ok).length, total: results.length, results }, null, 2))
    return results.every(result => result.ok) ? 0 : 1
  } catch (error) {
    console.error(`Route sweep setup failed: ${error.message}`)
    return 2
  } finally {
    if (browser) await browser.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = await main()
}
