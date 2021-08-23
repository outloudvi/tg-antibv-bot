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
      parse_mode: 'Markdown',
    }),
  })
}

export async function editMessage(chat_id, message_id, text) {
  return await fetch(`https://api.telegram.org/bot${BOT_KEY}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      chat_id,
      message_id,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
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
  ).then((x) => x.json())
}

// Slack

export async function tellSlack(obj) {
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
