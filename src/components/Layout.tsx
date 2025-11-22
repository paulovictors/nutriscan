import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Scan, Dumbbell, User, History } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const location = useLocation();
  const isScanPage = location.pathname === '/scan';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 max-w-md mx-auto">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-emerald-600" : "text-gray-400")}
        >
          <Home size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Início</span>
        </NavLink>

        <NavLink 
          to="/history" 
          className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-emerald-600" : "text-gray-400")}
        >
          <History size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Histórico</span>
        </NavLink>

        <NavLink 
          to="/scan" 
          className="relative -top-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-transform active:scale-95"
        >
          <Scan size={28} strokeWidth={2.5} />
        </NavLink>

        <NavLink 
          to="/workouts" 
          className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-emerald-600" : "text-gray-400")}
        >
          <Dumbbell size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Treinos</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-emerald-600" : "text-gray-400")}
        >
          <User size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Perfil</span>
        </NavLink>
      </nav>
    </div>
  );
}
