import { LinkType } from './types'

export const INVALID_REPL_TEXT = 'No valid av/BV/cv/b23 link found.'

const AV_ID_RGX = /av([0-9]+)/
const BV_ID_RGX = /BV([1-9A-HJ-NP-Za-km-z]+)/
const CV_ID_RGX = /cv([0-9]+)/
const B23_URL_RGX = /b23.(?:tv|wtf)\/([A-Za-z0-9]+)/

export const ALLOWED_PARAMS: { [signature: string]: string[] } = {
  'mall.bilibili.com/detail.html': ['itemsId'],
  'm.bilibili.com/topic-detail': ['topic_id'],
  't.bilibili.com/vote/h5/index': ['vote_id'],
}

export const REGEXES: [LinkType, RegExp][] = [
  [LinkType.b23, B23_URL_RGX],
  [LinkType.av, AV_ID_RGX],
  [LinkType.bv, BV_ID_RGX],
  [LinkType.cv, CV_ID_RGX],
]
