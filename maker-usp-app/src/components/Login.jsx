import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login({ onRegisterClick, showMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await api.login(email, password);
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h2>Login</h2>
      <p>Faça login para realizar o seu check-in.</p>
      
      <label>E-mail</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

      <label>Senha</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

      <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      
      <div className="toggle-container">
        <p>Ainda não tem conta?</p>
        <button type="button" onClick={() => navigate('/registro')} className="btn-secondary">
          Criar Conta Grátis
        </button>
      </div>
    </form>
  );
}