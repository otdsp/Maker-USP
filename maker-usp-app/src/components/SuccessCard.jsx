import { useNavigate } from 'react-router-dom';

export default function SuccessCard() {
  const navigate = useNavigate();

  return (
    <div className="form-card success-card">
      <div className="success-icon">🎉</div>
      <h2>Check-in Confirmado!</h2>
      <p>A sua atividade foi registada. Fale com um monitor para libertar o seu acesso.</p>
      <button onClick={() => navigate('/atividades')}>Realizar outra atividade</button>
    </div>
  );
}