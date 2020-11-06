const lib = require('../lib')
const { describe } = require('mocha')
const { expect } = require('chai')
const { BadUrlError } = require('../errors')

describe('Library test suite', function () {
  it('bv2av', function () {
    expect(lib.bv2av('BV1Nt4y1D7pW')).to.eq('626524324')
  })
  it('findB23UrlFromText', async function () {
    expect(
      await lib.findB23UrlFromText('/convert b23.tv/eFXEF1?tracking=1')
    ).to.deep.eq('https://b23.tv/eFXEF1')
  })
  it('findBVFromText', async function () {
    expect(
      await lib.findBVFromText('/convert https://b23.tv/BV1Nt4y1D7pW?t=1')
    ).to.deep.eq(['BV1Nt4y1D7pW', 'bv'])
  })
  it('findAVFromText', async function () {
    expect(
      await lib.findAVFromText('/convert https://b23.tv/av23333333?t=1')
    ).to.deep.eq(['av23333333', 'av'])
  })
  it('findCVFromText', async function () {
    expect(
      await lib.findCVFromText(
        '/convert https://bilibili.com/read/cv2333333?t=1'
      )
    ).to.deep.eq(['cv2333333', 'cv'])
  })
  it('findUrlFromB23 filtered case', async function () {
    // Chai seems to be not supporting async error catching
    {
      let yes = 0
      await lib.findUrlFromB23('https://baidu.com').catch((e) => {
        if (e instanceof BadUrlError) {
          yes = 1
        }
      })
      expect(yes).to.eq(1)
    }
  })
  it('findUrlFromB23', async function () {
    expect(await lib.findUrlFromB23('https://b23.tv/eFXEF1')).to.eq(
      'https://www.bilibili.com/video/BV1CA411e7eA'
    )

    expect(await lib.findUrlFromB23('https://b23.tv/osjFE5')).to.eq(
      'https://www.bilibili.com/read/cv7603961'
    )

    expect(await lib.findUrlFromB23('b23.tv/7fZElg')).to.eq(
      'https://bml.bilibili.com/2020/index.html#/vr'
    )
  })

  it('getResp', async function () {
    expect(await lib.getResp('https://b23.tv/eFXEF1')).to.eq(
      'https://b23.tv/av328843878 = `https://b23.tv/eFXEF1`'
    )

    expect(await lib.getResp('http://b23.tv/osjFE5')).to.eq(
      'https://www.bilibili.com/read/cv7603961/ = `https://b23.tv/osjFE5`'
    )

    expect(await lib.getResp('b23.tv/7fZElg')).to.eq(
      'https://bml.bilibili.com/2020/index.html#/vr = `https://b23.tv/7fZElg`'
    )
  })
})
