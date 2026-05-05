import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] 获取会话失败:', error.message)
        setError(error.message)
      } else {
        console.log('[Auth] 会话状态:', session ? '已登录 (' + session.user.email + ')' : '未登录')
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth] 状态变化:', event, session ? '有会话 (' + session.user.email + ')' : '无会话')
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? new Error(error.message) : undefined }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : undefined }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'google') => {
    console.log('[Auth] 正在启动 OAuth:', provider)
    console.log('[Auth] 当前页面:', window.location.origin)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    })

    if (error) {
      console.error('[Auth] OAuth 启动失败:', error.message)
      return { error: new Error(error.message) }
    }

    if (data?.url) {
      console.log('[Auth] OAuth URL:', data.url)
      // 正常情况下 Supabase 会自动跳转
      // 如果没有自动跳转，手动跳转
      window.location.href = data.url
    } else {
      console.error('[Auth] 没有返回 OAuth URL')
      return { error: new Error('没有返回授权链接，请检查 Supabase Google Provider 配置') }
    }

    return { error: undefined }
  }, [])

  return { user, session, loading, error, signUp, signIn, signOut, signInWithOAuth }
}
