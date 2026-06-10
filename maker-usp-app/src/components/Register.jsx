import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Register({ onBackToLogin, showMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [howKnew, setHowKnew] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const interestsOptions = ['Educação', 'STEAM', 'Impressão 3D', 'Comunidade Caninos', 'Espaço Maker'];

  const handleInterestChange = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.registerUser({
        email,
        password,
        fullName,
        phone,
        institution,
        interests: selectedInterests,
        howKnew,
        userProfile
      });
      showMessage('Conta criada com sucesso!', 'success');
    } catch (err) {
      showMessage(`Erro ao cadastrar: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h2>Criar Conta</h2>
      <p>Preencha os dados abaixo para se registar no Maker USP.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 chars" />
        </div>
      </div>

      <label>Nome Completo</label>
      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

      <label>Telefone / WhatsApp</label>
      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <label>Instituição / Organização</label>
      <input type="text" value={institution} placeholder="Ex: Poli-USP, FAU, Externa..." onChange={(e) => setInstitution(e.target.value)} required />

      <label>Seu Perfil</label>
      <select value={userProfile} onChange={(e) => setUserProfile(e.target.value)} required>
        <option value="">Selecione...</option>
        <option value="Aluno">Aluno</option>
        <option value="Docente">Docente</option>
        <option value="Pesquisador">Pesquisador</option>
        <option value="Voluntário">Voluntário</option>
      </select>

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
      
      <button type="button" onClick={() => navigate('/login')} className="btn-secondary link-style">
        ← Voltar para o Login
      </button>
    </form>
  );
}