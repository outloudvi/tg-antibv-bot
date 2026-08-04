/// <reference types="@types/node" />

import { getResp } from '../src/lib'
import { bv2av } from '../src/utils'
import { describe } from 'mocha'
import { expect } from 'chai'
import { LinkResultGood } from '../src/types'

function buildGoodResult(
  shortened: string,
  original: string,
  intermediate: string[],
): LinkResultGood {
  return { ok: true, original, shortened, intermediate }
}

async function checkUrl(
  shortened: string,
  original: string,
  intermediate: string[] = [],
) {
  const ret = await getResp(shortened)
  const expected = buildGoodResult(shortened, original, intermediate)
  ret[0].shortened = ret[0].shortened.replace("/?", "?")
  expected.shortened = expected.shortened.replace("/?", "?")
  expect(ret[0]).to.deep.eq(expected)
}

describe('Library test suite', function () {
  it('bv2av', function () {
    expect(bv2av('BV1Nt4y1D7pW')).to.eq('626524324')
  })

  it('bv2av - #4', function () {
    expect(bv2av('BV1rZ421z71a')).to.eq('1150234396')
  })

  it('bv2av - #5', function () {
    expect(bv2av('BV1L9Uoa9EUx')).to.eq('111298867365120')
  })

  // FIXME: b23.tv short links will expire; may not be a good way to test
  // it('#7', async function () {
  //   await checkUrl(
  //     'bili2233.cn/BmOPBLD',
  //     'https://www.bilibili.com/video/av113747427330355',
  //     ['BV18A6HYQEyd'],
  //   )
  // })

  it('#8', async function () {
    await checkUrl(
      'av116624887646402?t=1316',
      'https://www.bilibili.com/video/av116624887646402?t=1316',
      [],
    )
  })

  it('#9', async function () {
    await checkUrl(
      'BV11UBfBMEfQ/?p=2',
      'https://www.bilibili.com/video/av115938833733639?p=2',
      [],
    )

    await checkUrl(
      'BV11UBfBMEfQ?p=2',
      'https://www.bilibili.com/video/av115938833733639?p=2',
      [],
    )
  })
})
