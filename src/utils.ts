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

// Return AV with BV-prefixed BV.
// https://www.zhihu.com/question/381784377/answer/1099438784
export function bv2av(bv) {
  if (!bv) return

  const pos = [11, 10, 3, 8, 4, 6]
  const base = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'
  const table = {}
  for (let i = 0; i < base.length; i++) table[base[i]] = i

  let r = 0
  for (let i = 0; i < pos.length; i++) r += table[bv[pos[i]]] * 58 ** i
  return String((r - 8728348608) ^ 177451812)
}
