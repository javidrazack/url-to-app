/** Intent-specific geometry checks; these measure declared contracts, not visual taste. */
export function validateLayoutChecks(input = []) {
  if (!Array.isArray(input)) throw new Error('layoutChecks must be an array.')
  const names = new Set()
  return input.map(check => {
    if (!check || typeof check !== 'object' || Array.isArray(check)) throw new Error('Invalid layout check.')
    const common = ['name', 'type', 'selectors', 'minWidth', 'maxWidth', 'tolerancePx']
    const specific = check.type === 'align' ? ['edge'] : check.type === 'same-size' ? ['dimension'] : []
    if (!['align', 'same-size', 'single-line'].includes(check.type)) throw new Error('Unknown layout check type.')
    for (const key of Object.keys(check)) if (![...common, ...specific].includes(key)) throw new Error(`Unknown layout field: ${key}`)
    if (typeof check.name !== 'string' || !check.name.trim() || names.has(check.name)) throw new Error('Layout names must be nonempty and unique per route.')
    names.add(check.name)
    const minimum = check.type === 'single-line' ? 1 : 2
    if (!Array.isArray(check.selectors) || check.selectors.length < minimum ||
        check.selectors.some(s => typeof s !== 'string' || !s.trim()) || new Set(check.selectors).size !== check.selectors.length) {
      throw new Error(`Layout ${check.name}: supply ${minimum}+ distinct nonempty CSS selectors.`)
    }
    if (check.type === 'align' && !['top', 'bottom', 'left', 'right'].includes(check.edge)) throw new Error('Invalid alignment edge.')
    if (check.type === 'same-size' && !['width', 'height'].includes(check.dimension)) throw new Error('Invalid size dimension.')
    for (const key of ['minWidth', 'maxWidth']) if (check[key] !== undefined && (!Number.isInteger(check[key]) || check[key] < 1)) throw new Error(`Invalid ${key}.`)
    if (check.minWidth !== undefined && check.maxWidth !== undefined && check.minWidth > check.maxWidth) throw new Error('Layout width bounds are reversed.')
    const tolerancePx = check.tolerancePx ?? 2
    if (!Number.isFinite(tolerancePx) || tolerancePx < 0 || tolerancePx > 10) throw new Error('Layout tolerancePx must be between 0 and 10.')
    return { ...check, tolerancePx }
  })
}

export async function inspectLayoutChecks(page, checks = []) {
  const width = page.viewportSize().width
  const results = []
  for (const check of checks) {
    if (width < (check.minWidth ?? 1) || width > (check.maxWidth ?? Infinity)) {
      results.push({ name: check.name, status: 'not-applicable', viewportWidth: width })
      continue
    }
    try {
      const measurements = []
      for (const selector of check.selectors) {
        const target = page.locator(selector)
        if (await target.count() !== 1 || !await target.isVisible()) throw new Error(`Expected one visible element: ${selector}`)
        const measurement = await target.evaluate(element => {
          const box = element.getBoundingClientRect()
          const lines = []
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
          while (walker.nextNode()) {
            const node = walker.currentNode
            if (!node.textContent.trim() || getComputedStyle(node.parentElement).visibility !== 'visible') continue
            // display:contents has no box of its own but can contain painted text.
            let hidden = false
            for (let parent = node.parentElement; parent; parent = parent.parentElement) {
              const style = getComputedStyle(parent)
              if (style.display === 'none' || Number(style.opacity) === 0 || style.contentVisibility === 'hidden') {
                hidden = true
                break
              }
            }
            if (hidden) continue
            const range = document.createRange()
            range.selectNodeContents(node)
            for (const rect of range.getClientRects()) {
              if (rect.width > 0 && rect.height > 0) lines.push({ top: rect.top, bottom: rect.bottom })
            }
          }
          // Same-line inline text substantially overlaps; adjacent tight lines can overlap a little.
          const bands = []
          for (const line of lines.sort((a, b) => a.top - b.top)) {
            const last = bands.at(-1)
            const overlap = last ? Math.min(last.bottom, line.bottom) - Math.max(last.top, line.top) : 0
            if (last && overlap >= Math.min(last.bottom - last.top, line.bottom - line.top) / 2) last.bottom = Math.max(last.bottom, line.bottom)
            else bands.push({ ...line })
          }
          return { top: box.top, bottom: box.bottom, left: box.left, right: box.right,
            width: box.width, height: box.height, textLines: bands.length }
        })
        measurements.push({ selector, ...measurement })
      }
      const property = check.type === 'align' ? check.edge : check.dimension
      const values = property ? measurements.map(m => m[property]) : []
      const spreadPx = values.length ? Math.max(...values) - Math.min(...values) : null
      const passed = check.type === 'single-line' ? measurements.every(m => m.textLines === 1) : spreadPx <= check.tolerancePx
      results.push({ name: check.name, status: passed ? 'pass' : 'fail', type: check.type,
        viewportWidth: width, tolerancePx: check.tolerancePx, spreadPx, measurements })
    } catch (error) {
      results.push({ name: check.name, status: 'fail', viewportWidth: width, error: error.message })
    }
  }
  return results
}
