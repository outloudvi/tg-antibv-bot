import { LinkType, TypedLink } from './types'
import { checkFirstNonNull, bv2av, getHeadRedirect } from './utils'

const AV_ID_RGX = /av([0-9]+)/
const BV_ID_RGX = /BV([1-9A-HJ-NP-Za-km-z]+)/
const CV_ID_RGX = /cv([0-9]+)/
const B23_URL_RGX = /b23.(?:tv|wtf)\/([A-Za-z0-9]+)/

const REGEXES: [LinkType, RegExp][] = [
  [LinkType.b23, B23_URL_RGX],
  [LinkType.av, AV_ID_RGX],
  [LinkType.bv, BV_ID_RGX],
  [LinkType.cv, CV_ID_RGX],
]

const VALID_HOSTS = ['b23.tv', 'b23.wtf']

export function typedLinkToString(link: TypedLink, finalized: boolean): string {
  const payload = link.payload
  switch (link.type) {
    case LinkType.b23:
      return `b23.tv/${payload}`
    case LinkType.av:
      // Only av can be finalized
      return (finalized ? `https://b23.tv/` : '') + `av${payload}`
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

export async function getResp(text: string): Promise<string> {
  const links = getAllResolvableLinks(text)
  if (links.length === 0) {
    return 'No valid av/BV/cv/b23 link found.'
  }
  let ret: string[] = []
  for (const link of links) {
    let { type: typ, payload: pld, source: src } = link
    const stack = ['`' + src + '`']
    if (typ === LinkType.av || typ === LinkType.cv) {
      return `${typedLinkToString(link, true)} = \`${src}\``
    }
    if (typ === LinkType.b23) {
      const pag = await getHeadRedirect(`https://b23.tv/${pld}`, VALID_HOSTS)
      if (pag === null) continue
      if (pag.startsWith('https://www.bilibili.com/video/BV')) {
        // it's a BV, push the BV typed link, needs conversion again
        typ = LinkType.bv
        pld = pag.replace('https://www.bilibili.com/video/BV', '')
        stack.push(
          typedLinkToString(
            {
              type: typ, // Must be bv
              payload: pld,
            },
            false
          )
        )
      } else {
        // push the raw URL
        stack.push(pag)
      }
    }
    if (typ === LinkType.bv) {
      stack.push(
        typedLinkToString(
          {
            type: LinkType.av,
            payload: bv2av('BV' + pld),
          },
          true
        )
      )
    }
    ret.push(stack.reverse().join(' = '))
  }
  return ret.join('\n')
}
