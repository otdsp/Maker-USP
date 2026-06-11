import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import logoImg from './assets/maker-usp-logo.jpeg';
import './App.css';

import Login from './components/Login';
import Register from './components/Register';
import ActivitySelection from './components/ActivitySelection';
import SuccessCard from './components/SuccessCard';

function App() {
  const [session, setSession] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Monitora a sessão ativa inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingApp(false);
      
      // Se o usuário já estiver logado e tentar entrar nas páginas de auth, joga para atividades
      if (session && (location.pathname === '/login' || location.pathname === '/registro' || location.pathname === '/')) {
        navigate('/atividades');
      }
    });

    // 2. Escuta eventos globais de login/logout do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (session) {
        if (location.pathname === '/login' || location.pathname === '/registro' || location.pathname === '/') {
          navigate('/atividades');
        }
      } else {
        // Só redireciona para o login se ele NÃO estiver na página de registro
        if (location.pathname !== '/registro') {
          navigate('/login');
        }
      }
  });

  return () => subscription.unsubscribe();
}, [navigate, location.pathname]);

  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  if (loadingApp) return <div className="container"><p style={{textAlign: 'center'}}>A carregar...</p></div>;

  return (
    <div className="container">
      <header className="header">
        <img src={logoImg} alt="Logo Maker USP" className="logo" />
      </header>

      {message.text && (
        <p className="error-message" style={{ 
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fff5f5', 
          color: message.type === 'success' ? '#166534' : '#e53e3e', 
          borderColor: message.type === 'success' ? '#bbf7d0' : '#fed7d7' 
        }}>
          {message.text}
        </p>
      )}

      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={!session ? <Login showMessage={showMessage} /> : <Navigate to="/atividades" />} />
        <Route path="/registro" element={!session ? <Register showMessage={showMessage} /> : <Navigate to="/atividades" />} />
        
        {/* Rotas Privadas (Exigem Login) */}
        <Route path="/atividades" element={session ? <ActivitySelection session={session} showMessage={showMessage} /> : <Navigate to="/login" />} />
        <Route path="/sucesso" element={session ? <SuccessCard /> : <Navigate to="/login" />} />

        {/* Redirecionamento Padrão */}
        <Route path="*" element={<Navigate to={session ? "/atividades" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;