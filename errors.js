class BadUrlError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BadUrlError'
  }
}

module.exports = { BadUrlError }
