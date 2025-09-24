import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://tncjpgvqpundohdlgugs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuY2pwZ3ZxcHVuZG9oZGxndWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODUxODEsImV4cCI6MjA3MjM2MTE4MX0.Gthk13z80_uHUNlmpHltEAWasciMVRumG8fLHwOoxt0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Auto-refresh de sesión cuando la app está activa
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}
