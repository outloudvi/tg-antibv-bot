/// <reference types="./global" />

// Telegram

export async function sendMessage(
  chat_id,
  text,
  reply_to_message_id = undefined
) {
  return await fetch(`https://api.telegram.org/bot${BOT_KEY}/sendMessage`, {
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
  })
    .then((x) => x.json())
    .then((x: any) => {
      if (x.ok === false) throw x
      return x
    })
    .catch(async (e) => {
      await tellSlack({
        err: e,
        method: 'sendMessage',
        msg: text,
      })
    })
}

export async function editMessage(
  chat_id: number,
  message_id: number,
  text: string
) {
  return await fetch(`https://api.telegram.org/bot${BOT_KEY}/editMessageText`, {
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
  })
    .then((x) => x.json())
    .then((x: any) => {
      if (x.ok === false) throw x
      return x
    })
    .catch(async (e) => {
      await tellSlack({
        err: e,
        method: 'editMessage',
        msg: text,
      })
    })
}

export async function answerInlineQuery(inline_query_id, results) {
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
  )
    .then((x) => x.json())
    .then((x: any) => {
      if (x.ok === false) throw x
      return x
    })
    .catch(async (e) => {
      await tellSlack({
        err: e,
        method: 'answerInlineQuery',
        msg: results,
      })
    })
}

// Slack

export async function tellSlack(obj) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL is absent, skipping.')
    return
  }
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
