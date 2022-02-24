import { LinkResult, LinkType } from './types'
import type { TypedLink, TypedLinkSelector } from './types'
import { ALLOWED_PARAMS, REGEXES, REPORT_A_BUG } from './const'

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

function tryToURL(s: any): URL | null {
  try {
    return new URL(s)
  } catch (_) {
    return null
  }
}

export function typedLinkToString(
  link: Omit<TypedLink, 'source'>,
  finalized: boolean
): string {
  const payload = link.payload
  switch (link.type) {
    case LinkType.b23:
      return `b23.tv/${payload}`
    case LinkType.av:
      // Only av can be finalized
      return (
        (finalized ? `https://www.bilibili.com/video/` : '') + `av${payload}`
      )
    case LinkType.bv:
      return `BV${payload}`
    case LinkType.cv:
      return (
        (finalized ? `https://www.bilibili.com/read/` : '') + `cv${payload}`
      )
  }
}

export function getAllResolvableLinks(text: string): TypedLink[] {
  let start = 0
  const ret: TypedLink[] = []
  while (start < text.length) {
    const curr = text.slice(start)
    const match = checkFirstNonNull(curr, REGEXES)
    if (match === null) break
    ret.push({
      type: match[0],
      source: match[1][0],
      payload: match[1][1],
    })
    start += (match[1].index ?? 0) + match[1][0].length
  }
  return ret
}

function iapLinkToVideo(iapLink: URL): string {
  const schemaedLink = tryToURL(iapLink.searchParams.get('schema'))
  if (schemaedLink !== null && schemaedLink.hostname === 'video') {
    // Analyze the schemed link if possible
    return typedLinkToString(
      {
        type: LinkType.av, // Must be bv
        payload: schemaedLink.pathname.replace(/\//, ''),
      },
      true
    )
  }
  const preUrl = iapLink.searchParams.get('preUrl') as string
  return typedLinkToString(getAllResolvableLinks(preUrl)[0], true)
}

export async function getHeadRedirect(url: string): Promise<string | null> {
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    url = 'https://' + url
  }
  return await fetch(url, {
    method: 'HEAD',
    redirect: 'manual',
  })
    .then((x) => x.headers.get('Location'))
    .then((x) => {
      if (x === null) return null
      let u = new URL(x)
      if (u.hostname === 'd.bilibili.com') {
        return iapLinkToVideo(u)
      }
      sanitizeParams(u)
      return u.toString()
    })
    .catch(() => null)
}

export function rand(): string {
  return String(Math.random()) + String(Math.random())
}

function sanitizeParams(u: URL): URL {
  const allowedParams = ALLOWED_PARAMS[`${u.hostname}${u.pathname}`] || []
  const keys = [...u.searchParams.keys()]
  for (const i of keys) {
    if (!allowedParams.includes(i)) {
      u.searchParams.delete(i)
    }
  }
  return u
}

export function buildResponseText(response: LinkResult[]): string {
  return (
    response
      .map((x) => {
        if (x.ok) {
          return [
            `<a href="${x.original}">${x.original}</a>`,
            ...x.intermediate,
            `<code>${x.shortened}</code>`,
          ].join(' = ')
        } else {
          return `Failed seeking ${x.shortened}: ${x.reason}`
        }
      })
      .join('\n') +
    (response.filter((x) => !x.ok).length > 0 ? '\n' + REPORT_A_BUG : '')
  )
}
