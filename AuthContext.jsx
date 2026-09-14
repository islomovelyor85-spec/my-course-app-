import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getTelegramInitData, isRunningInTelegram } from '../lib/telegram'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const loadProfile = useCallback(async (userId) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
    if (error) {
      console.error('[Auth] Profil topilmadi:', error.message)
      setProfile(null)
      return
    }
    setProfile(data)
    // faollikni yangilab qo'yamiz (jim, xato bo'lsa e'tiborsiz qoldiramiz)
    supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', userId).then(() => {})
  }, [])

  // Telegram Mini App ichida ochilgan bo'lsa — avtomatik kirish
  const loginWithTelegram = useCallback(async () => {
    const initData = getTelegramInitData()
    if (!initData) return false

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Telegram orqali kirishda xatolik')

      const { error } = await supabase.auth.verifyOtp({
        token_hash: json.token_hash,
        type: 'magiclink'
      })
      if (error) throw error
      return true
    } catch (err) {
      console.error('[Auth] Telegram login xato:', err.message)
      setAuthError(err.message)
      return false
    }
  }, [])

  const registerWithPhone = useCallback(async ({ fullName, phone, password }) => {
    setAuthError(null)
    const syntheticEmail = `${phone.replace(/[^0-9]/g, '')}@xattot.local`
    const { data, error } = await supabase.auth.signUp({
      email: syntheticEmail,
      password
    })
    if (error) {
      setAuthError(error.message)
      throw error
    }
    if (data.user) {
      const { error: profileErr } = await supabase.from('users').insert({
        id: data.user.id,
        full_name: fullName,
        phone,
        role: 'student'
      })
      if (profileErr) {
        setAuthError(profileErr.message)
        throw profileErr
      }
    }
    return data
  }, [])

  const loginWithPhone = useCallback(async ({ phone, password }) => {
    setAuthError(null)
    const syntheticEmail = `${phone.replace(/[^0-9]/g, '')}@xattot.local`
    const { data, error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password
    })
    if (error) {
      setAuthError('Telefon raqam yoki parol noto‘g‘ri')
      throw error
    }
    return data
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }, [])

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      if (data.session) {
        setSession(data.session)
        await loadProfile(data.session.user.id)
      } else if (isRunningInTelegram()) {
        const ok = await loginWithTelegram()
        if (ok) {
          const { data: sessData } = await supabase.auth.getSession()
          if (sessData.session) {
            setSession(sessData.session)
            await loadProfile(sessData.session.user.id)
          }
        }
      }
      if (mounted) setLoading(false)
    }
    bootstrap()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [loadProfile, loginWithTelegram])

  const value = {
    session,
    profile,
    loading,
    authError,
    isAuthenticated: !!session,
    isAdmin: profile?.role === 'admin',
    registerWithPhone,
    loginWithPhone,
    loginWithTelegram,
    logout,
    refreshProfile: () => session && loadProfile(session.user.id)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak')
  return ctx
}
