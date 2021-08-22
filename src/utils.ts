export async function promiseOrder(promises) {
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

type LinkType = [string, RegExpMatchArray]

export function checkFirstNonNull(
  text: string,
  regexes: [string, RegExp][]
): LinkType | null {
  const rets: LinkType[] = []
  for (const [tag, rgx] of regexes) {
    const match = text.match(rgx)
    if (match !== null) rets.push([tag, match])
  }
  if (rets.length === 0) return null
  return rets.reduce((a, b) => ((a[1].index ?? 0) < (b[1].index ?? 0) ? a : b))
}
