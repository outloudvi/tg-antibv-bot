/// <reference types="@types/node" />

import fetch from 'node-fetch'
globalThis.fetch = fetch

import { getResp } from '../src/lib'
import { bv2av, getHeadRedirect } from '../src/utils'
import { describe } from 'mocha'
import { expect } from 'chai'
import { BadUrlError } from '../src/errors'

describe('Library test suite', function () {
  it('bv2av', function () {
    expect(bv2av('BV1Nt4y1D7pW')).to.eq('626524324')
  })

  it('getHeadRedirect URL filter', async function () {
    // Chai seems to be not supporting async error catching
    {
      let yes = 0
      await getHeadRedirect('https://baidu.com', ['b23.tv']).catch((e) => {
        if (e instanceof BadUrlError) {
          yes = 1
        }
      })
      expect(yes).to.eq(1)
    }
  })

  it('getResp (b23->BV->av)', async function () {
    expect(await getResp('https://b23.tv/eFXEF1')).to.eq(
      'https://b23.tv/av328843878 = BV1CA411e7eA = `b23.tv/eFXEF1`'
    )
  })

  it('getResp (b23->cv)', async function () {
    expect(await getResp('http://b23.tv/osjFE5')).to.eq(
      'https://www.bilibili.com/read/cv7603961 = `b23.tv/osjFE5`'
    )
  })

  it('getResp (b23->others)', async function () {
    expect(await getResp('b23.tv/7fZElg')).to.eq(
      'https://bml.bilibili.com/2020/index.html#/vr = `b23.tv/7fZElg`'
    )
  })

  it('getResp (multiple)', async function () {
    expect(await getResp('https://b23.tv/eFXEF1  b23.tv/osjFE5')).to.eq(
      'https://b23.tv/av328843878 = BV1CA411e7eA = `b23.tv/eFXEF1`' +
        '\n' +
        'https://www.bilibili.com/read/cv7603961 = `b23.tv/osjFE5`'
    )
  })

  it('special tests', async function () {
    // issue #1
    expect(await getResp('https://www.bilibili.com/video/BV1aV411z7gR')).to.eq(
      'https://b23.tv/av414110286 = `BV1aV411z7gR`'
    )
    expect(await getResp('https://b23.tv/kGHdWU')).to.eq(
      'https://b23.tv/av805474857 = BV1934y1Q7HF = `b23.tv/kGHdWU`'
    )
  })

  it('IAP link', async function () {
    expect(await getResp('https://b23.tv/mXtAjY')).to.eq(
      'https://b23.tv/av846101025 = `b23.tv/mXtAjY`'
    )
  })

  // https://github.com/nicholascw/b23.wtf/issues/2
  it('b23.wtf#2', async function () {
    expect(await getResp('https://b23.tv/0xiavP')).to.eq(
      'https://mall.bilibili.com/detail.html?itemsId=10041024 = `b23.tv/0xiavP`'
    )
  })

  // https://github.com/nicholascw/b23.wtf/pull/3
  it('b23.wtf#3', async function () {
    expect(await getResp('https://b23.tv/uX6dMCE')).to.eq(
      'https://m.bilibili.com/topic-detail?topic_id=6690 = `b23.tv/uX6dMCE`'
    )
  })
})
