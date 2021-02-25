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

module.exports = { promiseOrder }
