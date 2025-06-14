'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { SupabaseProvider } from '@/lib/supabase/provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </Provider>
  )
}