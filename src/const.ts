import { LinkType } from './types'

const AV_ID_RGX = /av([0-9]+)/
const BV_ID_RGX = /BV([1-9A-HJ-NP-Za-km-z]+)/
const CV_ID_RGX = /cv([0-9]+)/
const B23_URL_RGX = /b23.(?:tv|wtf)\/([A-Za-z0-9]+)/

export const REGEXES: [LinkType, RegExp][] = [
  [LinkType.b23, B23_URL_RGX],
  [LinkType.av, AV_ID_RGX],
  [LinkType.bv, BV_ID_RGX],
  [LinkType.cv, CV_ID_RGX],
]
