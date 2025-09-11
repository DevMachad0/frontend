import './css/App.css';
import { useState, useContext } from 'react';
import logo from './images/logo.png';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SimplicioPage from './pages/home';
import ListaAgentesPage from './pages/lista_agentes';
import { AgentFormPage } from './pages/add_agente';
import { ListaAnexoPage } from './pages/lista_anexo';
import AtendimentosPage from './pages/atendimentos';
import { AuthProvider, AuthContext } from './auth/AuthProvider';
import { NotificationProvider } from './components/notifications/NotificationProvider';
import { ConfirmProvider } from './components/confirm/ConfirmProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import ConfiguracoesPage from './pages/configuracoes';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email === '' || senha === '') {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    try {
      await login(email, senha);
      setError('');
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Erro ao autenticar');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-circle">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <label className="login-label">Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="Seu Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label className="login-label" style={{ marginTop: 16 }}>Senha</label>
          <div className="senha-wrapper">
            <input
              className="login-input senha-input"
              type={mostrarSenha ? "text" : "password"}
              placeholder="Sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
            <button
              type="button"
              className="senha-eye-btn"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              tabIndex={0}
              aria-label="Mostrar senha"
            >
              <svg width="22" height="22" fill="#000000ff" viewBox="0 0 24 24">
                <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z"/>
              </svg>
            </button>
          </div>
          <div className="login-links">
            <a href="#" className="login-link">Esqueci a senha</a>
          </div>
          {error && <span className="login-error">{error}</span>}
          <button className="login-btn" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ConfirmProvider>
            <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<ProtectedRoute><SimplicioPage /></ProtectedRoute>} />
          <Route path="/agentes" element={<ProtectedRoute><ListaAgentesPage /></ProtectedRoute>} />
          <Route path="/add-agente" element={<ProtectedRoute><AgentFormPage /></ProtectedRoute>} />
          <Route path="/anexos" element={<ProtectedRoute><ListaAnexoPage /></ProtectedRoute>} />
          <Route path="/atendimentos" element={<ProtectedRoute><AtendimentosPage /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
            </Routes>
          </ConfirmProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
