import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Workouts } from './pages/Workouts';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Loader2 } from 'lucide-react';

// Componente de Loading Global
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );
}

// Rota Protegida: Só acessível se logado E com perfil completo
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();
  
  if (isLoading) return <LoadingScreen />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

// Rota de Onboarding: Só acessível se logado mas SEM perfil
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isOnboarded) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Rota Pública: Só acessível se NÃO estiver logado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();

  // IMPORTANTE: Se estiver carregando, mostramos o spinner para evitar "piscar" a tela de login
  // antes de redirecionar o usuário logado.
  if (isLoading) return <LoadingScreen />;

  if (user) {
    return <Navigate to={user.isOnboarded ? "/" : "/onboarding"} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
