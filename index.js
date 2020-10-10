const {
  rand,
  sendMessage,
  answerInlineQuery,
  tellSlack,
  findUrlFromB23,
  findAVFromText,
  findBVFromText,
  findCVFromText,
  findB23UrlFromText,
  bv2av,
} = require('./lib')

const promiseAny = require('promise.any')
const { BadUrlError } = require('./errors')

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

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
  const result = await promiseAny([
    findAVFromText(text),
    findBVFromText(text),
    findCVFromText(text),
  ]).catch(() => {
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
  }

  return `${dst} = ${transformedOverB23 ? b23URL : src}`
}

async function handleMessage(message, change_reply_to = -1) {
  // Ignore /start in PM
  if (
    message.chat.type === 'private' &&
    (message.text || '').startsWith('/start')
  )
    return
  if (
    message.chat.type !== 'private' &&
    !(message.text || '').toLowerCase().startsWith('/convert')
  )
    return
  if (message.reply_to_message) {
    await handleMessage(message.reply_to_message, message.message_id)
    return
  }
  let text = message.text || ''
  text = text.replace(/^\/convert(@antibvbot)? /i, '')
  if (text === '') return
  const resptext = await getResp(text.trim())
  await sendMessage(
    message.chat.id,
    resptext,
    change_reply_to === -1 ? message.message_id : change_reply_to
  )
}

async function handleInline(inlineQuery) {
  // await tellSlack(inlineQuery)
  const resptext = await getResp(inlineQuery.query.trim())
  const ret = [
    {
      type: 'article',
      id: rand(),
      title: resptext,
      input_message_content: {
        message_text: resptext,
        parse_mode: 'Markdown',
      },
    },
  ]
  return await answerInlineQuery(inlineQuery.id, ret)
}

async function handler(request) {
  if (request.method != 'POST') return
  const body = await request.json().catch(() => {
    return {}
  })
  if (body.message) {
    return await handleMessage(body.message)
  } else if (body.inline_query) {
    return await handleInline(body.inline_query)
  }
  return {}
}

/**
 *
 * @param {Request} request
 */
async function handleRequest(request) {
  let path = new URL(request.url).pathname
  if (path == '/acct') {
    const resp = await fetch(
      `https://api.telegram.org/bot${BOT_KEY}/setWebhook?url=${BASEURL}`
    )
    return resp.clone()
  }
  try {
    await handler(request)
  } catch (e) {
    await tellSlack({
      error: e.toString(),
      stack: e.stack,
    })
  }
  return new Response('OK', { status: 200 })
}
