import {
  answerInlineQuery,
  editMessage,
  sendMessage,
  tellSlack,
} from './commutils'
import { getResp } from './lib'
import { getAllResolvableLinks, rand } from './utils'

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

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
  const linkNumber = getAllResolvableLinks(text).length
  const respPromise = getResp(text)
  let currWaitingMessage
  if (linkNumber > 2) {
    currWaitingMessage = await sendMessage(
      message.chat.id,
      `Resolving ${linkNumber} links...\n` +
        "Reduce the link number if you don't get the response.",
      change_reply_to === -1 ? message.message_id : change_reply_to
    )
      .then((x) => x.json())
      .then((x) => x.result.message_id)
  }
  const respText = await respPromise
  if (currWaitingMessage) {
    await editMessage(message.chat.id, currWaitingMessage, respText)
  } else {
    await sendMessage(
      message.chat.id,
      respText,
      change_reply_to === -1 ? message.message_id : change_reply_to
    )
  }
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
async function handleRequest(request: Request): Promise<Response> {
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
