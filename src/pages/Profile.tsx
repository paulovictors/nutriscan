import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Settings, LogOut } from 'lucide-react';

export function Profile() {
  const { user, resetData, updateUser } = useApp();

  if (!user) return null;

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 text-sm">Membro desde 2025</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
            <User size={20} className="text-emerald-500" />
            <h3>Dados Pessoais</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Peso (kg)" 
              type="number" 
              value={user.weight} 
              onChange={(e) => updateUser({ weight: Number(e.target.value) })}
            />
            <Input 
              label="Altura (cm)" 
              type="number" 
              value={user.height} 
              onChange={(e) => updateUser({ height: Number(e.target.value) })}
            />
          </div>
          <Input 
            label="Idade" 
            type="number" 
            value={user.age} 
            onChange={(e) => updateUser({ age: Number(e.target.value) })}
          />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
            <Settings size={20} className="text-emerald-500" />
            <h3>Metas</h3>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-600">Taxa Metabólica Basal</span>
            <span className="font-bold text-gray-900">{Math.round(user.bmr)} kcal</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-sm font-medium text-emerald-900">Meta Diária</span>
            <span className="font-bold text-emerald-700">{Math.round(user.dailyCalorieGoal)} kcal</span>
          </div>
        </div>

        <Button 
          variant="danger" 
          className="w-full" 
          onClick={resetData}
        >
          <LogOut className="mr-2 w-4 h-4" /> Apagar Dados e Sair
        </Button>
      </div>
    </div>
  );
}
