export enum LinkType {
  bv,
  av,
  b23,
  cv,
}

export type TypedLinkSelector = [LinkType, RegExpMatchArray]

export interface TypedLink {
  type: LinkType
  payload: string
  source: string
}

type LinkResultBad = {
  ok: false
  shortened: string
  reason: string
}

export type LinkResultGood = {
  ok: true
  shortened: string
  intermediate: string[]
  original: string
}

export type LinkResult = LinkResultBad | LinkResultGood
