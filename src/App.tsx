import React, { useState, useCallback } from 'react';
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
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion';

// Rota Protegida: Só acessível se logado E com perfil completo
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  
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
  const { user } = useApp();

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
  const { user } = useApp();

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

function AppContent() {
  const { isLoading } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  // Callback chamado pela SplashScreen quando a animação de 100% termina
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen 
            key="splash" 
            isAppReady={!isLoading} 
            onAnimationComplete={handleSplashComplete}
          />
        )}
      </AnimatePresence>
      
      {/* Renderiza a app apenas quando o splash terminar para evitar flashes */}
      {!showSplash && (
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      )}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
