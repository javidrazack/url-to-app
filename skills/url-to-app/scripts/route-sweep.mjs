#!/usr/bin/env node
/**
 * Route sweep — loads every route headless and fails any route whose app
 * root stays empty (an SPA returns HTTP 200 even when it crashes to blank).
 *
 * Usage:
 *   node route-sweep.mjs <base-url> <route,route,...> [viewportWidth] [viewportHeight]
 *
 * Requires the playwright package (browsers via `npx playwright install chromium`).
 * Exit 0 = every route rendered; exit 1 = broken routes or page errors (printed).
 */
import { chromium } from 'playwright'

const [baseUrl, routesArg, width = '1440', height = '900'] = process.argv.slice(2)
if (!baseUrl || !routesArg) {
  console.error('Usage: node route-sweep.mjs <base-url> <route,route,...> [viewportWidth] [viewportHeight]')
  process.exit(1)
}

const routes = routesArg.split(',').map((r) => r.trim()).filter(Boolean)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } })

const errors = []
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))

const broken = []
for (const route of routes) {
  const url = baseUrl + route
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
  } catch {
    await page.waitForTimeout(500)
  }
  await page.waitForTimeout(350)
  const children = await page.evaluate(() => document.getElementById('root')?.children.length ?? 0)
  if (children === 0) broken.push(route)
}

await browser.close()

if (broken.length) console.log('BROKEN ROUTES:', broken.join(', '))
else console.log(`All ${routes.length} routes render.`)
if (errors.length) console.log('PAGE ERRORS:', errors.slice(0, 10))
process.exit(broken.length || errors.length ? 1 : 0)
