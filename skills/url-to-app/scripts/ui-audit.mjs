#!/usr/bin/env node
/**
 * From the app: node <skill-path>/scripts/ui-audit.mjs <base-url> <routes.json> <output-dir>
 * Requires playwright, @axe-core/playwright, and Chromium installed in the app.
 * Shares route readiness checks with route-sweep. Creates a unique evidence directory.
 * Machine checks only; screenshots still require visual review and journeys require testing.
 * Exit 0: no machine failures; 1: failures; 2: invalid input/setup failure.
 */
import { readFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { validateManifest, sweep } from './route-sweep.mjs'

export const PROFILES = [
  { name: 'mobile', width: 390, height: 844, reducedMotion: 'no-preference' },
  { name: 'tablet', width: 768, height: 1024, reducedMotion: 'no-preference' },
  { name: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { name: 'mobile-reduced-motion', width: 390, height: 844, reducedMotion: 'reduce' },
]

export async function inspectUI(page, { AxeBuilder, screenshotPath, timeoutMs }) {
  const warnings = []
  // Settle currently requested assets with a deadline, not an arbitrary screenshot delay.
  const assets = await page.evaluate(async timeout => {
    const pending = [document.fonts.ready, ...Array.from(document.images)
      .filter(img => img.loading !== 'lazy')
      .map(img => img.decode().catch(() => {}))]
    let timer
    const settled = await Promise.race([
      Promise.all(pending).then(() => true),
      new Promise(resolve => { timer = setTimeout(() => resolve(false), timeout) }),
    ])
    clearTimeout(timer)
    return { settled }
  }, timeoutMs)
  if (!assets.settled) warnings.push('Fonts/eager images did not settle before the deadline; inspect capture readiness.')

  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  const measurements = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth
    const visible = element => {
      const r = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
    }
    const nodes = Array.from(document.body.querySelectorAll('*'))
    const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > viewport + 1
    const suspects = overflow ? nodes.filter(el => {
      if (!visible(el)) return false
      const r = el.getBoundingClientRect()
      return r.left < -1 || r.right > viewport + 1
    }).slice(0, 12).map(el => ({ tag: el.tagName.toLowerCase(), id: el.id, className: el.getAttribute('class'), text: el.textContent?.trim().slice(0, 80) })) : []
    const brokenImages = Array.from(document.images).filter(img => visible(img) && img.complete && img.naturalWidth === 0)
      .map(img => ({ src: img.currentSrc || img.src, alt: img.alt }))
    const pendingLazyImages = Array.from(document.images).filter(img => img.loading === 'lazy' && !img.complete).length
    const navigation = performance.getEntriesByType('navigation')[0]
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    const resources = performance.getEntriesByType('resource')
    return {
      viewportWidth: viewport, documentWidth: document.documentElement.scrollWidth,
      overflow, suspects, brokenImages, pendingLazyImages,
      observations: {
        domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
        firstContentfulPaintMs: fcp?.startTime ?? null,
        recordedResourceCount: resources.length,
        recordedTransferBytes: resources.reduce((total, resource) => total + resource.transferSize, 0),
        domElements: nodes.length,
      },
    }
  })
  await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled', timeout: timeoutMs })
  if (measurements.pendingLazyImages) warnings.push(`${measurements.pendingLazyImages} lazy image(s) were not loaded; scroll and inspect below-fold content separately.`)
  const summarize = finding => ({
    id: finding.id, impact: finding.impact, help: finding.help, helpUrl: finding.helpUrl,
    nodes: finding.nodes.map(node => ({ target: node.target, failureSummary: node.failureSummary })),
  })
  const violations = audit.violations.map(summarize)
  const incomplete = audit.incomplete.map(summarize)
  const blockers = [
    ...violations.map(violation => `accessibility: ${violation.id} (${violation.nodes.length} node(s))`),
    ...(measurements.overflow ? ['Document has horizontal overflow.'] : []),
    ...measurements.brokenImages.map(img => `Broken image: ${img.src}`),
    ...(!assets.settled ? ['Capture readiness timed out.'] : []),
  ]
  return { blockers, warnings, violations, incomplete, measurements, screenshot: screenshotPath }
}

export async function runAudit(browser, { manifest, baseUrl, outputDir, AxeBuilder, storageState, profiles = PROFILES }) {
  // Validate everything before launching route work or creating evidence files.
  if (!Array.isArray(profiles) || !profiles.length) throw new Error('At least one viewport profile is required.')
  const names = new Set()
  const configs = profiles.map(profile => {
    if (!/^[a-z0-9-]+$/.test(profile.name) || names.has(profile.name)) throw new Error('Profile names must be unique filename-safe labels.')
    names.add(profile.name)
    if (!['reduce', 'no-preference'].includes(profile.reducedMotion)) throw new Error('Invalid reducedMotion profile.')
    return validateManifest(manifest, baseUrl, profile.width, profile.height)
  })
  await mkdir(outputDir, { recursive: true })
  const directory = await mkdtemp(join(resolve(outputDir), 'run-'))
  const results = []
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i]
    let index = 0
    const routes = await sweep(browser, configs[i], {
      storageState, reducedMotion: profile.reducedMotion,
      inspectPage: (page, route) => inspectUI(page, {
        AxeBuilder, timeoutMs: route.timeoutMs,
        screenshotPath: join(directory, `${profile.name}-${String(++index).padStart(3, '0')}.png`),
      }),
    })
    results.push(...routes.map(route => ({ ...route, profile, ok: route.ok && !!route.inspection && route.inspection.blockers.length === 0 })))
  }
  const report = {
    createdAt: new Date().toISOString(), baseUrl, directory,
    machinePassed: results.every(result => result.ok),
    visualReviewRequired: true, interactionReviewRequired: true,
    limitations: [
      'Machine results do not certify visual taste, complete WCAG compliance, or working user journeys.',
      'Screenshots freeze animations for comparison; inspect actual motion, focus, zoom, and overlays interactively.',
      'Performance observations are an unthrottled local navigation sample, not field Core Web Vitals or INP.',
      'Recorded transfers may exclude cached/cross-origin bytes; lazy/offscreen assets and CSS backgrounds need manual inspection.',
      'Review axe incomplete results manually and exercise hidden/menu/dialog states separately.',
    ], results,
  }
  const reportPath = join(directory, 'report.json')
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n')
  return { ...report, reportPath }
}

export async function main(args = process.argv.slice(2)) {
  let browser
  try {
    if (args.length !== 3) throw new Error('Usage: node ui-audit.mjs <base-url> <routes.json> <output-dir>')
    const [baseUrl, manifestPath, outputDir] = args
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    validateManifest(manifest, baseUrl)
    const require = createRequire(resolve(process.cwd(), 'package.json'))
    let chromium, AxeBuilder
    try {
      ;({ chromium } = require('playwright'))
      AxeBuilder = require('@axe-core/playwright').default
    } catch {
      throw new Error('From the app directory: npm install -D --save-exact playwright @axe-core/playwright; then npx playwright install chromium.')
    }
    browser = await chromium.launch()
    const report = await runAudit(browser, { manifest, baseUrl, outputDir, AxeBuilder, storageState: process.env.ROUTE_SWEEP_STORAGE_STATE })
    console.log(JSON.stringify({ machinePassed: report.machinePassed, checked: report.results.length, report: report.reportPath, visualReviewRequired: true }, null, 2))
    return report.machinePassed ? 0 : 1
  } catch (error) {
    console.error(`UI audit setup failed: ${error.message}`)
    return 2
  } finally {
    if (browser) await browser.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = await main()
