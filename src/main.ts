import './style.css'
import { init, getHostNetwork, NimiqProviderError, type NimiqProvider, type Network } from '@nimiq/mini-app-sdk'
import {
  type Jar, type JarKind, type Contribution, LUNA_PER_NIM, compactAddress, formatAddress, shortAddress,
  isValidAddress, encodeJar, decodeJar, newJarId, txTag, fetchContributions, fetchTx, explorerTx, nimUsd,
} from './chain'
import { t, detectLang, setLang, getLang, LANGS, type Lang } from './i18n'

// ---------------- state ----------------
const app = document.getElementById('app')!
let nimiq: NimiqProvider | null = null
let accounts: string[] = []
const network: Network = getHostNetwork() ?? 'mainnet'
const inPay = typeof window !== 'undefined' && !!window.nimiqPay
setLang(detectLang())

const KINDS: { k: JarKind, e: string }[] = [
  { k: 'gift', e: '🎁' }, { k: 'trip', e: '✈️' }, { k: 'redpacket', e: '🧧' }, { k: 'vault', e: '🐷' }, { k: 'group', e: '🤝' },
]

function loadJars(): Jar[] {
  try { return (JSON.parse(localStorage.getItem('gj.jars') || '[]') as string[]).map(decodeJar).filter(Boolean) as Jar[] }
  catch { return [] }
}
function saveJar(j: Jar) {
  const list = loadJars().filter(x => x.id !== j.id)
  list.unshift(j)
  localStorage.setItem('gj.jars', JSON.stringify(list.slice(0, 30).map(encodeJar)))
}
function removeJar(id: string) {
  localStorage.setItem('gj.jars', JSON.stringify(loadJars().filter(x => x.id !== id).map(encodeJar)))
}

// ---------------- helpers ----------------
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]!))
const nim = (luna: number) => (luna / LUNA_PER_NIM).toLocaleString(undefined, { maximumFractionDigits: 2 })
function shareUrl(j: Jar): string {
  const base = location.origin + location.pathname
  return `${base}?j=${encodeJar(j)}`
}
function payDeepLink(j: Jar): string {
  const u = new URL(shareUrl(j))
  return `https://nimpay.app/miniapps/open/${u.host}${u.pathname}${u.search}`
}
function daysLeft(d?: string): number | null {
  if (!d) return null
  const end = new Date(`${d}T23:59:59`)
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000)
}
function hue(addr: string): number {
  let h = 0
  for (const c of compactAddress(addr)) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}
function avatar(addr: string): string {
  return `<span class="av" style="--h:${hue(addr)}">${esc(compactAddress(addr).slice(-2))}</span>`
}
function toast(msg: string, kind: 'ok' | 'err' | 'info' = 'info') {
  const el = document.createElement('div')
  el.className = `toast ${kind}`
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.classList.add('out'), 2600)
  setTimeout(() => el.remove(), 3200)
}
function confetti() {
  const box = document.createElement('div')
  box.className = 'confetti'
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i')
    p.style.left = `${Math.random() * 100}%`
    p.style.setProperty('--h', String(Math.floor(Math.random() * 360)))
    p.style.animationDelay = `${Math.random() * 0.6}s`
    box.appendChild(p)
  }
  document.body.appendChild(box)
  setTimeout(() => box.remove(), 3500)
}
function streakDays(list: Contribution[]): number {
  const days = new Set(list.map(c => new Date(c.timestamp).toDateString()))
  let n = 0
  const d = new Date()
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1)
  while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1) }
  return n
}

async function ensureNimiq(): Promise<NimiqProvider | null> {
  if (nimiq) return nimiq
  if (!inPay) return null
  try { nimiq = await init({ timeout: 10_000 }) }
  catch { nimiq = null }
  return nimiq
}
async function ensureAccounts(): Promise<string[]> {
  const p = await ensureNimiq()
  if (!p) return []
  try { accounts = await p.listAccounts() }
  catch (e) { if (!(NimiqProviderError.is(e) && e.type === 'PERMISSION_DENIED')) console.error(e) }
  return accounts
}

// ---------------- views ----------------
function header(title = 'GoalJar', backTo?: () => void): string {
  return `
  <header class="top">
    ${backTo ? `<button class="ghost" id="back" aria-label="${t('back')}">←</button>` : '<span class="logo">🫙</span>'}
    <h1>${esc(title)}</h1>
    <select id="lang" aria-label="Language">${LANGS.map(l => `<option value="${l.code}" ${l.code === getLang() ? 'selected' : ''}>${l.label}</option>`).join('')}</select>
  </header>
  ${network === 'testnet' ? `<div class="pill warn">${t('testnet')}</div>` : ''}`
}
function bindHeader(rerender: () => void, backTo?: () => void) {
  document.getElementById('lang')!.addEventListener('change', (e) => {
    setLang((e.target as HTMLSelectElement).value as Lang)
    rerender()
  })
  if (backTo) document.getElementById('back')!.addEventListener('click', backTo)
}

async function renderHome() {
  scrollTo(0, 0)
  history.replaceState(null, '', location.pathname)
  const jars = loadJars()
  app.innerHTML = `
  ${header()}
  <p class="tagline">${t('tagline')}</p>
  <section>
    <div class="row between"><h2>${t('myJars')}</h2><button class="primary sm" id="new">＋ ${t('createJar')}</button></div>
    ${jars.length === 0 ? `<div class="empty">🫙<p>${t('noJars')}</p></div>` : `<ul class="jars">${jars.map(j => `
      <li data-id="${j.id}" class="card jar-item" tabindex="0">
        <span class="emoji">${esc(j.e)}</span>
        <div class="grow"><b>${esc(j.n)}</b><div class="bar"><i id="bar-${j.id}" style="width:0%"></i></div>
        <small id="lbl-${j.id}">${t('loading')}</small></div>
      </li>`).join('')}</ul>`}
  </section>
  <section class="card">
    <label>${t('openLink')}<input id="link" placeholder="${t('openLinkHint')}"></label>
    <button class="secondary" id="openlink">${t('open')}</button>
  </section>
  <details class="card how"><summary>${t('how')}</summary><ol><li>${t('how1')}</li><li>${t('how2')}</li><li>${t('how3')}</li></ol></details>
  <footer>MIT · <a href="${esc(import.meta.env.VITE_REPO_URL || 'https://github.com/minorCoder/nimiq-goaljar')}" id="repo" target="_blank" rel="noopener">source</a></footer>`
  bindHeader(renderHome)
  document.getElementById('new')!.onclick = () => renderCreate()
  document.getElementById('openlink')!.onclick = () => {
    const v = (document.getElementById('link') as HTMLInputElement).value.trim()
    const m = v.match(/[?&]j=([A-Za-z0-9_-]+)/) || v.match(/^([A-Za-z0-9_-]{40,})$/)
    const j = m ? decodeJar(m[1]) : null
    if (!j) return toast(t('failed', { msg: 'invalid link' }), 'err')
    saveJar(j); renderJar(j)
  }
  document.querySelectorAll<HTMLElement>('.jar-item').forEach(li => {
    const j = jars.find(x => x.id === li.dataset.id)!
    li.onclick = () => renderJar(j)
    li.onkeydown = (e) => { if (e.key === 'Enter') renderJar(j) }
  })
  for (const j of jars) {
    fetchContributions(j).then((list) => {
      const sum = list.reduce((a, c) => a + c.value, 0)
      const pct = Math.min(100, (sum / (j.g * LUNA_PER_NIM)) * 100)
      const bar = document.getElementById(`bar-${j.id}`); const lbl = document.getElementById(`lbl-${j.id}`)
      if (bar) bar.style.width = `${pct}%`
      if (lbl) lbl.textContent = `${nim(sum)} ${t('of')} ${j.g.toLocaleString()} NIM · ${pct.toFixed(0)}%`
    }).catch(() => { const lbl = document.getElementById(`lbl-${j.id}`); if (lbl) lbl.textContent = t('rpcError') })
  }
}

async function renderCreate(kind: JarKind = 'gift') {
  scrollTo(0, 0)
  app.innerHTML = `
  ${header(t('createJar'), renderHome)}
  <section>
    <h2>${t('template')}</h2>
    <div class="kinds">${KINDS.map(x => `<button class="kind ${x.k === kind ? 'on' : ''}" data-k="${x.k}"><span>${x.e}</span><b>${t(`k_${x.k}` as never)}</b><small>${t(`kd_${x.k}` as never)}</small></button>`).join('')}</div>
  </section>
  <form class="card" id="f" novalidate>
    <label>${t('name')}<input name="n" maxlength="40" required placeholder="${t('namePh')}"></label>
    <div class="row gap">
      <label class="grow">${t('goal')}<input name="g" type="number" inputmode="decimal" min="1" step="any" required placeholder="1000"></label>
      <label class="grow">${t('deadline')}<input name="d" type="date"></label>
    </div>
    <label>${t('jarAddress')}<input name="o" required placeholder="NQ.. .... ...." autocomplete="off" spellcheck="false"></label>
    <div id="accs" class="chips"></div>
    <small class="hint">${kind === 'vault' ? t('vaultHint') : t('jarAddressHint')}</small>
    <p class="err" id="err"></p>
    <button class="primary" type="submit">${t('create')}</button>
  </form>`
  bindHeader(() => renderCreate(kind), renderHome)
  document.querySelectorAll<HTMLButtonElement>('.kind').forEach(b => (b.onclick = () => renderCreate(b.dataset.k as JarKind)))
  const form = document.getElementById('f') as HTMLFormElement
  const accBox = document.getElementById('accs')!
  const fillAccounts = (list: string[]) => {
    accBox.innerHTML = list.map(a => `<button type="button" class="chip" data-a="${esc(a)}">${avatar(a)} ${esc(shortAddress(a))}</button>`).join('')
    accBox.querySelectorAll<HTMLButtonElement>('.chip').forEach(c => (c.onclick = () => { (form.elements.namedItem('o') as HTMLInputElement).value = formatAddress(c.dataset.a!) }))
  }
  if (accounts.length) fillAccounts(accounts)
  else if (inPay) {
    accBox.innerHTML = `<button type="button" class="chip" id="mine">👛 ${t('useMine')}</button>`
    document.getElementById('mine')!.onclick = async () => fillAccounts(await ensureAccounts())
  }
  form.onsubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    const n = String(fd.get('n') || '').trim()
    const g = Number(fd.get('g'))
    const o = String(fd.get('o') || '')
    const d = String(fd.get('d') || '') || undefined
    const err = document.getElementById('err')!
    if (!n) return void (err.textContent = t('invalidName'))
    if (!(g > 0)) return void (err.textContent = t('invalidGoal'))
    if (!isValidAddress(o)) return void (err.textContent = t('invalidAddress'))
    const jar: Jar = { v: 1, id: newJarId(), n, g: Math.round(g * 100) / 100, o: compactAddress(o), d, e: KINDS.find(x => x.k === kind)!.e, k: kind, net: network }
    saveJar(jar)
    confetti()
    renderJar(jar)
  }
}

let lastPct = -1
async function renderJar(j: Jar) {
  scrollTo(0, 0)
  history.replaceState(null, '', `?j=${encodeJar(j)}`)
  saveJar(j)
  const dl = daysLeft(j.d)
  app.innerHTML = `
  ${header(j.n, renderHome)}
  <section class="hero card">
    <div class="ring" id="ring" style="--p:0"><span class="emoji big">${esc(j.e)}</span></div>
    <div class="nums"><b id="sum">…</b> <span>${t('of')} ${j.g.toLocaleString()} NIM</span></div>
    <small id="usd" class="muted"></small>
    <div class="row center gap meta">
      <span class="pill">${t(`k_${j.k}` as never)}</span>
      ${dl === null ? '' : `<span class="pill">${dl > 0 ? t('daysLeft', { n: dl }) : dl === 0 ? t('dueToday') : t('ended')}</span>`}
      <span class="pill" id="streak" hidden></span>
    </div>
    <small id="perday" class="muted"></small>
    <small class="muted mono">${esc(shortAddress(j.o))} · #${j.id}</small>
  </section>
  <section class="card">
    <h2>${t('contribute')}</h2>
    ${inPay ? '' : `<p class="note">${t('needPay')}</p><a class="primary block" href="${payDeepLink(j)}">${t('openInPay')}</a>`}
    <div class="${inPay ? '' : 'disabled'}">
      <div class="chips">${[10, 50, 100, 500].map(v => `<button class="chip amt" data-v="${v}">${v} NIM</button>`).join('')}</div>
      <label>${t('amount')}<input id="amt" type="number" inputmode="decimal" min="0.00001" step="any" placeholder="100"></label>
      <label>${t('note')}<input id="note" maxlength="50" placeholder="${t('notePh')}"></label>
      <button class="primary" id="pay" ${inPay ? '' : 'disabled'}>${t('confirm')}</button>
      <p class="status" id="status"></p>
    </div>
  </section>
  <div class="row gap"><button class="secondary grow" id="share">🔗 ${t('share')}</button><button class="ghost" id="refresh" aria-label="${t('refresh')}">↻</button></div>
  <section class="card"><h2>${t('contributors')}</h2><ul class="people" id="people"><li class="muted">${t('loading')}</li></ul></section>
  <section class="card"><h2>${t('activity')}</h2><ul class="feed" id="feed"><li class="muted">${t('loading')}</li></ul></section>
  <button class="link danger" id="remove">${t('remove')}</button>`
  bindHeader(() => renderJar(j), renderHome)
  lastPct = -1
  document.querySelectorAll<HTMLButtonElement>('.amt').forEach(b => (b.onclick = () => { (document.getElementById('amt') as HTMLInputElement).value = b.dataset.v! }))
  document.getElementById('share')!.onclick = async () => {
    const url = shareUrl(j)
    const text = t('shareText', { name: j.n })
    try {
      if (navigator.share) await navigator.share({ title: 'GoalJar', text, url })
      else { await navigator.clipboard.writeText(`${text}\n${url}`); toast(t('copied'), 'ok') }
    }
    catch { try { await navigator.clipboard.writeText(url); toast(t('copied'), 'ok') } catch { prompt('URL', url) } }
  }
  document.getElementById('refresh')!.onclick = () => refreshJar(j, true)
  document.getElementById('remove')!.onclick = () => { removeJar(j.id); renderHome() }
  document.getElementById('pay')!.onclick = () => contribute(j)
  refreshJar(j)
}

async function refreshJar(j: Jar, force = false) {
  const people = document.getElementById('people'); const feed = document.getElementById('feed')
  let list: Contribution[]
  try { list = await fetchContributions(j, force) }
  catch {
    if (feed) feed.innerHTML = `<li class="err">${t('rpcError')}</li>`
    if (people) people.innerHTML = ''
    return
  }
  const sum = list.reduce((a, c) => a + c.value, 0)
  const goal = j.g * LUNA_PER_NIM
  const pct = Math.min(100, (sum / goal) * 100)
  const ring = document.getElementById('ring')
  if (!ring) return
  ring.style.setProperty('--p', pct.toFixed(1))
  document.getElementById('sum')!.textContent = `${nim(sum)} NIM`
  const prev = lastPct
  lastPct = pct
  if (prev >= 0) {
    for (const m of [25, 50, 75, 100]) {
      if (prev < m && pct >= m) { confetti(); toast(m === 100 ? t('goalReached') : t('milestone', { p: m }), 'ok') }
    }
  }
  const dl = daysLeft(j.d)
  const perday = document.getElementById('perday')!
  if (pct >= 100) perday.textContent = t('goalReached')
  else if (dl !== null && dl > 0) perday.textContent = t('perDay', { x: ((goal - sum) / LUNA_PER_NIM / dl).toLocaleString(undefined, { maximumFractionDigits: 1 }) })
  const s = streakDays(list)
  const st = document.getElementById('streak')!
  if (s >= 2) { st.hidden = false; st.textContent = t('streak', { n: s }) }
  nimUsd().then((p) => { const u = document.getElementById('usd'); if (p && u) u.textContent = t('usd', { x: ((sum / LUNA_PER_NIM) * p).toFixed(2) }) })

  const by = new Map<string, number>()
  for (const c of list) by.set(compactAddress(c.from), (by.get(compactAddress(c.from)) || 0) + c.value)
  const mine = new Set(accounts.map(compactAddress))
  const ranked = [...by.entries()].sort((a, b) => b[1] - a[1])
  people!.innerHTML = ranked.length === 0 ? `<li class="muted">${t('noActivity')}</li>` : ranked.map(([a, v], i) => `
    <li>${i < 3 ? ['🥇', '🥈', '🥉'][i] : `<span class="rank">${i + 1}</span>`} ${avatar(a)}
      <span class="grow mono">${esc(shortAddress(a))}${mine.has(a) ? ` <em>(${t('you')})</em>` : ''}</span>
      <b>${nim(v)} NIM</b><small class="muted">${((v / Math.max(sum, 1)) * 100).toFixed(0)}%</small></li>`).join('')
  feed!.innerHTML = list.length === 0 ? `<li class="muted">${t('noActivity')}</li>` : list.slice(0, 50).map(c => `
    <li>${avatar(c.from)}<div class="grow"><b>+${nim(c.value)} NIM</b> <small class="muted">${new Date(c.timestamp).toLocaleString()}</small>
      ${c.note ? `<div class="msg">“${esc(c.note)}”</div>` : ''}</div>
      <a href="${explorerTx(j.net, c.hash)}" target="_blank" rel="noopener" class="muted">↗</a></li>`).join('')
}

async function contribute(j: Jar) {
  const status = document.getElementById('status')!
  const amt = Number((document.getElementById('amt') as HTMLInputElement).value)
  const note = (document.getElementById('note') as HTMLInputElement).value
  if (!(amt > 0)) { status.textContent = t('invalidGoal'); return }
  const p = await ensureNimiq()
  if (!p) { status.textContent = t('needPay'); return }
  const accs = accounts.length ? accounts : await ensureAccounts()
  void accs // Nimiq Pay may pay from a different internal address, so self-contributions are allowed (e.g. a personal savings vault)
  const btn = document.getElementById('pay') as HTMLButtonElement
  btn.disabled = true
  const hostNet = getHostNetwork()
  if (hostNet && hostNet !== j.net) j.net = hostNet
  status.className = 'status'
  status.textContent = t('sending')
  try {
    const hash = await p.sendBasicTransactionWithData({
      recipient: formatAddress(j.o),
      value: Math.round(amt * LUNA_PER_NIM),
      data: txTag(j.id, note),
    })
    status.textContent = t('sent')
    let ok = false
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const tx = await fetchTx(j.net, hash)
      if (tx && tx.executionResult !== false && (tx.confirmations ?? 0) >= 1) {
        status.className = 'status ok'
        status.innerHTML = `${t('confirmed')} <a href="${explorerTx(j.net, hash)}" target="_blank" rel="noopener">↗</a>`
        ok = true
        break
      }
    }
    if (!ok) { status.className = 'status err'; status.textContent = t('notConfirmed') }
    await refreshJar(j, true)
  }
  catch (e) {
    if (NimiqProviderError.is(e) && e.type === 'PERMISSION_DENIED') status.textContent = t('cancelled')
    else { status.className = 'status err'; status.textContent = t('failed', { msg: e instanceof Error ? e.message : String(e) }) }
  }
  finally { btn.disabled = false }
}

// ---------------- boot ----------------
const param = new URLSearchParams(location.search).get('j')
const jarFromUrl = param ? decodeJar(param) : null
if (jarFromUrl) renderJar(jarFromUrl)
else renderHome()
if (inPay) ensureNimiq()
