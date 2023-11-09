/// <reference types="@types/node" />

import { getResp } from '../src/lib'
import { bv2av } from '../src/utils'
import { describe } from 'mocha'
import { expect } from 'chai'
import { LinkResultGood } from '../src/types'

function buildGoodResult(
  shortened: string,
  original: string,
  intermediate: string[]
): LinkResultGood {
  return { ok: true, original, shortened, intermediate }
}

async function checkUrl(shortened, original, intermediate: string[] = []) {
  const ret = await getResp(shortened)
  expect(ret[0]).to.deep.eq(buildGoodResult(shortened, original, intermediate))
}

describe('Library test suite', function () {
  it('bv2av', function () {
    expect(bv2av('BV1Nt4y1D7pW')).to.eq('626524324')
  })

  it('getResp (b23->BV->av)', async function () {
    await checkUrl(
      'b23.tv/eFXEF1',
      'https://www.bilibili.com/video/av328843878',
      ['BV1CA411e7eA']
    )
  })

  it('getResp (b23->cv)', async function () {
    await checkUrl('b23.tv/osjFE5', 'https://www.bilibili.com/read/cv7603961')
  })

  it('getResp (b23->others)', async function () {
    await checkUrl(
      'b23.tv/7fZElg',
      'https://bml.bilibili.com/2020/index.html#/vr'
    )
  })

  it('getResp (multiple)', async function () {
    const resp = await getResp('https://b23.tv/eFXEF1  b23.tv/osjFE5')
    expect(resp).to.deep.eq([
      buildGoodResult(
        'b23.tv/eFXEF1',
        'https://www.bilibili.com/video/av328843878',
        ['BV1CA411e7eA']
      ),
      buildGoodResult(
        'b23.tv/osjFE5',
        'https://www.bilibili.com/read/cv7603961',
        []
      ),
    ])
  })

  it('special tests', async function () {
    // issue #1
    await checkUrl('BV1aV411z7gR', 'https://www.bilibili.com/video/av414110286')

    await checkUrl(
      'b23.tv/kGHdWU',
      'https://www.bilibili.com/video/av805474857',
      ['BV1934y1Q7HF']
    )
  })

  it('IAP link', async function () {
    await checkUrl(
      'b23.tv/mXtAjY',
      'https://www.bilibili.com/video/av846101025'
    )
  })

  // https://github.com/nicholascw/b23.wtf/issues/2
  it('b23.wtf#2', async function () {
    await checkUrl(
      'b23.tv/0xiavP',
      'https://mall.bilibili.com/detail.html?itemsId=10041024'
    )
  })

  // https://github.com/nicholascw/b23.wtf/pull/3
  it('b23.wtf#3', async function () {
    await checkUrl(
      'b23.tv/uX6dMCE',
      'https://m.bilibili.com/topic-detail?topic_id=6690'
    )
  })
})
