import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthResponse {
  user: User | null
  error: Error | null
}

// Sign up com email e senha
export async function signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    })

    if (error) throw error

    if (data.user) {
      // Verificar se o usuário já existe na tabela users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      // Se não existe, criar registro na tabela users
      if (checkError && checkError.code === 'PGRST116') {
        // @ts-expect-error - Type conflict with generated schema
        const { error: dbError } = await supabase.from('users').insert({
          nome: name || email.split('@')[0],
          email: email,
          tipo: 'pessoa',
          ativo: true,
          cor: '#007aff',
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
        })

        if (dbError) console.warn('Aviso ao criar usuário no DB:', dbError)
      }
    }

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
          }
        : null,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      error: error as Error,
    }
  }
}

// Login com email e senha
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
          }
        : null,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      error: error as Error,
    }
  }
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Pegar usuário atual
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Pegar sessão
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// Reset de senha
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) throw error
}

// Atualizar senha
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}
