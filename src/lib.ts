import { LinkType } from './types'
import {
  bv2av,
  getHeadRedirect,
  getAllResolvableLinks,
  typedLinkToString,
} from './utils'

const VALID_HOSTS = ['b23.tv', 'b23.wtf']

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
