import { supabase } from '../supabaseClient';

export const api = {
  // Autenticação: Fazer Login
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('E-mail ou senha incorretos.');
    return data;
  },

  // Autenticação: Criar Usuário (Auth + Perfil Público)
  async registerUser({ email, password, fullName, phone, institution, interests, howKnew, userProfile }) {
    // 1. Cadastro no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw authError;

    if (authData.user) {
      // 2. Cadastro na tabela pública correspondente ao seu banco de dados
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email: email,
          full_name: fullName,
          phone: phone,
          institution: institution,
          interests: interests,
          how_knew_steam_lab: howKnew,
          user_profile: userProfile,
          is_admin: false // Travado por segurança
        }
      ]);

      if (profileError) throw profileError;
    }
    return authData;
  },

  // Atividades: Registrar Check-in
  async createActivity(userId, activityType) {
    const { data, error } = await supabase.from('activities').insert([
      {
        user_id: userId,
        activity_type: activityType
      }
    ]);
    if (error) throw error;
    return data;
  },

  // Autenticação: Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};