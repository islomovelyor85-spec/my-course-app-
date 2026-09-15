import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // .env fayl to'ldirilmagan bo'lsa, ilova ishga tushishi bilanoq bilib olish uchun
  console.error(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY topilmadi. .env faylni tekshiring (.env.example asosida).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})
