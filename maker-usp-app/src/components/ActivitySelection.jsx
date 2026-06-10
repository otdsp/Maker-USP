import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ActivitySelection({ session, onCheckInSuccess, showMessage }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleSelectActivity = async (activityType) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.createActivity(session.user.id, activityType);
      navigate('/sucesso');
    } catch (err) {
      showMessage(`Erro ao registrar: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="card-header-flex">
        <div>
          <h2>Bem-vindo(a)! 👋</h2>
          <p>O que vai realizar hoje no Maker USP?</p>
        </div>
        <button onClick={api.logout} className="btn-logout">Sair</button>
      </div>
      
      <div className="grid-buttons">
        <button onClick={() => handleSelectActivity('Impressão 3D')} disabled={loading}><span className="icon">🖨️</span> Impressão 3D</button>
        <button onClick={() => handleSelectActivity('Corte a Laser')} disabled={loading}><span className="icon">🔥</span> Corte a Laser</button>
        <button onClick={() => handleSelectActivity('Empréstimo de Material')} disabled={loading}><span className="icon">🛠️</span> Empréstimo de Material</button>
        <button onClick={() => handleSelectActivity('Registro de Visita')} disabled={loading}><span className="icon">👁️</span> Apenas Visita</button>
      </div>
    </div>
  );
}