'use client'

import { useSupabase } from '@/lib/supabase/provider'

export const useAuth = () => {
  const { supabase, user, loading } = useSupabase()

  console.log('🔥 USE AUTH HOOK:')
  console.log('  Has User:', !!user)
  console.log('  User ID:', user?.id || 'null')
  console.log('  User Email:', user?.email || 'null')
  console.log('  Loading:', loading)

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

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }
}