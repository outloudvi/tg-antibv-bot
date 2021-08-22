import { BadUrlError } from './errors'
import type { LinkType, TypedLinkSelector } from './types'

import fetch from 'node-fetch'

export function checkFirstNonNull(
  text: string,
  regexes: [LinkType, RegExp][]
): TypedLinkSelector | null {
  const rets: TypedLinkSelector[] = []
  for (const [tag, rgx] of regexes) {
    const match = text.match(rgx)
    if (match !== null) rets.push([tag, match])
  }
  if (rets.length === 0) return null
  return rets.reduce((a, b) => ((a[1].index ?? 0) < (b[1].index ?? 0) ? a : b))
}

// Return AV with **BV-prefixed** BV.
// https://www.zhihu.com/question/381784377/answer/1099438784
export function bv2av(bv: string): string {
  const pos = [11, 10, 3, 8, 4, 6]
  const base = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'
  const table = {}
  for (let i = 0; i < base.length; i++) table[base[i]] = i

  let r = 0
  for (let i = 0; i < pos.length; i++) r += table[bv[pos[i]]] * 58 ** i
  return String((r - 8728348608) ^ 177451812)
}

export async function getHeadRedirect(
  url: string,
  validHosts: string[] = []
): Promise<string | null> {
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    url = 'https://' + url
  }
  const target = new URL(url)
  if (!validHosts.includes(target.hostname) && validHosts.length > 0) {
    throw new BadUrlError(target.hostname)
  }
  return await fetch(url, {
    method: 'HEAD',
  })
    .then((x) => x.url)
    .then((x) => {
      const u = new URL(x)
      u.search = ''
      return u.toString()
    })
    .catch(() => null)
}

export function rand(): string {
  return String(Math.random()) + String(Math.random())
}
