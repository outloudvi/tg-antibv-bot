import { NO_DESTINATION_FOUND } from './const'
import { LinkResult, LinkType } from './types'
import {
  bv2av,
  getHeadRedirect,
  getAllResolvableLinks,
  typedLinkToString,
} from './utils'

export async function getResp(text: string): Promise<LinkResult[]> {
  const links = getAllResolvableLinks(text)
  if (links.length === 0) {
    return []
  }
  let ret: LinkResult[] = []
  for (const link of links) {
    let { type: typ, payload: pld, source: src } = link
    const stack: any[] = []
    if (typ === LinkType.av || typ === LinkType.cv) {
      ret.push({
        shortened: src,
        ok: true,
        intermediate: [],
        original: typedLinkToString(link, true),
      })
      continue
    }
    if (typ === LinkType.b23) {
      stack.pop() // we don't
      const pag = await getHeadRedirect(`https://bili2233.cn/${pld}`)
      if (pag === null) {
        ret.push({
          shortened: src,
          ok: false,
          reason: NO_DESTINATION_FOUND,
        })
        continue
      }
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
    let finalStack = stack.reverse()
    ret.push({
      shortened: src,
      ok: true,
      original: finalStack[0],
      intermediate: finalStack.slice(1),
    })
  }
  return ret
}
