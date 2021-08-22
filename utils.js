async function promiseOrder(promises) {
  let failure
  for (const i of promises) {
    let result
    let succeed = false
    try {
      result = await i
      succeed = true
    } catch (e) {
      failure = e
    }
    if (succeed) return result
  }
  throw failure
}

/**
 * @param {string} text
 * @param {[string, RegExp][]} regexes
 * @returns [tag, match] or null
 */
function checkFirstNonNull(text, regexes) {
  const rets = []
  for (const [tag, rgx] of regexes) {
    const match = text.match(rgx)
    if (match !== null) rets.push([tag, match])
  }
  if (rets.length === 0) return null
  return rets.reduce((a, b) => (a[1].index < b[1].index ? a : b))
}

module.exports = { promiseOrder, checkFirstNonNull }
