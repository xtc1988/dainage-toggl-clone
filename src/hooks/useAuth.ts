'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase/provider'
import type { User } from '@supabase/auth-helpers-nextjs'

export function useAuth() {
  const { supabase, user: supabaseUser, loading: supabaseLoading } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(supabaseUser)
    setLoading(supabaseLoading)
  }, [supabaseUser, supabaseLoading])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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