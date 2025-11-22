import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function SignUp() {
  const navigate = useNavigate();
  const { registerUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
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
        // Se o login foi automático (Confirmação de email desligada), 
        // o AppContext vai detetar a mudança de estado e redirecionar.
        // Apenas mostramos um sucesso rápido.
        setSuccess(true);
      } else {
        // Se precisa de confirmação de email
        setSuccess(true);
        setError('Conta criada! Verifique o seu email para confirmar.');
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
      setLoading(false);
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

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
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
