// Chain helpers: address validation, jar encoding, and read-only RPC queries.
import type { Network } from '@nimiq/mini-app-sdk'

export const LUNA_PER_NIM = 100_000
const RPC: Record<Network, string> = {
  mainnet: 'https://rpc.nimiqwatch.com',
  testnet: 'https://rpc.testnet.nimiqwatch.com',
}
const EXPLORER: Record<Network, string> = {
  mainnet: 'https://nimiq.watch/#',
  testnet: 'https://test.nimiq.watch/#',
}

export interface Jar {
  v: 1
  id: string // 6 char random id, used as on-chain tag
  n: string // name
  g: number // goal in NIM
  o: string // jar address (compact, no spaces)
  d?: string // deadline YYYY-MM-DD
  e: string // emoji
  k: JarKind
  net: Network
}
export type JarKind = 'gift' | 'trip' | 'redpacket' | 'vault' | 'group'

export interface Contribution {
  hash: string
  from: string
  value: number // luna
  note: string
  timestamp: number
  confirmations: number
}

// ---------- addresses ----------
const ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVXY'

export function compactAddress(a: string): string {
  return a.replace(/\s+/g, '').toUpperCase()
}
export function formatAddress(a: string): string {
  return compactAddress(a).replace(/(.{4})/g, '$1 ').trim()
}
export function shortAddress(a: string): string {
  const c = formatAddress(a)
  return `${c.slice(0, 9)}…${c.slice(-4)}`
}
export function isValidAddress(input: string): boolean {
  const a = compactAddress(input)
  if (!/^NQ[0-9]{2}[0-9A-Z]{32}$/.test(a)) return false
  for (const ch of a.slice(4)) if (!ALPHABET.includes(ch)) return false
  const rearranged = a.slice(4) + a.slice(0, 4)
  let numeric = ''
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0)
    numeric += code >= 65 && code <= 90 ? String(code - 55) : ch
  }
  let rem = 0
  for (let i = 0; i < numeric.length; i += 7) {
    rem = Number(String(rem) + numeric.slice(i, i + 7)) % 97
  }
  return rem === 1
}

// ---------- jar encoding (share links carry the whole jar; no backend) ----------
function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  bytes.forEach(b => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(b64)
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)))
}
export function encodeJar(j: Jar): string {
  return b64urlEncode(JSON.stringify(j))
}
export function decodeJar(s: string): Jar | null {
  try {
    const j = JSON.parse(b64urlDecode(s)) as Jar
    if (j.v !== 1 || !/^[A-Z0-9]{6}$/.test(j.id) || !isValidAddress(j.o)) return null
    if (!(j.g > 0) || typeof j.n !== 'string') return null
    j.n = j.n.slice(0, 40)
    if (j.net !== 'testnet') j.net = 'mainnet'
    return j
  }
  catch { return null }
}
export function newJarId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const r = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(r, x => chars[x % chars.length]).join('')
}

// ---------- on-chain tag ----------
export function txTag(jarId: string, note: string): string {
  // "GJ:<id>:<note>" must fit in 64 UTF-8 bytes
  let data = `GJ:${jarId}:${note.trim()}`
  const enc = new TextEncoder()
  while (enc.encode(data).length > 64) data = Array.from(data).slice(0, -1).join('')
  return data
}
function hexToUtf8(hex: string): string {
  if (!hex) return ''
  try {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(h => parseInt(h, 16)))
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  }
  catch { return '' }
}

// ---------- RPC ----------
let rlQueue: Promise<unknown> = Promise.resolve()
async function rpc<T>(net: Network, method: string, params: unknown[]): Promise<T> {
  // serialize requests to stay friendly with the open RPC rate limit
  const run = async () => {
    const res = await fetch(RPC[net], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    })
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
    const body = await res.json()
    if (body.error) throw new Error(body.error.message || 'RPC error')
    return body.result.data as T
  }
  const p = rlQueue.then(run, run)
  rlQueue = p.catch(() => undefined)
  return p
}

interface RpcTx {
  hash: string
  from: string
  to: string
  value: number
  senderData?: string
  recipientData?: string
  timestamp: number
  confirmations: number
  executionResult?: boolean
}

const cache = new Map<string, { at: number, data: RpcTx[] }>()

export async function fetchContributions(jar: Jar, force = false): Promise<Contribution[]> {
  const first = await fetchContributionsOn(jar, jar.net, force)
  if (first.length) return first
  // A jar link may carry the wrong network (e.g. created before the host network was known):
  // fall back to the other network and adopt it if contributions are found there.
  const other: Network = jar.net === 'testnet' ? 'mainnet' : 'testnet'
  try {
    const alt = await fetchContributionsOn(jar, other, force)
    if (alt.length) { jar.net = other; return alt }
  }
  catch { /* ignore */ }
  return first
}

async function fetchContributionsOn(jar: Jar, net: Network, force = false): Promise<Contribution[]> {
  jar = { ...jar, net }
  const key = `${jar.net}:${compactAddress(jar.o)}`
  const hit = cache.get(key)
  let txs: RpcTx[]
  if (hit && !force && Date.now() - hit.at < 15_000) txs = hit.data
  else {
    txs = await rpc<RpcTx[]>(jar.net, 'getTransactionsByAddress', [formatAddress(jar.o), 500, null])
    cache.set(key, { at: Date.now(), data: txs })
  }
  const prefix = `GJ:${jar.id}`
  const target = compactAddress(jar.o)
  const out: Contribution[] = []
  for (const t of txs) {
    if (t.executionResult === false) continue
    if (compactAddress(t.to) !== target) continue
    const msg = hexToUtf8(t.recipientData || '') || hexToUtf8(t.senderData || '')
    if (msg !== prefix && !msg.startsWith(`${prefix}:`)) continue
    out.push({
      hash: t.hash,
      from: t.from,
      value: t.value,
      note: msg.slice(prefix.length + 1),
      timestamp: t.timestamp,
      confirmations: t.confirmations,
    })
  }
  return out.sort((a, b) => b.timestamp - a.timestamp)
}

export async function fetchTx(net: Network, hash: string): Promise<RpcTx | null> {
  try { return await rpc<RpcTx>(net, 'getTransactionByHash', [hash]) }
  catch { return null }
}

export function explorerTx(net: Network, hash: string): string {
  return `${EXPLORER[net]}${hash}`
}

let priceCache: { at: number, usd: number } | null = null
export async function nimUsd(): Promise<number | null> {
  if (priceCache && Date.now() - priceCache.at < 300_000) return priceCache.usd
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=nimiq-2&vs_currencies=usd')
    const j = await r.json()
    const usd = j?.['nimiq-2']?.usd
    if (typeof usd === 'number') { priceCache = { at: Date.now(), usd }; return usd }
  }
  catch { /* price is optional */ }
  return null
}
