'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: any
  user: User | null
  loading: boolean
  setDemoUser: (demoUser: User) => void
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  // デモユーザーを設定する関数
  const setDemoUser = (demoUser: User) => {
    console.log('🎯 Setting demo user:', demoUser.email)
    setUser(demoUser)
    setLoading(false)
  }

  useEffect(() => {
    console.log('🔥 SupabaseProvider useEffect started')
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔥 AUTH STATE CHANGE:')
      console.log('  Event:', event)
      console.log('  Has Session:', !!session)
      console.log('  User ID:', session?.user?.id || 'null')
      console.log('  User Email:', session?.user?.email || 'null')
      console.log('  Current Path:', typeof window !== 'undefined' ? window.location.pathname : 'server')
      
      setUser(session?.user ?? null)
      setLoading(false)

      // Don't redirect here - let page components handle routing

      if (event === 'SIGNED_OUT') {
        console.log('🔥 SIGNED_OUT event - redirecting to home')
        router.push('/')
      }
    })

    // Get initial session
    console.log('🔥 Getting initial session...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔥 INITIAL SESSION RESULT:')
      console.log('  Has Session:', !!session)
      console.log('  User ID:', session?.user?.id || 'null')
      console.log('  User Email:', session?.user?.email || 'null')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      console.log('🔥 SupabaseProvider cleanup - unsubscribing')
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Context.Provider value={{ supabase, user, loading, setDemoUser }}>
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