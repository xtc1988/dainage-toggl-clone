'use client'

import { useSupabase } from '@/lib/supabase/provider'
import { timerLogger } from '@/lib/logger'

export const useAuth = () => {
  const { supabase, user, loading, setDemoUser } = useSupabase()

  timerLogger.debug('useAuth hook called', {
    hasUser: !!user,
    userId: user?.id || 'null',
    userEmail: user?.email || 'null',
    loading
  })

  const signInWithGoogle = async () => {
    console.log('🔥 signInWithGoogle called')
    const redirectUrl = `${window.location.origin}/auth/callback`
    console.log('🔥 Redirect URL:', redirectUrl)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      console.log('🔥 Google sign in error:', error)
      throw error
    }
    console.log('🔥 Google sign in initiated successfully')
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  const signInAsDemo = async () => {
    timerLogger.info('signInAsDemo called - using demo mode (no auth required)')
    
    try {
      // デモモード: 認証をスキップして既存のデモユーザーを直接使用
      const demoUserId = 'a2e49074-96ff-490e-8e9d-ccac47707f83'
      const demoEmail = 'demo@dainage.app'
      
      // デモユーザーの存在を確認
      const { data: demoUser, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', demoUserId)
        .single()
      
      if (userError || !demoUser) {
        timerLogger.error('Demo user not found in database', userError)
        throw new Error('Demo user not found. Please run database setup.')
      }
      
      timerLogger.info('Demo mode activated', { 
        userId: demoUser.id, 
        email: demoUser.email,
        name: demoUser.name
      })
      
      // 認証なしでデモユーザー情報を返す
      const demoUserData = {
        id: demoUser.id,
        email: demoUser.email,
        user_metadata: { name: demoUser.name },
        aud: 'authenticated',
        role: 'authenticated'
      } as any
      
      // プロバイダーにデモユーザーを設定
      setDemoUser(demoUserData)
      
      return {
        user: demoUserData,
        session: null // セッションは不要
      }
    } catch (error) {
      timerLogger.error('signInAsDemo failed', error as Error)
      throw error
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signInAsDemo,
    signOut,
  }
}