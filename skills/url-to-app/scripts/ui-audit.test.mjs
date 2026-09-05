/** Run from a project with playwright and @axe-core/playwright installed. */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { spawn } from 'node:child_process'
import { runAudit, PROFILES } from './ui-audit.mjs'

const entry = path => ({ path, selector: '#ready', text: 'Orders', timeoutMs: 3000 })
const accessible = content => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Order desk</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f6f8;color:#172536;font:16px/1.5 system-ui,sans-serif}main{max-width:1080px;margin:auto;padding:32px 24px}h1{margin:0 0 8px;font-size:32px;letter-spacing:-.025em}p{margin:0 0 24px;color:#415267}button{font:inherit;min-height:44px;padding:10px 18px;background:#165dba;color:white;border:0;border-radius:7px}button:focus-visible{outline:3px solid #172536;outline-offset:3px}.data{margin-top:24px;background:white;padding:24px;border:1px solid #ccd5df;border-radius:10px}dt{font-weight:600}dd{margin:4px 0 16px}.wide{width:1800px}.faint{color:#eee;background:white}
</style></head><body><main><h1 id="ready">Orders</h1><p>Review orders and manage fulfillment.</p>${content}</main></body></html>`

test('UI audit rejects invalid profiles and manifest before writing evidence', async () => {
  await assert.rejects(() => runAudit(null, { manifest: [], baseUrl: 'http://localhost', profiles: PROFILES, outputDir: 'unused' }))
  await assert.rejects(() => runAudit(null, { manifest: [entry('/')], baseUrl: 'http://localhost', profiles: [], outputDir: 'unused' }))
  await assert.rejects(() => runAudit(null, { manifest: [entry('/')], baseUrl: 'http://localhost', profiles: [{ name: '../unsafe', width: 390, height: 844, reducedMotion: 'reduce' }], outputDir: 'unused' }))
})

test('real browser audit catches UI defects and preserves readable capture evidence', async t => {
  const require = createRequire(resolve(process.cwd(), 'package.json'))
  const { chromium } = require('playwright')
  const AxeBuilder = require('@axe-core/playwright').default
  const dir = await mkdtemp(join(tmpdir(), 'url-to-app-ui-test-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname
    if (path === '/missing.png') { res.writeHead(404); res.end(); return }
    const pages = {
      '/good': accessible('<button type="button">Create order</button><section class="data" aria-label="Recent order"><dl><dt>Order</dt><dd>ORD-001</dd><dt>Status</dt><dd>Ready to ship</dd></dl></section>'),
      '/overflow': accessible('<p class="wide">This content is wider than the viewport.</p>'),
      '/unlabelled': accessible('<button type="button"><svg aria-hidden="true" width="24" height="24"><circle cx="12" cy="12" r="8" fill="white"/></svg></button>'),
      '/low-contrast': accessible('<p class="faint">This text should fail contrast checks.</p>'),
      '/broken-image': accessible('<img src="/missing.png" alt="Order package" width="100" height="100">'),
      '/motion-bug': accessible('<style>@media(prefers-reduced-motion:reduce){#ready{display:none}}</style><p>Content should stay available.</p>'),
      '/missing-route': accessible('').replace('id="ready"', 'id="shell-title"'),
    }
    res.setHeader('Content-Type', 'text/html')
    res.end(pages[path] || accessible('<p>Unknown fixture</p>'))
  })
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections() }))
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  t.after(() => browser.close())
  const manifest = ['/good', '/overflow', '/unlabelled', '/low-contrast', '/broken-image', '/motion-bug', '/missing-route'].map(entry)
  const report = await runAudit(browser, { manifest, baseUrl, outputDir: dir, AxeBuilder, profiles: [PROFILES[0], PROFILES[3]] })
  assert.equal(report.machinePassed, false)
  assert.equal(report.visualReviewRequired, true)
  assert.equal(report.interactionReviewRequired, true)
  assert.equal(report.results.length, 14)
  const find = (path, profile = 'mobile') => report.results.find(result => result.path === path && result.profile.name === profile)
  assert.equal(find('/good').ok, true, JSON.stringify(find('/good')))
  assert.equal(find('/good', 'mobile-reduced-motion').ok, true)
  assert.ok(find('/overflow').inspection.measurements.overflow)
  assert.ok(find('/unlabelled').inspection.violations.some(v => v.id === 'button-name'))
  assert.ok(find('/low-contrast').inspection.violations.some(v => v.id === 'color-contrast'))
  assert.equal(find('/broken-image').inspection.measurements.brokenImages.length, 1)
  assert.equal(find('/motion-bug').ok, true)
  assert.equal(find('/motion-bug', 'mobile-reduced-motion').ok, false)
  assert.equal(find('/missing-route').ok, false)
  const png = await readFile(find('/good').inspection.screenshot)
  assert.equal(png.subarray(1, 4).toString(), 'PNG')
  const saved = JSON.parse(await readFile(report.reportPath, 'utf8'))
  assert.equal(saved.results.length, report.results.length)
  assert.ok(saved.limitations.length > 0)

  const input = join(dir, 'routes.json')
  const cli = fileURLToPath(new URL('./ui-audit.mjs', import.meta.url))
  const run = () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, baseUrl, input, join(dir, 'cli')], { cwd: process.cwd() })
    let stdout = '', stderr = ''
    child.stdout.on('data', data => { stdout += data })
    child.stderr.on('data', data => { stderr += data })
    child.on('error', reject)
    child.on('close', code => resolve({ code, stdout, stderr }))
  })
  await writeFile(input, JSON.stringify([entry('/good')]))
  const good = await run()
  assert.equal(good.code, 0, good.stderr)
  assert.equal(JSON.parse(good.stdout).checked, 4)
  await writeFile(input, JSON.stringify([entry('/unlabelled')]))
  assert.equal((await run()).code, 1)
  await writeFile(input, '[]')
  assert.equal((await run()).code, 2)
})
