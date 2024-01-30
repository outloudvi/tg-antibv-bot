import { Env } from './types'

const globalObject: Env & {
  HOOK_SECRET: string
} = {
  BOT_KEY: '',
  HOOK_SECRET: '',
}

export default globalObject
