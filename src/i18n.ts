import { getHostLanguage } from '@nimiq/mini-app-sdk'

export type Lang = 'en' | 'zh-Hant' | 'zh-Hans' | 'es' | 'de'
export const LANGS: { code: Lang, label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh-Hant', label: '繁體中文' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
]

const en = {
  tagline: 'Save together for the things that matter.',
  myJars: 'My jars',
  noJars: 'No jars yet. Create one for a trip, a group gift or your own rainy-day fund.',
  createJar: 'Create a jar',
  openLink: 'Paste a jar link',
  openLinkHint: 'Paste a GoalJar link someone shared with you',
  open: 'Open',
  back: 'Back',
  template: 'What are you saving for?',
  k_gift: 'Group gift', k_trip: 'Trip fund', k_redpacket: 'Red packet pool', k_vault: 'Personal vault', k_group: 'Shared goal',
  kd_gift: 'Friends chip in for a birthday or farewell present.',
  kd_trip: 'Everyone saves toward the same trip.',
  kd_redpacket: 'Collect a festive red-packet pool for New Year.',
  kd_vault: 'Move NIM into a second address you own and watch it grow.',
  kd_group: 'Club dues, team dinner, anything shared.',
  name: 'Jar name', namePh: 'e.g. Tokyo trip 2027',
  goal: 'Goal (NIM)', deadline: 'Deadline (optional)',
  jarAddress: 'Jar address (where contributions arrive)',
  jarAddressHint: 'Pick one of your Nimiq Pay addresses or paste another address you control.',
  vaultHint: 'Tip: use a second address you own as the vault. Nimiq does not allow sending to the same address you send from.',
  useMine: 'Use my address',
  invalidAddress: 'This is not a valid Nimiq address.',
  invalidGoal: 'Enter a goal above 0.',
  invalidName: 'Give your jar a name.',
  create: 'Create jar',
  raised: 'raised', of: 'of', goalReached: 'Goal reached! 🎉',
  daysLeft: '{n} days left', dueToday: 'Due today', ended: 'Deadline passed',
  perDay: 'Save ≈ {x} NIM/day to make it',
  contributors: 'Contributors', activity: 'Activity', noActivity: 'No contributions yet. Be the first!',
  contribute: 'Add NIM', note: 'Message (optional, public on-chain)', notePh: 'Happy birthday!',
  amount: 'Amount (NIM)', confirm: 'Contribute',
  share: 'Share jar', copied: 'Link copied!', shareText: 'Join my GoalJar "{name}" on Nimiq Pay',
  refresh: 'Refresh', remove: 'Remove from my list',
  sending: 'Waiting for your approval in Nimiq Pay…',
  sent: 'Sent! Waiting for confirmation…', notConfirmed: 'Not confirmed yet. Check your NIM balance (and network) in Nimiq Pay, then try again.', confirmed: 'Confirmed on-chain ✅',
  cancelled: 'Payment cancelled. Nothing was sent.',
  failed: 'Something went wrong: {msg}',
  needPay: 'Open this jar inside Nimiq Pay to contribute.',
  openInPay: 'Open in Nimiq Pay',
  readOnly: 'Read-only preview',
  loading: 'Loading…', rpcError: 'Could not load on-chain data. Pull to retry.',
  you: 'you', anon: 'Anonymous',
  testnet: 'Testnet',
  how: 'How it works',
  how1: 'A jar is just a Nimiq address plus a goal. No custody, no smart contract, no sign-up.',
  how2: 'Every contribution is a normal NIM payment tagged with the jar code, so progress is read straight from the blockchain.',
  how3: 'Share the link. Friends open it in Nimiq Pay and chip in with one tap.',
  milestone: '{p}% milestone!',
  self: 'You cannot contribute from the jar address itself. Switch to another account in Nimiq Pay.',
  usd: '≈ ${x}',
  streak: '{n}-day saving streak 🔥',
}
type Dict = typeof en

const zhHant: Dict = {
  tagline: '一起存錢，存給重要的事。',
  myJars: '我的存錢罐', noJars: '還沒有存錢罐。為旅行、團體禮物或自己的緊急預備金建立一個吧。',
  createJar: '建立存錢罐', openLink: '貼上存錢罐連結', openLinkHint: '貼上朋友分享給你的 GoalJar 連結', open: '開啟', back: '返回',
  template: '你想存錢做什麼？',
  k_gift: '團體禮物', k_trip: '旅遊基金', k_redpacket: '紅包池', k_vault: '個人小金庫', k_group: '共同目標',
  kd_gift: '朋友一起湊錢買生日或送別禮物。', kd_trip: '大家一起為同一趟旅行存錢。', kd_redpacket: '過年一起湊一個紅包池。',
  kd_vault: '把 NIM 轉到你自己的第二個地址，看著它慢慢長大。', kd_group: '社團會費、聚餐基金，任何共同開銷。',
  name: '存錢罐名稱', namePh: '例如：2027 東京旅行', goal: '目標（NIM）', deadline: '截止日（選填）',
  jarAddress: '存錢罐地址（款項匯入處）', jarAddressHint: '選擇你的 Nimiq Pay 地址，或貼上你能控制的其他地址。',
  vaultHint: '提示：用你自己的第二個地址當小金庫。Nimiq 不允許轉帳給同一個寄出地址。',
  useMine: '使用我的地址', invalidAddress: '這不是有效的 Nimiq 地址。', invalidGoal: '請輸入大於 0 的目標。', invalidName: '請替存錢罐取個名字。',
  create: '建立', raised: '已存', of: '/', goalReached: '達成目標！🎉',
  daysLeft: '剩 {n} 天', dueToday: '今天截止', ended: '已過截止日', perDay: '每天約存 {x} NIM 就能達標',
  contributors: '參與者', activity: '紀錄', noActivity: '還沒有人存入，當第一個吧！',
  contribute: '存入 NIM', note: '留言（選填，會公開上鏈）', notePh: '生日快樂！', amount: '金額（NIM）', confirm: '存入',
  share: '分享存錢罐', copied: '已複製連結！', shareText: '一起加入我在 Nimiq Pay 的存錢罐「{name}」',
  refresh: '重新整理', remove: '從清單移除',
  sending: '請在 Nimiq Pay 確認付款…', sent: '已送出！等待確認中…', notConfirmed: '尚未確認，請檢查 Nimiq Pay 的 NIM 餘額與網路後再試。', confirmed: '已上鏈確認 ✅',
  cancelled: '已取消付款，沒有任何款項送出。', failed: '發生錯誤：{msg}',
  needPay: '請在 Nimiq Pay 中開啟此存錢罐才能存入。', openInPay: '在 Nimiq Pay 開啟', readOnly: '唯讀預覽',
  loading: '載入中…', rpcError: '無法讀取鏈上資料，請重試。', you: '你', anon: '匿名', testnet: '測試網',
  how: '運作方式',
  how1: '存錢罐就是一個 Nimiq 地址加一個目標。不託管、沒有智能合約、不用註冊。',
  how2: '每筆存入都是一般的 NIM 轉帳，附上存錢罐代碼，進度直接從區塊鏈讀取。',
  how3: '分享連結，朋友在 Nimiq Pay 打開，一鍵就能存入。',
  milestone: '達成 {p}%！', self: '不能從存錢罐地址本身存入，請在 Nimiq Pay 切換到其他帳戶。', usd: '≈ ${x}', streak: '連續存錢 {n} 天 🔥',
}

const zhHans: Dict = {
  ...zhHant,
  tagline: '一起存钱，存给重要的事。', myJars: '我的存钱罐', noJars: '还没有存钱罐。为旅行、团体礼物或自己的应急金建立一个吧。',
  createJar: '创建存钱罐', openLink: '粘贴存钱罐链接', openLinkHint: '粘贴朋友分享给你的 GoalJar 链接', open: '打开', back: '返回',
  template: '你想存钱做什么？', k_gift: '团体礼物', k_trip: '旅游基金', k_redpacket: '红包池', k_vault: '个人小金库', k_group: '共同目标',
  kd_gift: '朋友一起凑钱买生日或送别礼物。', kd_trip: '大家一起为同一趟旅行存钱。', kd_redpacket: '过年一起凑一个红包池。',
  kd_vault: '把 NIM 转到你自己的第二个地址，看着它慢慢长大。', kd_group: '社团会费、聚餐基金，任何共同开销。',
  name: '存钱罐名称', namePh: '例如：2027 东京旅行', deadline: '截止日（选填）',
  jarAddress: '存钱罐地址（款项汇入处）', jarAddressHint: '选择你的 Nimiq Pay 地址，或粘贴你能控制的其他地址。',
  vaultHint: '提示：用你自己的第二个地址当小金库。Nimiq 不允许转账给同一个发送地址。',
  useMine: '使用我的地址', invalidAddress: '这不是有效的 Nimiq 地址。', invalidName: '请给存钱罐取个名字。', create: '创建',
  perDay: '每天约存 {x} NIM 就能达标', contributors: '参与者', activity: '记录', noActivity: '还没有人存入，当第一个吧！',
  note: '留言（选填，会公开上链）', amount: '金额（NIM）', share: '分享存钱罐', copied: '已复制链接！', shareText: '一起加入我在 Nimiq Pay 的存钱罐「{name}」',
  refresh: '刷新', remove: '从列表移除', sending: '请在 Nimiq Pay 确认付款…', sent: '已发送！等待确认中…', notConfirmed: '尚未确认，请检查 Nimiq Pay 里的 NIM 余额和网络后再试。', confirmed: '已上链确认 ✅',
  cancelled: '已取消付款，没有任何款项发出。', failed: '发生错误：{msg}', needPay: '请在 Nimiq Pay 中打开此存钱罐才能存入。', openInPay: '在 Nimiq Pay 打开',
  readOnly: '只读预览', loading: '加载中…', rpcError: '无法读取链上数据，请重试。', testnet: '测试网', how: '运作方式',
  how1: '存钱罐就是一个 Nimiq 地址加一个目标。不托管、没有智能合约、不用注册。',
  how2: '每笔存入都是普通的 NIM 转账，附上存钱罐代码，进度直接从区块链读取。',
  how3: '分享链接，朋友在 Nimiq Pay 打开，一键就能存入。', self: '不能从存钱罐地址本身存入，请在 Nimiq Pay 切换到其他账户。', streak: '连续存钱 {n} 天 🔥',
}

const es: Dict = {
  ...en,
  tagline: 'Ahorren juntos para lo que importa.', myJars: 'Mis huchas',
  noJars: 'Aún no tienes huchas. Crea una para un viaje, un regalo de grupo o tu fondo de emergencia.',
  createJar: 'Crear hucha', openLink: 'Pegar enlace', openLinkHint: 'Pega un enlace de GoalJar que te compartieron', open: 'Abrir', back: 'Atrás',
  template: '¿Para qué ahorras?', k_gift: 'Regalo de grupo', k_trip: 'Fondo de viaje', k_redpacket: 'Sobre rojo', k_vault: 'Bóveda personal', k_group: 'Meta compartida',
  kd_gift: 'Amigos aportan para un regalo.', kd_trip: 'Todos ahorran para el mismo viaje.', kd_redpacket: 'Un fondo festivo de sobres rojos.',
  kd_vault: 'Mueve NIM a otra dirección tuya y mira cómo crece.', kd_group: 'Cuotas del club, cena de equipo, lo que sea.',
  name: 'Nombre', namePh: 'p. ej. Viaje a Tokio', goal: 'Meta (NIM)', deadline: 'Fecha límite (opcional)',
  jarAddress: 'Dirección de la hucha', jarAddressHint: 'Elige una dirección de Nimiq Pay o pega otra que controles.',
  useMine: 'Usar mi dirección', invalidAddress: 'Dirección Nimiq no válida.', invalidGoal: 'Introduce una meta mayor que 0.', invalidName: 'Ponle un nombre.',
  create: 'Crear', raised: 'ahorrado', of: 'de', goalReached: '¡Meta alcanzada! 🎉', daysLeft: 'Quedan {n} días', dueToday: 'Vence hoy', ended: 'Plazo vencido',
  perDay: 'Ahorra ≈ {x} NIM/día para lograrlo', contributors: 'Aportantes', activity: 'Actividad', noActivity: 'Aún no hay aportes. ¡Sé el primero!',
  contribute: 'Añadir NIM', note: 'Mensaje (opcional, público)', notePh: '¡Feliz cumpleaños!', amount: 'Cantidad (NIM)', confirm: 'Aportar',
  share: 'Compartir', copied: '¡Enlace copiado!', shareText: 'Únete a mi GoalJar "{name}" en Nimiq Pay', refresh: 'Actualizar', remove: 'Quitar de mi lista',
  sending: 'Esperando tu aprobación en Nimiq Pay…', sent: '¡Enviado! Esperando confirmación…', confirmed: 'Confirmado en cadena ✅',
  cancelled: 'Pago cancelado.', failed: 'Algo salió mal: {msg}', needPay: 'Abre esta hucha en Nimiq Pay para aportar.', openInPay: 'Abrir en Nimiq Pay',
  readOnly: 'Vista de solo lectura', loading: 'Cargando…', how: 'Cómo funciona',
}

const de: Dict = {
  ...en,
  tagline: 'Gemeinsam sparen für das, was zählt.', myJars: 'Meine Spardosen',
  noJars: 'Noch keine Spardosen. Erstelle eine für eine Reise, ein Gruppengeschenk oder deinen Notgroschen.',
  createJar: 'Spardose erstellen', openLink: 'Link einfügen', open: 'Öffnen', back: 'Zurück',
  template: 'Wofür sparst du?', k_gift: 'Gruppengeschenk', k_trip: 'Reisekasse', k_redpacket: 'Rote-Umschlag-Topf', k_vault: 'Persönlicher Tresor', k_group: 'Gemeinsames Ziel',
  name: 'Name', namePh: 'z. B. Tokio-Reise', goal: 'Ziel (NIM)', deadline: 'Frist (optional)',
  jarAddress: 'Adresse der Spardose', useMine: 'Meine Adresse', invalidAddress: 'Keine gültige Nimiq-Adresse.',
  create: 'Erstellen', raised: 'gespart', of: 'von', goalReached: 'Ziel erreicht! 🎉', daysLeft: 'Noch {n} Tage',
  contributors: 'Beitragende', activity: 'Aktivität', contribute: 'NIM einzahlen', amount: 'Betrag (NIM)', confirm: 'Einzahlen',
  share: 'Teilen', copied: 'Link kopiert!', refresh: 'Aktualisieren', openInPay: 'In Nimiq Pay öffnen', loading: 'Lädt…', how: "So funktioniert's",
}

const DICTS: Record<Lang, Dict> = { 'en': en, 'zh-Hant': zhHant, 'zh-Hans': zhHans, es, de }

export function detectLang(): Lang {
  const saved = localStorage.getItem('gj.lang') as Lang | null
  if (saved && saved in DICTS) return saved
  const host = getHostLanguage() || navigator.language || 'en'
  const l = host.toLowerCase()
  if (l.startsWith('zh')) return /cn|sg|hans/.test(l) ? 'zh-Hans' : 'zh-Hant'
  if (l.startsWith('es')) return 'es'
  if (l.startsWith('de')) return 'de'
  return 'en'
}

let current: Lang = 'en'
export function setLang(l: Lang) { current = l; localStorage.setItem('gj.lang', l); document.documentElement.lang = l }
export function getLang(): Lang { return current }
export function t(key: keyof Dict, vars: Record<string, string | number> = {}): string {
  let s = (DICTS[current] as Dict)[key] ?? en[key]
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
  return s
}
