import { answerInlineQuery, editMessage, sendMessage } from './commutils'
import { NO_URL_FOUND, REPORT_A_BUG } from './const'
import globalObject from './globalObject'
import { getResp } from './lib'
import { Env } from './types'
import { buildResponseText, getAllResolvableLinks, rand } from './utils'

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
    ).then((x: any) => x.result.message_id)
  }
  let response = await respPromise
  const respText =
    response.length > 0 ? buildResponseText(response) : NO_URL_FOUND
  if (currWaitingMessage) {
    await editMessage(
      message.chat.id,
      currWaitingMessage,
      buildResponseText(response)
    )
  } else {
    await sendMessage(
      message.chat.id,
      respText,
      change_reply_to === -1 ? message.message_id : change_reply_to
    )
  }
}

async function handleInline(inlineQuery) {
  const response = await getResp(inlineQuery.query.trim())
  const ret: any[] = []

  if (response.length === 0) {
    ret.push({
      type: 'article',
      id: rand(),
      title: NO_URL_FOUND,
      description: REPORT_A_BUG,
      input_message_content: {
        message_text: NO_URL_FOUND,
        parse_mode: 'HTML',
      },
    })
  } else {
    // Only pick the first URL
    const firstResult = response[0]

    if (firstResult.ok) {
      // OnlyResult
      ret.push({
        type: 'article',
        id: rand(),
        title: 'av-id result only',
        input_message_content: {
          message_text: firstResult.original,
          parse_mode: 'HTML',
        },
      })
      // Full result with source
      const text = buildResponseText([firstResult])
      ret.push({
        type: 'article',
        id: rand(),
        title: 'av-id result with source',
        input_message_content: {
          message_text: text,
          parse_mode: 'HTML',
        },
      })
    } else {
      ret.push({
        type: 'article',
        id: rand(),
        title: 'Failed to parse',
        description: REPORT_A_BUG,
        input_message_content: {
          message_text: firstResult.reason,
          parse_mode: 'HTML',
        },
      })
    }
  }

  return await answerInlineQuery(inlineQuery.id, ret)
}

async function handler(request: Request) {
  if (request.method != 'POST') return
  if (
    request.headers.get('X-Telegram-Bot-Api-Secret-Token') !==
    globalObject.HOOK_SECRET
  )
    return
  const body: any = await request.json().catch(() => {
    return {}
  })
  if (body.message) {
    return await handleMessage(body.message)
  } else if (body.inline_query) {
    return await handleInline(body.inline_query)
  }
  return {}
}

async function handleWebhookSet(requestUrl: URL): Promise<Response> {
  const givenBotToken = requestUrl.searchParams.get('bot_token')
  if (givenBotToken !== globalObject.BOT_KEY) {
    return new Response("Bot token doesn't match", {
      status: 403,
    })
  }

  requestUrl.search = ''
  const webhookUrl = String(requestUrl)
  await fetch(
    `https://api.telegram.org/bot${givenBotToken}/setWebhook?url=${webhookUrl}&secret_token=${globalObject.HOOK_SECRET}`
  )
  return new Response(`Webhook set with the URL ${webhookUrl}`)
}

/**
 *
 * @param {Request} request
 */
async function handleRequest(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url)
  if (requestUrl.pathname === '/' && request.method === 'GET') {
    return handleWebhookSet(requestUrl)
  }
  try {
    await handler(request)
  } catch (e) {}
  return new Response('OK', { status: 200 })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    globalObject.BOT_KEY = env.BOT_KEY
    globalObject.HOOK_SECRET = env.BOT_KEY.slice(-8)
    return handleRequest(request)
  },
}
