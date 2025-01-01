import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 12,
      globals: {
        URL: false,
        fetch: false,
        addEventListener: false,
        Response: false,
        console: false,

        // variables
        BOT_KEY: false,
        BASEURL: false,
      },
    },
  },
  {
    ignores: ['dist/*', 'worker/*'],
  },
]
