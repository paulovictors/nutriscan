import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { AlertCircle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

export function SignUp() {
  const navigate = useNavigate();
  const { registerUser, isDemoMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [configError, setConfigError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConfigError(false);
    
    if (password !== confirmPassword) {
      setError('As passwords não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const isLoggedIn = await registerUser(email, password);
      
      if (isLoggedIn) {
        // Se o registo fez login automático, mostramos sucesso brevemente
        setSuccess(true);
        // O redirecionamento acontecerá via Auth State Change no AppContext
      } else {
        setSuccess(true);
        setError('Conta criada! Verifique o seu email para confirmar.');
      }

    } catch (err: any) {
      console.error("Erro no registo:", err);
      setLoading(false);

      // Tratamento específico para Email Provider Disabled
      if (
        err.code === 'email_provider_disabled' || 
        (err.message && err.message.includes('Email signups are disabled')) ||
        (err.message && err.message.includes('Signups not allowed for this instance'))
      ) {
        setError('O registo por Email está desativado no seu projeto Supabase.');
        setConfigError(true);
      } else if (err.message && err.message.includes('Database error')) {
        setError('Erro de conexão com o banco de dados. Verifique se as tabelas foram criadas.');
      } else if (err.message && err.message.includes('User already registered')) {
        setError('Este email já está registado. Tente fazer login.');
      } else {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta Criada!</h2>
        <p className="text-gray-500">
          {error ? error : "A preparar o seu perfil..."}
        </p>
        {!error && (
          <p className="text-xs text-gray-400 mt-4 animate-pulse">A redirecionar...</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6 max-w-md mx-auto">
      <div className="mb-10 text-center flex flex-col items-center">
        <Logo size="md" className="mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
        <p className="text-gray-500 mt-2">Comece a sua jornada saudável hoje.</p>
      </div>

      {isDemoMode && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-3 border border-blue-100">
          <Info size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold block mb-1">Modo de Demonstração</span>
            O backend (Supabase) não está conectado. Os seus dados serão salvos apenas neste navegador.
          </div>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${configError ? 'bg-amber-50 text-amber-800 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {configError ? <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />}
            <div>
              <span className="font-bold block mb-1">{configError ? 'Configuração Necessária' : 'Erro'}</span>
              {error}
              {configError && (
                <div className="mt-2 text-xs bg-white/50 p-2 rounded border border-amber-200">
                  Aceda ao <b>Supabase Dashboard</b> {'>'} <b>Authentication</b> {'>'} <b>Providers</b> {'>'} <b>Email</b> e ative a opção <b>Enable Email provider</b>.
                </div>
              )}
            </div>
          </div>
        )}

        <Input 
          label="Email" 
          type="email" 
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        
        <Input 
          label="Password" 
          type="password" 
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <Input 
          label="Confirmar Password" 
          type="password" 
          placeholder="Repita a password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />

        <Button className="w-full h-12 text-lg" type="submit" isLoading={loading}>
          Cadastrar
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline ml-1">
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  );
}
