import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import logoImg from './assets/maker-usp-logo.jpeg';
import './App.css';

function App() {
  // Estados Principais de Autenticação
  const [session, setSession] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  
  // Estados das Telas: 'LOGIN' | 'REGISTER' | 'ACTIVITY' | 'SUCCESS'
  const [step, setStep] = useState('LOGIN');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'error' | 'success'

  // Dados do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [howKnew, setHowKnew] = useState('');

  const interestsOptions = ['Educação', 'STEAM', 'Impressão 3D', 'Comunidade Caninos', 'Espaço Maker'];

  // Verifica se o usuário já está logado ao abrir a página
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setStep('ACTIVITY');
      setLoadingApp(false);
    });

    // Fica escutando mudanças (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setStep('ACTIVITY');
      else setStep('LOGIN');
    });

    return () => subscription.unsubscribe();
  }, []);

  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // 1. Fazer Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      showMessage('E-mail ou senha incorretos.');
    }
    setLoading(false);
  };

  // 2. Criar Conta (Registrar Autenticação + Salvar Perfil)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // A) Cria o usuário no sistema de autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      showMessage(`Erro ao criar conta: ${authError.message}`);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // B) Salva os dados complementares na nossa tabela pública
      // DENTRO DA FUNÇÃO handleRegister:
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user.id, 
          email: email,
          full_name: fullName,
          phone: phone,
          institution: organization,
          interests: selectedInterests,
          how_knew_steam_lab: howKnew
        }
      ]);

      if (profileError) {
        showMessage(`Conta criada, mas houve erro ao salvar o perfil: ${profileError.message}`);
      } else {
        showMessage('Conta criada com sucesso!', 'success');
        // O onAuthStateChange vai jogar o usuário para 'ACTIVITY' automaticamente
      }
    }
    setLoading(false);
  };

  // 3. Registrar Atividade
  const handleSelectActivity = async (activityType) => {
    setLoading(true);
    const { error } = await supabase.from('activities').insert([
      {
        user_id: session.user.id,
        activity_type: activityType
      }
    ]);

    if (error) {
      showMessage(`Erro ao registrar: ${error.message}`);
    } else {
      setStep('SUCCESS');
    }
    setLoading(false);
  };

  // 4. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStep('LOGIN');
    setEmail('');
    setPassword('');
  };

  const handleInterestChange = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  if (loadingApp) return <div className="container"><p style={{textAlign: 'center'}}>A carregar...</p></div>;

  return (
    <div className="container">
      <header className="header">
        <img src={logoImg} alt="Logo Maker USP" className="logo" />
      </header>

      {message.text && (
        <p className="error-message" style={{ backgroundColor: message.type === 'success' ? '#dcfce7' : '#fff5f5', color: message.type === 'success' ? '#166534' : '#e53e3e', borderColor: message.type === 'success' ? '#bbf7d0' : '#fed7d7' }}>
          {message.text}
        </p>
      )}

      {/* TELA DE LOGIN */}
      {!session && step === 'LOGIN' && (
        <form onSubmit={handleLogin} className="form-card">
          <h2>Login</h2>
          <p>Faça login para realizar o seu check-in.</p>
          
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit" disabled={loading}>{loading ? 'A entrar...' : 'Entrar'}</button>
          
          {/* DENTRO DA TELA DE LOGIN (Abaixo do botão Entrar) */}
          <div className="toggle-container">
            <p>Ainda não tem conta?</p>
            <button 
              type="button" 
              onClick={() => setStep('REGISTER')} 
              className="btn-secondary"
            >
              Criar Conta
            </button>
          </div>
        </form>
      )}

      {/* TELA DE REGISTRO */}
      {!session && step === 'REGISTER' && (
        <form onSubmit={handleRegister} className="form-card">
          <h2>Criar Conta</h2>
          <p>Preencha os dados abaixo para se registar no Maker USP.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
            </div>
          </div>

          <label>Nome Completo</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

          <label>Telefone / WhatsApp</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />

          <label>Instituição / Organização</label>
          <input type="text" value={organization} placeholder="Ex: Poli-USP, FAU, Externa..." onChange={(e) => setOrganization(e.target.value)} required />

          <label>Como conheceu o espaço?</label>
          <select value={howKnew} onChange={(e) => setHowKnew(e.target.value)} required>
            <option value="">Selecione...</option>
            <option value="Rede Social">Rede Social</option>
            <option value="Professor">Professor</option>
            <option value="Colega">Colega</option>
            <option value="Empresa">Empresa</option>
            <option value="Outros">Outros</option>
          </select>

          <label>Áreas de Interesse</label>
          <div className="checkbox-group">
            {interestsOptions.map(interest => (
              <label key={interest} className="checkbox-label">
                <input type="checkbox" checked={selectedInterests.includes(interest)} onChange={() => handleInterestChange(interest)} />
                {interest}
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading}>{loading ? 'A registar...' : 'Concluir Cadastro'}</button>
          
          <button 
            type="button" 
            onClick={() => setStep('LOGIN')} 
            className="btn-secondary link-style"
          >
            ← Voltar para o Login
          </button>
        </form>
      )}

      {/* TELA DE ATIVIDADES (Logado) */}
      {session && step === 'ACTIVITY' && (
        <div className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2>Bem-vindo(a)! 👋</h2>
              <p>O que vai realizar hoje no Maker USP?</p>
            </div>
            <button onClick={handleLogout} style={{ width: 'auto', margin: 0, padding: '8px 12px', fontSize: '0.8rem', background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }}>Sair</button>
          </div>
          
          <div className="grid-buttons">
            <button onClick={() => handleSelectActivity('Impressão 3D')} disabled={loading}><span className="icon">🖨️</span> Impressão 3D</button>
            <button onClick={() => handleSelectActivity('Corte a Laser')} disabled={loading}><span className="icon">🔥</span> Corte a Laser</button>
            <button onClick={() => handleSelectActivity('Empréstimo de Material')} disabled={loading}><span className="icon">🛠️</span> Empréstimo de Material</button>
            <button onClick={() => handleSelectActivity('Registro de Visita')} disabled={loading}><span className="icon">👁️</span> Apenas Visita</button>
          </div>
        </div>
      )}

      {/* TELA DE SUCESSO */}
      {session && step === 'SUCCESS' && (
        <div className="form-card success-card">
          <div className="success-icon">🎉</div>
          <h2>Check-in Confirmado!</h2>
          <p>A sua atividade foi registada. Fale com um monitor para libertar o seu acesso.</p>
          <button onClick={() => setStep('ACTIVITY')}>Realizar outra atividade</button>
        </div>
      )}
    </div>
  );
}

export default App;