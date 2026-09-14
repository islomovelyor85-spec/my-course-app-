// Telegram WebApp SDK bilan ishlash uchun yordamchi funksiyalar.
// index.html'ga <script src="https://telegram.org/js/telegram-web-app.js"></script>
// ulangan, shuning uchun window.Telegram.WebApp global obyekt sifatida mavjud.

export function getTelegramWebApp() {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

export function initTelegramApp() {
  const tg = getTelegramWebApp()
  if (!tg) return null
  tg.ready()
  tg.expand()
  // Telegram interfeysining o'z rang sxemasini platforma dizayniga moslashtirish
  try {
    tg.setHeaderColor('#231F14')
    tg.setBackgroundColor('#FFFFFF')
  } catch (e) {
    // Ba'zi klient versiyalarida bu metodlar bo'lmasligi mumkin — muammo emas
  }
  return tg
}

// Telegram initData — bu foydalanuvchi ma'lumotini o'z ichiga olgan, HMAC bilan
// imzolangan qator. Uni FAQAT backend (Edge Function) tomonida, bot token bilan
// tekshirish xavfsiz hisoblanadi. Frontend faqat shu qatorni backendga yuboradi.
export function getTelegramInitData() {
  const tg = getTelegramWebApp()
  return tg?.initData || null
}

export function getTelegramUserPreview() {
  const tg = getTelegramWebApp()
  return tg?.initDataUnsafe?.user || null
}

export function isRunningInTelegram() {
  return !!getTelegramInitData()
}
