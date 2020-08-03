const fetch = require('node-fetch')

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
  return (r - 8728348608) ^ 177451812
}

// Return BV without BV prefix.
function findBVFromText(text) {
  const match = text.match(/BV([1-9A-HJ-NP-Za-km-z]+)/)
  if (match === null) return ''
  return match[0].replace(/^BV/, '')
}

function findB23Url(text) {
  const match = text.match(/b23.tv\/[A-Za-z0-9]+/)
  if (match === null) return ''
  return 'https://' + match[0]
}

// Return BV without BV prefix.
async function findBVFromB23Url(text) {
  const b23Url = findB23Url(text)
  const url = await fetch(b23Url, {
    method: 'HEAD',
  }).then((x) => x.url)
  return findBVFromText(url)
}

// Return AV.
async function findAVFromText(text) {
  let bv = findBVFromText(text)
  // console.info('Found BV:', bv)
  if (bv) {
    return bv2av('BV' + bv)
  }
  let b23link = await findBVFromB23Url(text)
  // console.info('Found BV from url:', b23link)
  if (b23link) {
    return bv2av('BV' + b23link)
  }
  return ''
}

async function findAVFromTextWithSrc(text) {
  let bv = findBVFromText(text)
  if (bv) {
    return [bv2av('BV' + bv), 'BV' + bv]
  }
  let b23link = await findBVFromB23Url(text)
  if (b23link) {
    return [bv2av('BV' + b23link), findB23Url(text)]
  }
  return ''
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

module.exports = {
  findAVFromText,
  findBVFromB23Url,
  findBVFromText,
  findAVFromTextWithSrc,
  bv2av,
  rand,
  sendMessage,
  answerInlineQuery,
  tellSlack,
}
