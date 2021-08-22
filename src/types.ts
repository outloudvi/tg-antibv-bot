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
  source?: string
}
