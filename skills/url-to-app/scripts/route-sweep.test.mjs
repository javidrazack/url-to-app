/** From a directory with playwright installed: node --test <skill-path>/scripts/route-sweep.test.mjs */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { spawn } from 'node:child_process'
import { validateManifest, sweep } from './route-sweep.mjs'

const entry = (path, extra = {}) => ({ path, selector: '#ready', text: 'Order 123', timeoutMs: 700, ...extra })

test('reject invalid inventories before opening a browser', () => {
  for (const routes of [[], null, ['/orders'], [entry('/orders'), entry('/orders')],
    [entry('//other.example')], [entry('/orders', { selector: '' })],
    [entry('/orders', { text: ' ' })], [entry('/orders', { timeoutMs: 0 })],
    [entry('/orders', { status: '200' })], [entry('/orders', { typo: true })]]) {
    assert.throws(() => validateManifest(routes, 'http://localhost:4173'))
  }
  assert.throws(() => validateManifest([entry('/orders')], 'file:///tmp'))
  assert.throws(() => validateManifest([entry('/orders')], 'http://localhost', 0))
  const config = validateManifest([entry('/app/orders?q=1#detail')], 'http://localhost/app/')
  assert.equal(config.routes[0].url, 'http://localhost/app/orders?q=1#detail')
})

test('browser sweep checks actual route content, navigation and errors', async t => {
  const { chromium } = createRequire(resolve(process.cwd(), 'package.json'))('playwright')
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname
    if (path === '/redirect') { res.writeHead(302, { Location: '/good' }); res.end(); return }
    if (path === '/abort') { req.socket.destroy(); return }
    if (path === '/missing.js') { res.writeHead(404); res.end(); return }
    if (path === '/bad-status') res.statusCode = 503
    if (path === '/expected-404') res.statusCode = 404
    res.setHeader('Content-Type', 'text/html')
    const ready = '<main id="ready">Order 123</main>'
    const pages = {
      '/good': ready,
      '/shell': '<div id="root"><nav>Navigation</nav></div>',
      '/fallback': '<div id="root">Loading...</div>',
      '/wrong-text': '<main id="ready">Different order</main>',
      '/hidden': '<main id="ready" style="display:none">Order 123</main>',
      '/duplicate': ready + ready,
      '/bad-status': ready,
      '/expected-404': ready,
      '/page-error': ready + '<script>throw new Error("fixture crash")</script>',
      '/asset-error': ready + '<script src="/missing.js"></script>',
      '/error-boundary': ready + '<div data-route-error>Could not load</div>',
      '/delayed': '<main id="ready">Loading...</main><script>setTimeout(()=>{document.querySelector("#ready").textContent="Order 123"},100)</script>',
      '/sets-session': ready + '<script>localStorage.setItem("previous","yes")</script>',
      '/fresh-session': '<main id="ready"></main><script>document.querySelector("#ready").textContent=localStorage.getItem("previous")?"Leaked session":"Order 123"</script>',
    }
    res.end(pages[path] ?? '<main>Not found</main>')
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections() }))
  const base = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  t.after(() => browser.close())
  const cases = [
    ['/good', true], ['/delayed', true], ['/shell', false], ['/fallback', false],
    ['/wrong-text', false], ['/hidden', false], ['/duplicate', false],
    ['/bad-status', false], ['/expected-404', true, { status: 404 }],
    ['/redirect', false], ['/page-error', false], ['/asset-error', false],
    ['/error-boundary', false], ['/abort', false], ['/sets-session', true], ['/fresh-session', true],
  ]
  const results = await sweep(browser, validateManifest(cases.map(([path, , extra]) => entry(path, extra)), base))
  for (let i = 0; i < cases.length; i++) {
    assert.equal(results[i].ok, cases[i][1], `${cases[i][0]}: ${JSON.stringify(results[i])}`)
  }
  const redirects = await sweep(browser, validateManifest([entry('/redirect', { expectedPath: '/good' })], base))
  assert.equal(redirects[0].ok, true, JSON.stringify(redirects))

  // Exercise CLI dependency resolution from the app cwd and exit/report contracts.
  const dir = await mkdtemp(resolve(tmpdir(), 'route-sweep-test-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const manifest = resolve(dir, 'routes.json')
  const cli = new URL('./route-sweep.mjs', import.meta.url)
  const run = () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli.pathname, base, manifest], { cwd: process.cwd() })
    let stdout = '', stderr = ''
    child.stdout.on('data', data => { stdout += data })
    child.stderr.on('data', data => { stderr += data })
    child.on('error', reject)
    child.on('close', code => resolve({ code, stdout, stderr }))
  })
  await writeFile(manifest, JSON.stringify([entry('/good')]))
  const passed = await run()
  assert.equal(passed.code, 0, passed.stderr)
  assert.equal(JSON.parse(passed.stdout).passed, 1)
  await writeFile(manifest, JSON.stringify([entry('/shell')]))
  assert.equal((await run()).code, 1)
  await writeFile(manifest, '[]')
  assert.equal((await run()).code, 2)
})
