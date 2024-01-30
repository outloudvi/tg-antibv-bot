import globalObject from './globalObject'

export function sendMessage(chat_id, text, reply_to_message_id = undefined) {
  return fetch(
    `https://api.telegram.org/bot${globalObject.BOT_KEY}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        chat_id,
        text,
        reply_to_message_id,
        parse_mode: 'HTML',
      }),
    }
  )
    .then((x) => x.json())
    .then((x: any) => {
      if (x.ok === false) throw x
      return x
    })
    .catch(async (e) => {})
}

export function editMessage(chat_id: number, message_id: number, text: string) {
  return fetch(
    `https://api.telegram.org/bot${globalObject.BOT_KEY}/editMessageText`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        chat_id,
        message_id,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    }
  )
    .then((x) => x.json())
    .then((x: any) => {
      if (x.ok === false) throw x
      return x
    })
    .catch(async (e) => {})
}

export function answerInlineQuery(inline_query_id, results) {
  return fetch(
    `https://api.telegram.org/bot${globalObject.BOT_KEY}/answerInlineQuery`,
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
  )
    .then((x) => x.json())
    .then((x: any) => {
      if (x.ok === false) throw x
      return x
    })
    .catch(async (e) => {})
}
