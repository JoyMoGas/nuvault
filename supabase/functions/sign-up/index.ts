// supabase/functions/sign-up/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS preflight request.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { email, password, username } = await req.json()

    // Primero, revisa si el username ya existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      // ✅ CAMBIO 1: Mensaje explícito para el username
      return new Response(JSON.stringify({ error: 'That username is already in use.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Si el username está libre, procede a crear el usuario en Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { username: username },
    })

    if (error) {
      // ✅ CAMBIO 2: Mensaje vago para el email si ya está registrado
      if (error.message.includes('User already registered')) {
        return new Response(JSON.stringify({ error: 'Please try with a different email address.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        })
      }
      // Para cualquier otro error, devuelve el mensaje original
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Si todo fue exitoso, devuelve el usuario creado
    return new Response(JSON.stringify({ user }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})