const {
  findAVFromTextWithSrc,
  rand,
  sendMessage,
  answerInlineQuery,
  tellSlack,
} = require('./lib')
// const fetch = require('node-fetch')

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

async function getResp(text) {
  let earlyReturn = false
  const result = await findAVFromTextWithSrc(text).catch((e) => {
    earlyReturn = 'Error on extracting av number: ' + String(e)
  })
  if (earlyReturn) return earlyReturn
  return result.length > 0
    ? `${result[1]} = b23.tv/av${result[0]}`
    : `We don't find valid Bilibili links in ${text}.`
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
  const body = await request.json().catch((x) => {
    return {}
  })
  if (body.message) {
    return await handleMessage(body.message)
  }
  if (body.inline_query) {
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
  let ret
  try {
    ret = await handler(request)
  } catch (e) {
    await tellSlack(e)
  }
  return new Response('OK', { status: 200 })
}
