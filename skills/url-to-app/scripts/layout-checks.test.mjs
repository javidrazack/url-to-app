import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { validateLayoutChecks, inspectLayoutChecks } from './layout-checks.mjs'
import { validateManifest } from './route-sweep.mjs'

const aligned = { name: 'paired controls', type: 'align', edge: 'top', selectors: ['#name', '#company'], minWidth: 600 }
const sized = { name: 'control height', type: 'same-size', dimension: 'height', selectors: ['#name', '#company'] }
const label = { name: 'action label', type: 'single-line', selectors: ['#action-label'] }

test('layout contracts validate intent and reject ambiguous configuration', () => {
  assert.deepEqual(validateLayoutChecks(), [])
  assert.equal(validateLayoutChecks([aligned])[0].tolerancePx, 2)
  const bad = [null, {}, [null], [{ ...aligned, type: 'beauty' }], [{ ...aligned, selectors: ['#name'] }],
    [{ ...aligned, selectors: ['#name', '#name'] }], [{ ...aligned, edge: 'diagonal' }],
    [{ ...aligned, minWidth: 900, maxWidth: 600 }], [{ ...aligned, tolerancePx: 99 }],
    [{ ...aligned, minWidth: 0 }], [{ ...aligned, script: 'alert(1)' }], [aligned, aligned]]
  for (const input of bad) assert.throws(() => validateLayoutChecks(input))
  const manifest = [{ path: '/', selector: 'h1', text: 'Orders', layoutChecks: [aligned] }]
  assert.equal(validateManifest(manifest, 'http://localhost').routes[0].layoutChecks[0].type, 'align')
  assert.deepEqual(validateManifest([{ path: '/', selector: 'h1', text: 'Orders' }], 'http://localhost').routes[0].layoutChecks, [])
})

test('browser contracts distinguish defects, intentional mobile reflow, and absent targets', async t => {
  const require = createRequire(resolve(process.cwd(), 'package.json'))
  const { chromium } = require('playwright')
  const browser = await chromium.launch()
  t.after(() => browser.close())
  const context = await browser.newContext({ viewport: { width: 768, height: 900 } })
  const page = await context.newPage()
  await page.setContent(`<style>
    *{box-sizing:border-box}body{font:16px/1.4 system-ui} .fields{display:flex;gap:20px}
    input{display:block;width:200px;height:44px}#company{margin-top:7px;height:51px}
    button{font:16px/1.4 system-ui;width:80px;padding:8px} #action-label{display:block}
    @media(max-width:599px){.fields{flex-direction:column}}
    </style><div class="fields"><input id="name" aria-label="Name"><input id="company" aria-label="Company"></div>
    <button><span id="action-label">Create order</span></button><p>A legitimately multiline paragraph is not an action label.</p>`)
  const checks = validateLayoutChecks([aligned, sized, label])
  let results = await inspectLayoutChecks(page, checks)
  assert.deepEqual(results.map(r => r.status), ['fail', 'fail', 'fail'])
  assert.equal(results[0].spreadPx, 7)
  assert.equal(results[1].spreadPx, 7)
  assert.equal(results[2].measurements[0].textLines, 2)
  await page.addStyleTag({ content: '#company{margin-top:0;height:44px}button{width:160px}' })
  results = await inspectLayoutChecks(page, checks)
  assert.deepEqual(results.map(r => r.status), ['pass', 'pass', 'pass'])
  await page.setViewportSize({ width: 390, height: 844 })
  results = await inspectLayoutChecks(page, checks)
  assert.deepEqual(results.map(r => r.status), ['not-applicable', 'pass', 'pass'])
  const missing = validateLayoutChecks([{ ...label, selectors: ['#missing'] }])
  assert.equal((await inspectLayoutChecks(page, missing))[0].status, 'fail')
  const ambiguous = validateLayoutChecks([{ ...label, selectors: ['input'] }])
  assert.equal((await inspectLayoutChecks(page, ambiguous))[0].status, 'fail')
  await page.locator('#action-label').evaluate(el => { el.style.display = 'none' })
  assert.equal((await inspectLayoutChecks(page, validateLayoutChecks([label])))[0].status, 'fail')
  await page.locator('#action-label').evaluate(el => { el.style.display = 'block'; el.innerHTML = '<span>Create</span> <strong>order</strong>' })
  assert.equal((await inspectLayoutChecks(page, validateLayoutChecks([label])))[0].status, 'pass')
  await page.locator('#action-label').evaluate(el => { el.textContent = '' })
  assert.equal((await inspectLayoutChecks(page, validateLayoutChecks([label])))[0].status, 'fail')
})

test('single-line checks reject tightly wrapped text and ignore invisible descendants', async t => {
  const require = createRequire(resolve(process.cwd(), 'package.json'))
  const { chromium } = require('playwright')
  const browser = await chromium.launch()
  t.after(() => browser.close())
  const page = await browser.newPage({ viewport: { width: 768, height: 900 } })
  const checks = validateLayoutChecks([label])
  await page.setContent('<span id="action-label" style="display:block;width:70px;font:16px/1 Arial">Create order</span>')
  let result = (await inspectLayoutChecks(page, checks))[0]
  assert.equal(result.status, 'fail')
  assert.equal(result.measurements[0].textLines, 2)
  for (const hidden of ['visibility:hidden', 'opacity:0', 'display:none', 'content-visibility:hidden']) {
    await page.setContent(`<span id="action-label" style="display:block;font:16px/1.4 Arial">Create order<span style="display:block;${hidden}"><span>Hidden</span></span></span>`)
    result = (await inspectLayoutChecks(page, checks))[0]
    assert.equal(result.status, 'pass', hidden)
    assert.equal(result.measurements[0].textLines, 1, hidden)
  }
  await page.setContent('<span id="action-label" style="display:block;width:200px;font:16px/1.5 Arial"><span style="display:contents">Create order</span></span>')
  assert.equal((await inspectLayoutChecks(page, checks))[0].status, 'pass')
})
