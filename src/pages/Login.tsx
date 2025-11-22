import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { AlertCircle } from 'lucide-react';

export function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Não fazemos navigate() aqui.
      // O AppContext vai detetar o login e o App.tsx vai redirecionar automaticamente.
    } catch (err: any) {
      console.error("Login error:", err);
      setLoading(false); // Só paramos o loading se der erro. Se for sucesso, o componente será desmontado.
      
      if (
        err.code === 'invalid_credentials' || 
        err.message.includes('Invalid login credentials') ||
        err.message.includes('Invalid login')
      ) {
        setError("Email ou palavra-passe incorretos.");
      } else if (
        err.code === 'email_not_confirmed' || 
        err.message.includes('Email not confirmed')
      ) {
        setError("Email não confirmado. Verifique a sua caixa de entrada.");
      } else {
        setError(err.message || "Ocorreu um erro inesperado.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6 max-w-md mx-auto">
      <div className="mb-10 text-center flex flex-col items-center">
        <Logo size="lg" className="mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
        <p className="text-gray-500 mt-2">Aceda à sua dieta personalizada.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span className="leading-tight font-medium">{error}</span>
          </div>
        )}

        <Input 
          label="Email" 
          type="email" 
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <Button className="w-full h-12 text-lg" type="submit" isLoading={loading}>
          Entrar
        </Button>
      </form>

      <div className="mt-8 text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Ou</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          Ainda não tem conta?{' '}
          <Link to="/signup" className="text-emerald-600 font-bold hover:underline ml-1">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
