const fetch = require('node-fetch')
const { BadUrlError } = require('./errors')
const { promiseOrder } = require('./utils')

const validHosts = ['b23.tv']

// Return AV with BV-prefixed BV.
// https://www.zhihu.com/question/381784377/answer/1099438784
function bv2av(bv) {
  if (!bv) return

  const pos = [11, 10, 3, 8, 4, 6]
  const base = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'
  const table = {}
  for (let i = 0; i < base.length; i++) table[base[i]] = i

  let r = 0
  for (let i = 0; i < pos.length; i++) r += table[bv[pos[i]]] * 58 ** i
  return String((r - 8728348608) ^ 177451812)
}

// Return BV/cv with BV/cv prefix.
async function findUrlFromB23(b23url) {
  if (!b23url.startsWith('https://') && !b23url.startsWith('http://')) {
    b23url = 'https://' + b23url
  }
  const target = new URL(b23url)
  if (!validHosts.includes(target.hostname)) {
    throw new BadUrlError(target.hostname)
  }
  const url = await fetch(b23url, {
    method: 'HEAD',
  })
    .then((x) => x.url)
    .then((x) => {
      const u = new URL(x)
      u.search = ''
      return u.toString()
    })
  return url
}

async function findB23UrlFromText(text) {
  const match = text.match(/b23.tv\/[A-Za-z0-9]+/)
  if (match === null) throw new BadUrlError(text)
  return 'https://' + match[0]
}

async function findBVFromText(text) {
  const match = text.match(/BV([1-9A-HJ-NP-Za-km-z]+)/i)
  if (match === null) throw 'BV# not found'
  return [match[0], 'bv']
}

async function findCVFromText(text) {
  const match = text.match(/cv([0-9]+)/i)
  if (match === null) throw 'cv# not found'
  return [match[0], 'cv']
}

async function findAVFromText(text) {
  const match = text.match(/av([0-9]+)/i)
  if (match === null) throw 'av# not found'
  return [match[0], 'av']
}

function rand() {
  return String(Math.random()) + String(Math.random())
}

async function sendMessage(chat_id, text, reply_to_message_id = undefined) {
  return await fetch(`https://api.telegram.org/bot${BOT_KEY}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      chat_id,
      text,
      reply_to_message_id,
      parse_mode: 'Markdown',
    }),
  })
}

async function answerInlineQuery(inline_query_id, results) {
  const ret = await fetch(
    `https://api.telegram.org/bot${BOT_KEY}/answerInlineQuery`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        inline_query_id,
        results,
        cache_time: 600,
      }),
    }
  ).then((x) => x.json())
}

async function tellSlack(obj) {
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      text: typeof obj === 'object' ? JSON.stringify(obj) : String(obj),
    }),
  })
}

async function getResp(text) {
  let transformedOverB23 = false
  let b23URL = ''
  try {
    if (text.includes('b23.tv')) {
      b23URL = await findB23UrlFromText(text)
      text = await findUrlFromB23(b23URL)
      transformedOverB23 = true
    }
  } catch (e) {
    if (e instanceof BadUrlError) return 'Not a valid b23.tv URL.'
    return 'Unexpected error: ' + e.toString()
  }
  const result = await promiseOrder([
    findBVFromText(text),
    findCVFromText(text),
    findAVFromText(text),
  ]).catch(() => {
    if (transformedOverB23) {
      // well, b23 can give anything...
      return [text, 'others']
    }
    return 'No valid av/BV/cv link found.'
  })
  const src = result[0]
  let dst = ''
  if (!Array.isArray(result)) {
    return result
  }
  switch (result[1]) {
    case 'av': {
      dst = `https://b23.tv/${src}`
      break
    }
    case 'bv': {
      dst = `https://b23.tv/av${bv2av(src)}`
      break
    }
    case 'cv': {
      dst = `https://www.bilibili.com/read/${src}/`
      break
    }
    default: {
      dst = result[0]
    }
  }

  return `${dst} = ${
    transformedOverB23 ? `\`${b23URL.trimStart('https://')}\`` : src
  }`
}

module.exports = {
  bv2av,
  findB23UrlFromText,
  findBVFromText,
  findAVFromText,
  findCVFromText,
  findUrlFromB23,
  rand,
  sendMessage,
  answerInlineQuery,
  tellSlack,
  getResp,
}
