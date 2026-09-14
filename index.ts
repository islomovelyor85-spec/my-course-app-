// Supabase Edge Function: telegram-auth
// Vazifasi: Telegram Mini App'dan kelgan initData'ni tekshirib (HMAC orqali),
// foydalanuvchini users jadvalida topish/yaratish va unga Supabase Auth
// sessiyasini o'rnatish uchun bir martalik kirish havolasi (magic link token) qaytarish.
//
// Deploy: supabase functions deploy telegram-auth
// Kerakli secretlar (supabase secrets set orqali o'rnating):
//   TELEGRAM_BOT_TOKEN
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSha256(key: ArrayBuffer, message: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message))
}

// Telegram Mini App initData tekshiruvi (rasmiy algoritm):
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
async function verifyTelegramInitData(initData: string) {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckArr: string[] = []
  for (const [key, value] of [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    dataCheckArr.push(`${key}=${value}`)
  }
  const dataCheckString = dataCheckArr.join('\n')

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), BOT_TOKEN)
  const computedHash = toHex(await hmacSha256(secretKey, dataCheckString))

  if (computedHash !== hash) return null

  const userRaw = params.get('user')
  if (!userRaw) return null
  return JSON.parse(userRaw)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Faqat POST so‘rovlar qabul qilinadi' }), { status: 405 })
  }

  try {
    const { initData } = await req.json()
    if (!initData) {
      return new Response(JSON.stringify({ error: 'initData yuborilmadi' }), { status: 400 })
    }

    const tgUser = await verifyTelegramInitData(initData)
    if (!tgUser) {
      return new Response(JSON.stringify({ error: 'initData tasdiqlanmadi (imzo mos emas)' }), { status: 401 })
    }

    const syntheticEmail = `tg${tgUser.id}@xattot.local`

    // users jadvalida shu telegram_id bor-yo'qligini tekshirish
    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('telegram_id', tgUser.id)
      .maybeSingle()

    let userId = existing?.id

    if (!userId) {
      // Supabase Auth'da yangi foydalanuvchi yaratish (tasodifiy parol bilan,
      // parolning o'zi hech qachon frontendga chiqmaydi — faqat magic link ishlatiladi)
      const randomPassword = crypto.randomUUID()
      const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
        email: syntheticEmail,
        password: randomPassword,
        email_confirm: true
      })
      if (authErr) throw authErr
      userId = authUser.user.id

      const { error: insertErr } = await admin.from('users').insert({
        id: userId,
        telegram_id: tgUser.id,
        full_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi',
        avatar_url: tgUser.photo_url || null,
        role: 'student'
      })
      if (insertErr) throw insertErr
    } else {
      await admin.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', userId)
    }

    // Bir martalik kirish (magic link) tokeni generatsiya qilish — frontend shu
    // token orqali supabase.auth.verifyOtp({token_hash, type:'magiclink'}) chaqiradi
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: syntheticEmail
    })
    if (linkErr) throw linkErr

    return new Response(
      JSON.stringify({
        token_hash: linkData.properties.hashed_token,
        email: syntheticEmail
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
