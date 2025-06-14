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
      console.log('Auth state change:', { event, user: session?.user?.email })
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Try to create or update user profile, but don't fail if table doesn't exist
        try {
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
            console.warn('Could not update user profile (table may not exist):', error)
          }
        } catch (error) {
          console.warn('User table may not exist yet:', error)
        }
        
        // Redirect to home page (which shows Dashboard for authenticated users)
        router.push('/')
      }

      if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
      }
    }
    
    getInitialSession()

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