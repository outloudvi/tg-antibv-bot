const lib = require('../lib')
const { describe } = require('mocha')
const { expect } = require('chai')

describe('Library test suite', function () {
  it('Can find BV', function () {
    expect(lib.findBVFromText('BV1Nt4y1D7pW')).to.eq('1Nt4y1D7pW')
    expect(lib.findBVFromText('b23.tv/BV1Nt4y1D7pW')).to.eq('1Nt4y1D7pW')
    expect(lib.findBVFromText('https://b23.tv/BV1Nt4y1D7pW')).to.eq(
      '1Nt4y1D7pW'
    )
    expect(lib.findBVFromText('https://bilibili.com/video/BV1Nt4y1D7pW')).to.eq(
      '1Nt4y1D7pW'
    )
    expect(
      lib.findBVFromText(
        'https://bilibili.com/video/BV1Nt4y1D7pW?tracking=flag'
      )
    ).to.eq('1Nt4y1D7pW')
  })

  it('Can find AV from BV', function () {
    expect(lib.bv2av('BV1Nt4y1D7pW')).to.eq(626524324)
  })

  it('Can find AV from BV', function () {
    expect(lib.bv2av('BV1Nt4y1D7pW')).to.eq(626524324)
  })

  it('Can find BV from b23', async function () {
    expect(await lib.findBVFromB23Url('https://b23.tv/eFXEF1')).to.eq(
      '1CA411e7eA'
    )
  })

  it('Can use findAVFromText universally', async function () {
    expect(await lib.findAVFromText('BV1Nt4y1D7pW')).to.eq(626524324)
    expect(
      await lib.findAVFromText(
        'https://bilibili.com/video/BV1Nt4y1D7pW?tracking=flag'
      )
    ).to.eq(626524324)
    expect(await lib.findAVFromText('https://b23.tv/eFXEF1')).to.eq(328843878)
  })
})
