'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './client'
import type { User } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: typeof supabase
  user: User | null
  loading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Create or update user profile when signing in
        const { error } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!,
            avatar_url: session.user.user_metadata?.avatar_url,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
          
        if (error) {
          console.error('Error updating user profile:', error)
        }
        
        // Redirect to home page (which shows Dashboard for authenticated users)
        router.push('/')
      }

      if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <Context.Provider value={{ supabase, user, loading }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}