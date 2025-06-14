'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase/provider'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const { supabase, user: supabaseUser, loading: supabaseLoading } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(supabaseUser)
    setLoading(supabaseLoading)
  }, [supabaseUser, supabaseLoading])

  const signInWithGoogle = async () => {
    // 認証成功後はホームページ（ダッシュボード）にリダイレクト
    const redirectUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || ''
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
    
    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }
}