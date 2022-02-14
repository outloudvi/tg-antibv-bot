import {
  answerInlineQuery,
  editMessage,
  sendMessage,
  tellSlack,
} from './commutils'
import { NO_URL_FOUND, REPORT_A_BUG } from './const'
import { getResp } from './lib'
import { buildResponseText, getAllResolvableLinks, rand } from './utils'

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
    ).then((x: any) => x.result.message_id)
  }
  let response = await respPromise
  const respText =
    response.length > 0 ? buildResponseText(response) : NO_URL_FOUND
  if (currWaitingMessage) {
    await editMessage(message.chat.id, currWaitingMessage, response)
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
        title: firstResult.original,
        input_message_content: {
          message_text: firstResult.original,
          parse_mode: 'HTML',
        },
      })
      // see #3
      const nonVerbosedExpandedForIOS = firstResult.original.replace(
        'b23.tv',
        'www.bilibili.com'
      )
      ret.push({
        type: 'article',
        id: rand(),
        title: nonVerbosedExpandedForIOS,
        input_message_content: {
          message_text: nonVerbosedExpandedForIOS,
          parse_mode: 'HTML',
        },
      })
      // Full result with source
      const text = buildResponseText([firstResult])
      ret.push({
        type: 'article',
        id: rand(),
        title: text,
        input_message_content: {
          message_text: text,
          parse_mode: 'HTML',
        },
      })
    } else {
      ret.push({
        type: 'article',
        id: rand(),
        title: firstResult.reason,
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
      error: String(e),
      stack: (e as Error).stack || [],
    })
  }
  return new Response('OK', { status: 200 })
}
